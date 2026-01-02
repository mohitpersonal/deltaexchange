import time
import requests
from flask import Blueprint, jsonify
from helpers.common import generate_signature, token_required
from config import API_BASE_URL
from services.db_connect import get_db_connection   # your DB helper
wallet_balances_bp = Blueprint("wallet_balances", __name__)

def fetch_wallet_balance_for_client(api_key, api_secret):
    method = "GET"
    timestamp = str(int(time.time()))  # seconds
    path = "/v2/wallet/balances"
    url = f"{API_BASE_URL}{path}"
    payload = ""  # must be included in signature

    signature_data = method + timestamp + path + payload
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
            data=payload,   # keep this, even if empty
            params={},
            headers=req_headers,
            timeout=(3, 27),
        )
        print("Response text:", response.text)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

@wallet_balances_bp.route("/wallet-balances", methods=["GET"])
@token_required
def wallet_balances(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT client_id, name, api_key, api_secret FROM clients WHERE status=1")
    clients = cursor.fetchall()

    results = []
    errors = []

    for client in clients:
        balances = fetch_wallet_balance_for_client(client["api_key"], client["api_secret"])

        if balances and balances.get("success") is True:
            try:
                wallet_balance_inr = balances["result"][0]["available_balance_inr"]
                wallet_balance_usd = balances["result"][0]["balance"]

                update_cursor = conn.cursor()
                update_cursor.execute(
                    "UPDATE clients SET wallet_balance=%s, wallet_balance_usd=%s WHERE client_id=%s AND status=1",
                    (wallet_balance_inr, wallet_balance_usd, client["client_id"])
                )
                conn.commit()
                update_cursor.close()

                results.append({
                    "client_name": client["name"],
                    "wallet_balance": wallet_balance_inr,
                    "wallet_balance_usd": wallet_balance_usd
                })
            except Exception as e:
                error_msg = f"Parsing error: {str(e)}"
                log_cursor = conn.cursor()
                log_cursor.execute(
                    "INSERT INTO api_log_history (client_id, api_name, error) VALUES (%s, %s, %s)",
                    (client["client_id"], "/v2/wallet/balances", error_msg)
                )
                conn.commit()
                log_cursor.close()
                errors.append({
                    "client_id": client["client_id"],
                    "api_name": "/v2/wallet/balances",
                    "error": error_msg
                })
        else:
            error_msg = balances.get("error", "Unknown error in API")
            log_cursor = conn.cursor()
            log_cursor.execute(
                "INSERT INTO api_log_history (client_id, api_name, error) VALUES (%s, %s, %s)",
                (client["client_id"], "/v2/wallet/balances", error_msg)
            )
            conn.commit()
            log_cursor.close()
            errors.append({
                "client_id": client["client_id"],
                "client_name": client["name"],
                "api_name": "/v2/wallet/balances",
                "error": error_msg
            })

    cursor.close()
    conn.close()

    return jsonify({
        "results": results,
        "errors": errors
    })
