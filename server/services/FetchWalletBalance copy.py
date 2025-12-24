# Get open orders
import time
import requests
from flask import Blueprint, jsonify
from helpers.common import generate_signature
from config import API_BASE_URL, API_KEY, API_SECRET

class FetchWalletBalance:
    def __init__(self):
        pass
    
    def wallet_balances(self):
        base_url = API_BASE_URL
        api_key = API_KEY
        api_secret = API_SECRET

        method = 'GET'
        timestamp = str(int(time.time()))
        path = '/v2/wallet/balances'
        url = f'{base_url}{path}'
        # query_string = '?state=open'
        payload = ''
        signature_data = method + timestamp + path + payload
        signature = generate_signature(api_secret, signature_data)
        print(f"Signature {signature}")

        req_headers = {
        'api-key': api_key,
        'timestamp': timestamp,
        'signature': signature,
        'User-Agent': 'python-rest-client',
        'Content-Type': 'application/json'
        }

        query = {}
        # query = {"product_id": 1, "state": 'open'}

        response = requests.request(
          method, url, data=payload, params=query, timeout=(3, 27), headers=req_headers
        )
        print(response.status_code)
        print(response.text)
        print(f"Response {response}")
        return response.text
        
# Create a blueprint and bind it to the class

wallet_balances_bp = Blueprint("wallet_balances", __name__)
service = FetchWalletBalance()

@wallet_balances_bp.route("/wallet-balances", methods=["GET"])
def wallet_balances():
    return jsonify(service.wallet_balances())

if __name__ == "__main__": 
    service = FetchWalletBalance() 
    result = service.wallet_balances() 
    print("Wallet Balances Result:", result)