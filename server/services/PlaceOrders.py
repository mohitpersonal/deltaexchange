import time
import requests
from flask import Blueprint, jsonify, request
from services.db_connect import get_db_connection, fetch_values
from helpers.common import generate_signature
from config import API_BASE_URL

place_order_bp = Blueprint("place_order", __name__)

expiries = ["1 Day", "3 Day", "7 Day", "30 Day"]

# ✅ Endpoints
@place_order_bp.route("/place-order/coinname", methods=["GET"])
def get_coin_names():
    return jsonify(fetch_values("SELECT coin_id, coin_name from coin_name WHERE status=1"))

@place_order_bp.route("/place-order/calls-puts", methods=["GET"])
def get_calls_puts():
    return jsonify(fetch_values("SELECT id,calls_puts FROM calls_puts where status=1"))

@place_order_bp.route("/place-order/expiry", methods=["GET"])
def get_expiries():
    return jsonify(expiries)
    #return jsonify(fetch_values("SELECT id, label FROM expiries"))

@place_order_bp.route("/place-order/strike-selection", methods=["GET"])
def get_strike_selections():
    contract_type = request.args.get("contract_type")  # CE or PE
    ct = "call_options" if contract_type == "Call" else "put_options"

    return jsonify(fetch_values(
        "SELECT id, strike_price FROM products_details WHERE contract_type=%s",
        (ct,)
    ))

@place_order_bp.route("/place-order/qty-type", methods=["GET"])
def get_quantity_types():
    return jsonify(fetch_values("SELECT quantity_type_id,quantity_type FROM quantity_type WHERE status=1"))

@place_order_bp.route("/place-order/qty-percent", methods=["GET"])
def get_percentages():
    return jsonify(fetch_values("SELECT qty_percent_id, qty_percent_name FROM quantity_percentage WHERE status=1"))

@place_order_bp.route("/place-order/qty-unit", methods=["GET"])
def get_lots():
    return jsonify(fetch_values("SELECT qty_unit_id, quantity_unit_name FROM quantity_unit where status=1"))

# if __name__ == "__main__":
#     place_order_bp.run(debug=True)
