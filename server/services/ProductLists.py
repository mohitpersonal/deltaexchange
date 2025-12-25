import json
import requests
from services.db_connect import get_db_connection 
from flask import Blueprint, jsonify
from config import API_BASE_URL

productlists_bp = Blueprint("productlists", __name__)
def map_product_to_row(product: dict) -> dict:
    """Extract fields from API JSON into DB row dict"""
    return {
        "id": product.get("id"),
        "symbol": product.get("symbol"),
        "contract_type": product.get("contract_type"),
        "state": product.get("state"),
        "strike_price": product.get("strike_price"),
        "taker_commission_rate": product.get("taker_commission_rate"),
        "short_description": product.get("short_description"),
        "backup_vol_expiry_time": str((product.get("product_specs") or {}).get("backup_vol_expiry_time")),
        "leverage_slider_values": json.dumps((product.get("ui_config") or {}).get("leverage_slider_values")),
        "api_json_response": json.dumps(product),  # full JSON blob
        "tick_size": product.get("tick_size"),
    }


UPSERT_SQL = """
INSERT INTO products_details (
  id,
  symbol,
  contract_type,
  state,
  strike_price,
  taker_commission_rate,
  short_description,
  backup_vol_expiry_time,
  leverage_slider_values,
  api_json_response,
  tick_size
) VALUES (
  %(id)s,
  %(symbol)s,
  %(contract_type)s,
  %(state)s,
  %(strike_price)s,
  %(taker_commission_rate)s,
  %(short_description)s,
  %(backup_vol_expiry_time)s,
  %(leverage_slider_values)s,
  %(api_json_response)s,
  %(tick_size)s
)
ON DUPLICATE KEY UPDATE
  symbol = VALUES(symbol),
  contract_type = VALUES(contract_type),
  state = VALUES(state),
  strike_price = VALUES(strike_price),
  taker_commission_rate = VALUES(taker_commission_rate),
  short_description = VALUES(short_description),
  backup_vol_expiry_time = VALUES(backup_vol_expiry_time),
  leverage_slider_values = VALUES(leverage_slider_values),
  api_json_response = VALUES(api_json_response),
  tick_size = VALUES(tick_size);
"""
def ingest_products():
    conn = get_db_connection()
    cur = conn.cursor()
    param = {"contract_types": "call_options,put_options", "states": "live,upcoming"}
    path = "/v2/products"
    url = f"{API_BASE_URL}{path}"
    response = requests.get(url, params=param)
    response.raise_for_status()
    data = response.json()

    # Debug
    print("API response keys:", data.keys())

    products = data.get("result") or data.get("products") or data.get("data") or []
    print("Products length:", len(products))

    inserted = 0
    for product in products:
        row = map_product_to_row(product)
        cur.execute(UPSERT_SQL, row)
        inserted += 1
        print("Inserted row:", row["id"], row["symbol"])

    conn.commit()  # <-- ensure commit
    conn.close()
    return {"inserted_or_updated": inserted}

@productlists_bp.route("/product_lists", methods=["POST", "GET"])
def ingest_route():
    try:
        stats = ingest_products()
        return jsonify({"status": "ok", **stats}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# if __name__ == "__main__":
#     productlists_bp.run(host="0.0.0.0", port=5000, debug=True)