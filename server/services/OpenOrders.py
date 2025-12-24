# Get open orders
import time
import requests
from flask import Blueprint, jsonify
from helpers.common import generate_signature
from config import API_BASE_URL
# , API_KEY, API_SECRET

class OpenOrdersService:
    def __init__(self):
        pass
    
    def get_open_orders(self):
        base_url = API_BASE_URL
        # api_key = API_KEY
        # api_secret = API_SECRET

        method = 'GET'
        timestamp = str(int(time.time()))
        path = '/v2/orders'
        url = f'{base_url}{path}'
        query_string = '?state=open'
        payload = ''
        signature_data = method + timestamp + path + query_string + payload
        signature = generate_signature(api_secret, signature_data)
        print(f"Signature {signature}")

        req_headers = {
        'api-key': api_key,
        'timestamp': timestamp,
        'signature': signature,
        'User-Agent': 'python-rest-client',
        'Content-Type': 'application/json'
        }

        query = {"state": "open"}
        # query = {"product_id": 1, "state": 'open'}

        response = requests.request(
          method, url, data=payload, params=query, timeout=(3, 27), headers=req_headers
        )
        print(response.status_code)
        print(response.text)
        print(f"Response {response}")
        return response.text
        
# Create a blueprint and bind it to the class
open_orders_bp = Blueprint("open_orders", __name__)
service = OpenOrdersService()

@open_orders_bp.route("/open-orders", methods=["GET"])
def open_orders_route():
    return jsonify(service.get_open_orders())