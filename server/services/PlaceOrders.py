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

    rows = fetch_values( "SELECT id, settlement_time AS expired_date " "FROM products_details WHERE strike_price=%s AND contract_type=%s", (strike_price, ct,) ) 
    #rows = fetch_values( "SELECT id, DATE_FORMAT(settlement_time, '%%Y-%%m-%%d') AS expired_date " "FROM products_details WHERE strike_price=%s AND contract_type=%s", (strike_price, ct,) ) 
    return jsonify(rows)

@place_order_bp.route("/place-order/strike-selection", methods=["GET"])
@token_required
def get_strike_selections(user_id):
    contract_type = request.args.get("contract_type")  # CE or PE
    ct = "call_options" if contract_type == "Call" else "put_options"

    return jsonify(fetch_values(
        "SELECT id, strike_price FROM products_details WHERE contract_type=%s",
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
    print("From Data",form_data)
    print("Client details",selected_clients)

    if not form_data or not selected_clients:
        return jsonify({"error": "Missing formData or selectedClients"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    results = []
    for client in selected_clients:
        client_id = client.get("id")
        print("Client id",client_id)
        cursor.execute("SELECT client_id, name, api_key, api_secret FROM clients WHERE client_id=%s and status=1", client_id,)
        clients = cursor.fetchone()
        result = place_order_for_client(clients, form_data, user_id)
        results.append({"client_id": client_id, **result})
    
    # return form_data,selected_clients
    #     result = place_order_for_client(client_id, form_data, user_id)
    #     results.append({"client_id": client_id, **result})

    # return jsonify({
    #     "summary": results,
    #     "success_count": sum(1 for r in results if r["success"]),
    #     "failure_count": sum(1 for r in results if not r["success"])
    # }), 200


# if __name__ == "__main__":
#     place_order_bp.run(debug=True)
