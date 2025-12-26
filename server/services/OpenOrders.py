import time
import requests
from flask import Blueprint, jsonify
from services.db_connect import get_db_connection
from helpers.common import generate_signature
from config import API_BASE_URL

open_orders_bp = Blueprint("open_orders", __name__)

def fetch_open_orders(api_key, api_secret):
    base_url = API_BASE_URL
    method = 'GET'
    timestamp = str(int(time.time()))  # ✅ milliseconds
    path = '/v2/orders'
    #query_string = '?state=open'
    payload = ''

    signature_data = method + timestamp + path + payload
    signature = generate_signature(api_secret, signature_data)

    req_headers = {
        'api-key': api_key,
        'timestamp': timestamp,
        'signature': signature,
        'User-Agent': 'python-rest-client',
        'Content-Type': 'application/json'
    }

    #query = {"state": "open"}

    response = requests.request(
        method, f"{base_url}{path}", data=payload, params={},
        timeout=(3, 27), headers=req_headers
    )
    print(response.status_code)
    print(response.text)
    return response.json()

@open_orders_bp.route("/open-orders/<int:client_id>", methods=["GET"])
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

        # unpack tuple
        api_key = client['api_key']
        api_secret = client['api_secret']
        client_id = client['client_id']
        print("Raw Client",client)

        resp = fetch_open_orders(api_key, api_secret)

        cursor.close()
        conn.close()
        return jsonify(resp)
    except Exception as e:
        return jsonify({"error": str(e)}), 500