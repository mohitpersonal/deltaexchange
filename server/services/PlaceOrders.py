import time
import datetime
import requests
import json
from flask import Blueprint, jsonify, request
from services.db_connect import get_db_connection, fetch_values, fetch_one_value
from helpers.common import generate_signature, token_required
from config import API_BASE_URL

place_order_bp = Blueprint("place_order", __name__)

# expiries = ["1 Day", "3 Day", "7 Day", "30 Day"]

# ✅ Endpoints
@place_order_bp.route("/place-order/coinname", methods=["GET"])
@token_required
def get_coin_names(user_id):
    return jsonify(fetch_values("SELECT coin_id, coin_name from coin_name WHERE status=1"))

@place_order_bp.route("/place-order/calls-puts", methods=["GET"])
@token_required
def get_calls_puts(user_id):
    return jsonify(fetch_values("SELECT id,calls_puts FROM calls_puts where status=1"))

@place_order_bp.route("/place-order/expiry", methods=["GET"])
@token_required
def get_expiries(user_id):
    contract_type = request.args.get("contract_type")  # CE or PE
    strike_price = request.args.get("strikeSelections")
    ct = "call_options" if contract_type == "Call" else "put_options"

    rows = fetch_values( "SELECT id, settlement_time AS expired_date " "FROM products_details WHERE strike_price=%s AND contract_type=%s AND settlement_time > NOW() order by settlement_time ASC", (strike_price, ct,) ) 
    #rows = fetch_values( "SELECT id, DATE_FORMAT(settlement_time, '%%Y-%%m-%%d') AS expired_date " "FROM products_details WHERE strike_price=%s AND contract_type=%s", (strike_price, ct,) ) 
    return jsonify(rows)

@place_order_bp.route("/place-order/strike-selection", methods=["GET"])
@token_required
def get_strike_selections(user_id):
    contract_type = request.args.get("contract_type")  # CE or PE
    ct = "call_options" if contract_type == "Call" else "put_options"

    return jsonify(fetch_values(
        "SELECT DISTINCT strike_price AS name FROM products_details WHERE contract_type=%s AND settlement_time > NOW() order by strike_price ASC",
        (ct,)
    ))

@place_order_bp.route("/place-order/qty-type", methods=["GET"])
@token_required
def get_quantity_types(user_id):
    return jsonify(fetch_values("SELECT quantity_type_id,quantity_type FROM quantity_type WHERE status=1"))

@place_order_bp.route("/place-order/qty-percent", methods=["GET"])
@token_required
def get_percentages(user_id):
    return jsonify(fetch_values("SELECT qty_percent_id, qty_percent_name FROM quantity_percentage WHERE status=1"))

@place_order_bp.route("/place-order/qty-unit", methods=["GET"])
@token_required
def get_lots(user_id):
    return jsonify(fetch_values("SELECT qty_unit_id, quantity_unit_name FROM quantity_unit where status=1"))


@place_order_bp.route("/place-order/order-preview-lists", methods=["GET"])
@token_required
def get_order_preview_lists(user_id):
    product_id = request.args.get("expiry")

    if not product_id:
        return jsonify({"error": "expiry parameter is required"}), 400

    data = fetch_one_value(
        "SELECT id, symbol, settlement_time FROM products_details WHERE id=%s",
        (product_id,)
    )

    if not data:
        return jsonify({"error": "No product found"}), 404

    return jsonify(data)

# PLACE ORDER API    
def place_order_for_client(clients, form_data, user_id):
    def safe_float(value):
        try:
            return float(value)
        except (TypeError, ValueError):
            return None   # or 0.0 if you prefer a default

    method = "POST"
    timestamp = str(int(time.time()))  # seconds
    path = "/v2/orders"
    url = f"{API_BASE_URL}{path}"

    product_id = form_data['expiry']
    symbol = form_data['symbol']
    side = str(form_data['ordertype']).lower()

    # default values
    size = ''

    if form_data['quantitytype'] == 'absolute':
        size = form_data['quantityabs']

    payload = {
        "product_id": product_id,
        "product_symbol": symbol,
        "size": size,
        "side": side,
        "order_type": "market_order"
    }

    api_secret = clients['api_secret']
    api_key = clients['api_key']

    # Convert dict to JSON string for signature and request body
    payload_str = json.dumps(payload, separators=(",", ":"))

    signature_data = method + timestamp + path + payload_str
    signature = generate_signature(api_secret, signature_data)

    req_headers = {
        "api-key": api_key,
        "timestamp": timestamp,
        "signature": signature,
        "User-Agent": "python-rest-client",
        "Content-Type": "application/json",
    }

    try:
        response = requests.request(
            method,
            url,
            data=payload_str,   # send JSON string
            params={},
            headers=req_headers,
            timeout=(3, 27),
        )
        #response = {"meta":{},"result":{"margin_mode":"isolated","client_order_id":None,"commission":"0","bracket_order":None,"unfilled_size":0,"state":"closed","average_fill_price":"105","bracket_trail_amount":None,"product_symbol":"C-BTC-83600-030226","id":1149547182,"stop_price":None,"mmp":"disabled","meta_data":{"cashflow":"-0.42","ip":"2405:201:38:30c0:9146:56ee:2980:5a18","otc":false,"pnl":"-0","source":"api"},"U":"0.017346","created_at":"2026-02-01T10:59:34.295899Z","order_type":"market_order","bracket_take_profit_price":None,"limit_price":"924.4","updated_at":"2026-02-01T10:59:34.363312Z","reduce_only":false,"cancellation_reason":None,"product_id":119551,"stop_order_type":None,"quote_size":None,"stop_trigger_method":None,"user_id":39492677,"trail_amount":None,"side":"buy","bracket_stop_loss_price":None,"size":4,"time_in_force":"ioc","bracket_stop_loss_limit_price":None,"bracket_take_profit_limit_price":None},"success":true}
        # response = {
        #         "meta": {},
        #         "result": {
        #             "margin_mode": "isolated",
        #             "client_order_id": None,
        #             "commission": "0",
        #             "bracket_order": None,
        #             "unfilled_size": 0,
        #             "state": "closed",
        #             "average_fill_price": "105",
        #             "bracket_trail_amount": None,
        #             "product_symbol": "C-BTC-83600-030226",
        #             "id": 1149547182,
        #             "stop_price": None,
        #             "mmp": "disabled",
        #             "meta_data": {
        #             "cashflow": "-0.42",
        #             "ip": "2405:201:38:30c0:9146:56ee:2980:5a18",
        #             "otc": False,   # ✅ Python boolean
        #             "pnl": "-0",
        #             "source": "api"
        #             },
        #             "U": "0.017346",
        #             "created_at": "2026-02-01T10:59:34.295899Z",
        #             "order_type": "market_order",
        #             "limit_price": "924.4",
        #             "updated_at": "2026-02-01T10:59:34.363312Z",
        #             "reduce_only": False,   # ✅ Python boolean
        #             "product_id": 119551,
        #             "user_id": 39492677,
        #             "side": "buy",
        #             "size": 4,
        #             "time_in_force": "ioc"
        #         },
        #         "success": True   # ✅ Python boolean
        #         }

        print("Response text:", response.text)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print("Error occurred:", str(e))
        return {"error": str(e)}

@place_order_bp.route("/place-order/placed-order", methods=["POST"])
@token_required
def place_order_successfully(user_id):
    form_data = request.json.get("formData", {})
    selected_clients = request.json.get("selectedClients", [])
    print("Form Data", form_data)
    print("Client details", selected_clients)

    if not form_data or not selected_clients:
        return jsonify({"error": "Missing formData or selectedClients"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    results = []
    for client in selected_clients:
        client_id = client.get("id")
        print("Client id", client_id)

        cursor.execute(
            "SELECT client_id, name, api_key, api_secret FROM clients WHERE client_id=%s and status=1",
            (client_id,)
        )
        client_row = cursor.fetchone()
        if not client_row:
            results.append({"client_id": client_id, "error": "Client not found"})
            continue

        result = place_order_for_client(client_row, form_data, user_id)

        # ✅ Success case: insert into order_details
        if isinstance(result, dict) and result.get("success"):
            order = result.get("result", {})
            cursor.execute(
                """INSERT INTO order_details 
                   (id, client_id, user_id, product_id, product_symbol, side, size, order_type, state, average_fill_price, created_at, updated_at) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    order.get("id"),
                    client_id,
                    user_id,
                    order.get("product_id"),
                    order.get("product_symbol"),
                    order.get("side"),
                    order.get("size"),
                    order.get("order_type"),
                    order.get("state"),
                    order.get("average_fill_price"),
                    order.get("created_at"),
                    order.get("updated_at"),
                )
            )
            conn.commit()
            results.append({"client_id": client_id, "success": True})

        # ❌ Error case: insert into api_log_history
        else:
            error_msg = result.get("error", "Unknown error")
            cursor.execute(
                """INSERT INTO api_log_history 
                   (client_id, api_name, error, updated_by, lastupdated) 
                   VALUES (%s, %s, %s, %s, NOW())""",
                (client_id, "/v2/orders", error_msg, user_id)
            )
            conn.commit()
            results.append({"client_id": client_id, "success": False, "error": error_msg})

    cursor.close()
    conn.close()

    return jsonify(results)
