import time
import requests
from flask import Blueprint, jsonify, request
from services.db_connect import get_db_connection, fetch_values
from helpers.common import generate_signature, token_required
from config import API_BASE_URL

place_order_bp = Blueprint("place_order", __name__)

expiries = ["1 Day", "3 Day", "7 Day", "30 Day"]

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
    return jsonify(expiries)
    #return jsonify(fetch_values("SELECT id, label FROM expiries"))

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

# if __name__ == "__main__":
#     place_order_bp.run(debug=True)
