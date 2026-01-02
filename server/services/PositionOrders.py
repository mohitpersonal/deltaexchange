from flask import Flask, Blueprint, jsonify
import requests
import time
from datetime import datetime
from services.db_connect import get_db_connection
from helpers.common import generate_signature, token_required
from config import API_BASE_URL

# app = Flask(__name__)
positionorders_bp = Blueprint("positionorders", __name__)
def fetch_positions_for_client(api_key, api_secret):
    method = "GET"
    timestamp = str(int(time.time()))  # milliseconds
    path = "/v2/positions"
    query_string = "?underlying_asset_symbol=BTC"
    url = f"{API_BASE_URL}{path}"
    payload = ""  # empty string for GET

    signature_data = method + timestamp + path + query_string + payload
    signature = generate_signature(api_secret, signature_data)

    req_headers = {
        "api-key": api_key,
        "timestamp": timestamp,
        "signature": signature,
        "User-Agent": "python-rest-client",
    }
    param = {"underlying_asset_symbol": "BTC"}
    try:
        response = requests.get(url, params=param, headers=req_headers, timeout=(3, 27))
        print("Response text:", response.text)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

@positionorders_bp.route('/positions/<int:client_id>', methods=['GET'])
@token_required
def get_positions(user_id, client_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()  # if supported, else unpack tuple

        cursor.execute(
            "SELECT client_id, name, api_key, api_secret FROM clients WHERE client_id=%s AND status=1",
            (client_id,)
        )
        client = cursor.fetchone()
        if not client:
            return jsonify({"error": "Client not found"}), 404

        api_key = client["api_key"]
        api_secret = client["api_secret"]
        client_id = client["client_id"]

        resp = fetch_positions_for_client(api_key, api_secret)

        if "result" in resp and isinstance(resp["result"], list):
            current_product_ids = []
            for pos in resp["result"]:
                product_id = pos.get("product_id")
                product_symbol = pos.get("product_symbol")
                entry_price = pos.get("entry_price")
                size = pos.get("size")
                user_id = pos.get("user_id")
                last_update = datetime.utcnow()

                current_product_ids.append(product_id)

                # Check if entry exists
                cursor.execute(
                    "SELECT position_id FROM order_positions WHERE client_id=%s AND user_id=%s AND product_id=%s",
                    (client_id, user_id, product_id)
                )
                existing = cursor.fetchone()

                if existing:
                    # Update existing entry → keep status=1
                    cursor.execute(
                        """UPDATE order_positions 
                           SET product_symbol=%s, entry_price=%s, size=%s, user_id=%s, status=1, lastupdate=%s 
                           WHERE client_id=%s AND product_id=%s""",
                        (product_symbol, entry_price, size, user_id, last_update, client_id, product_id)
                    )
                else:
                    # Insert new entry → status=1
                    cursor.execute(
                        """INSERT INTO order_positions 
                           (client_id, product_id, product_symbol, entry_price, size, user_id, status, lastupdate) 
                           VALUES (%s, %s, %s, %s, %s, %s, 1, %s)""",
                        (client_id, product_id, product_symbol, entry_price, size, user_id, last_update)
                    )

            # ✅ Mark inactive any positions not in current API response
            if current_product_ids:
                cursor.execute(
                    """UPDATE order_positions 
                       SET status=0, lastupdate=%s 
                       WHERE client_id=%s AND product_id NOT IN (%s)""",
                    (last_update, client_id, ",".join(str(pid) for pid in current_product_ids))
                )

            conn.commit()

        cursor.close()
        conn.close()
        return jsonify(resp)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# if __name__ == '__main__':
#     positionorders_bp.run(host="0.0.0.0", port=5000, debug=True)