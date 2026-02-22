from flask import Flask, Blueprint, jsonify
import requests
import time
import json
from datetime import datetime
from services.db_connect import get_db_connection
from helpers.common import generate_signature, token_required
from config import API_BASE_URL

# app = Flask(__name__)
positionorders_bp = Blueprint("positionorders", __name__)
def fetch_positions_for_client(api_key, api_secret, coinnames):
    """
    coinnames: list of symbols, e.g. ["ETH", "BTC"]
    """
    all_results = []
    for coinname in coinnames:
        method = "GET"
        timestamp = str(int(time.time()))  # milliseconds
        path = "/v2/positions"
        query_string = f"?underlying_asset_symbol={coinname}"
        url = f"{API_BASE_URL}{path}{query_string}"
        payload = ""  # empty string for GET

        signature_data = method + timestamp + path + query_string + payload
        signature = generate_signature(api_secret, signature_data)

        req_headers = {
            "api-key": api_key,
            "timestamp": timestamp,
            "signature": signature,
            "User-Agent": "python-rest-client",
        }

        # param = {"underlying_asset_symbol": coinname}
        try:
            response = requests.get(url, headers=req_headers, timeout=(3, 27))
            print(f"Response for {coinname}:", response.text)
            response.raise_for_status()
            data = response.json()
            # Attach coinname for clarity
            all_results.append({coinname: data})
        except Exception as e:
            all_results.append({coinname: {"error": str(e)}})

    return all_results

@positionorders_bp.route('/positions/<int:client_id>', methods=['GET'])
@token_required
def get_positions(user_id, client_id):
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

        api_key = client["api_key"]
        api_secret = client["api_secret"]
        client_id = client["client_id"]

        # Fetch for both ETH and BTC
        resp_list = fetch_positions_for_client(api_key, api_secret, ["ETH", "BTC"])

        # Process each response
        for resp_dict in resp_list:
            for coinname, resp in resp_dict.items():
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

                        cursor.execute(
                            "SELECT position_id FROM order_positions WHERE client_id=%s AND user_id=%s AND product_id=%s",
                            (client_id, user_id, product_id)
                        )
                        existing = cursor.fetchone()

                        if existing:
                            cursor.execute(
                                """UPDATE order_positions 
                                   SET product_symbol=%s, entry_price=%s, size=%s, user_id=%s, status=1, lastupdate=%s 
                                   WHERE client_id=%s AND product_id=%s""",
                                (product_symbol, entry_price, size, user_id, last_update, client_id, product_id)
                            )
                        else:
                            cursor.execute(
                                """INSERT INTO order_positions 
                                   (client_id, product_id, product_symbol, entry_price, size, user_id, status, lastupdate) 
                                   VALUES (%s, %s, %s, %s, %s, %s, 1, %s)""",
                                (client_id, product_id, product_symbol, entry_price, size, user_id, last_update)
                            )

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
        return jsonify(resp_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500