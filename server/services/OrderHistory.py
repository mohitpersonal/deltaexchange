import time
import requests
from flask import Blueprint, jsonify
from services.db_connect import get_db_connection
from helpers.common import generate_signature
from config import API_BASE_URL

orders_history_bp = Blueprint("orders_history", __name__)

def signed_get_no_params(api_key, api_secret, path, params=None):
    """
    Perform a GET with proper signing that excludes query params if the API
    signature scheme does not require them. Only include the cursor param in the URL.
    """
    method = 'GET'
    timestamp = str(int(time.time()))
    payload = ''  # do not include params in signature payload
    signature_data = method + timestamp + path + payload
    signature = generate_signature(api_secret, signature_data)

    headers = {
        'api-key': api_key,
        'timestamp': timestamp,
        'signature': signature,
        'User-Agent': 'python-rest-client',
        'Content-Type': 'application/json'
    }

    resp = requests.get(f"{API_BASE_URL}{path}", params=(params or {}), headers=headers, timeout=(3, 27))
    resp.raise_for_status()
    return resp.json()


def fetch_all_orders(api_key, api_secret):
    """
    Fetch all orders using cursor-based pagination without passing 'limit' in the URL.
    Relies on server-side default limit returned in meta.
    """
    path = '/v2/orders/history'
    all_orders = []
    after = None
    safety_pages = 0
    max_pages = 200  # safety guard
    
    while True:
        params = {}
        if after:
            params["after"] = after  # only include cursor if present

        data = signed_get_no_params(api_key, api_secret, path, params)
        #print("data",data)
        #orders_wrap = data.get("orders", {}) or {}
        orders = data.get("result", []) or []
        #print("Orders",orders)
        meta = data.get("meta", {}) or {}

        if not isinstance(orders, list):
            return {"error": "Unexpected response shape", "raw": data}

        # collect
        all_orders.extend(orders)
        #print("all_orders",all_orders)
        # pagination
        after = meta.get("after")
        total_count = meta.get("total_count", len(all_orders))

        safety_pages += 1
        if safety_pages >= max_pages:
            break

        # stop when no next cursor or we already reached total_count
        if not after or len(all_orders) >= total_count:
            break

    return all_orders


@orders_history_bp.route("/order-history/<int:client_id>", methods=["GET"])
def open_orders_route(client_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT client_id, name, api_key, api_secret FROM clients WHERE client_id=%s AND status=1",
            (client_id,)
        )
        client = cursor.fetchone()
        if not client:
            return jsonify({"error": "Client not found"}), 404

        api_key = client['api_key']
        api_secret = client['api_secret']

        # Fetch all orders without sending limit param
        orders = fetch_all_orders(api_key, api_secret)

        # If the function returned an error dict (unexpected API shape), surface it
        if isinstance(orders, dict) and orders.get("error"):
            return jsonify(orders), 502

        # Step 1: Mark all orders for this client_id as inactive (status=0)
        cursor.execute("UPDATE orders_history SET status=0 WHERE client_id=%s", (client_id,))

        # Step 2: Insert/Update fetched orders and set status=1
        for order in orders:
            cursor.execute("""
                INSERT INTO orders_history (
                    id, average_fill_price, bracket_order, bracket_stop_loss_limit_price,
                    bracket_stop_loss_price, bracket_take_profit_limit_price, bracket_take_profit_price,
                    cancellation_reason, client_order_id, commission, created_at, limit_price,
                    margin_mode, avg_exit_price, cashflow, entry_price, pnl, order_type,
                    paid_commission, product_id, product_symbol, side, size, state,
                    updated_at, user_id, client_id, status
                ) VALUES (
                    %(id)s, %(average_fill_price)s, %(bracket_order)s, %(bracket_stop_loss_limit_price)s,
                    %(bracket_stop_loss_price)s, %(bracket_take_profit_limit_price)s, %(bracket_take_profit_price)s,
                    %(cancellation_reason)s, %(client_order_id)s, %(commission)s, %(created_at)s, %(limit_price)s,
                    %(margin_mode)s, %(avg_exit_price)s, %(cashflow)s, %(entry_price)s, %(pnl)s, %(order_type)s,
                    %(paid_commission)s, %(product_id)s, %(product_symbol)s, %(side)s, %(size)s, %(state)s,
                    %(updated_at)s, %(user_id)s, %(client_id)s, 1
                )
                ON DUPLICATE KEY UPDATE
                    average_fill_price = VALUES(average_fill_price),
                    bracket_order = VALUES(bracket_order),
                    bracket_stop_loss_limit_price = VALUES(bracket_stop_loss_limit_price),
                    bracket_stop_loss_price = VALUES(bracket_stop_loss_price),
                    bracket_take_profit_limit_price = VALUES(bracket_take_profit_limit_price),
                    bracket_take_profit_price = VALUES(bracket_take_profit_price),
                    cancellation_reason = VALUES(cancellation_reason),
                    client_order_id = VALUES(client_order_id),
                    commission = VALUES(commission),
                    limit_price = VALUES(limit_price),
                    margin_mode = VALUES(margin_mode),
                    avg_exit_price = VALUES(avg_exit_price),
                    cashflow = VALUES(cashflow),
                    entry_price = VALUES(entry_price),
                    pnl = VALUES(pnl),
                    order_type = VALUES(order_type),
                    paid_commission = VALUES(paid_commission),
                    product_id = VALUES(product_id),
                    product_symbol = VALUES(product_symbol),
                    side = VALUES(side),
                    size = VALUES(size),
                    state = VALUES(state),
                    updated_at = VALUES(updated_at),
                    user_id = VALUES(user_id),
                    client_id = VALUES(client_id),
                    status = 1
            """, {
                "id": order.get("id"),
                "average_fill_price": order.get("average_fill_price"),
                "bracket_order": order.get("bracket_order"),
                "bracket_stop_loss_limit_price": order.get("bracket_stop_loss_limit_price"),
                "bracket_stop_loss_price": order.get("bracket_stop_loss_price"),
                "bracket_take_profit_limit_price": order.get("bracket_take_profit_limit_price"),
                "bracket_take_profit_price": order.get("bracket_take_profit_price"),
                "cancellation_reason": order.get("cancellation_reason"),
                "client_order_id": order.get("client_order_id"),
                "commission": order.get("commission"),
                "created_at": order.get("created_at"),
                "limit_price": order.get("limit_price"),
                "margin_mode": order.get("margin_mode"),
                "avg_exit_price": order.get("meta_data", {}).get("avg_exit_price"),
                "cashflow": order.get("meta_data", {}).get("cashflow"),
                "entry_price": order.get("meta_data", {}).get("entry_price"),
                "pnl": order.get("meta_data", {}).get("pnl"),
                "order_type": order.get("order_type"),
                "paid_commission": order.get("paid_commission"),
                "product_id": order.get("product_id"),
                "product_symbol": order.get("product_symbol"),
                "side": order.get("side"),
                "size": order.get("size"),
                "state": order.get("state"),
                "updated_at": order.get("updated_at"),
                "user_id": order.get("user_id"),
                "client_id": client_id
            })

        response = cursor.execute("SELECT * FROM orders_history WHERE client_id=%s AND user_id=%s and status=1", (client_id,order.get("user_id")))
        response = cursor.fetchall()
        print("Response:", response)
        conn.commit()
        cursor.close() 
        conn.close()

        return jsonify({"status": "success", "orders": response})
    except requests.HTTPError as http_err:
        return jsonify({"error": "HTTP error", "details": str(http_err)}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 500
