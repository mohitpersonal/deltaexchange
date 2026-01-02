
# helpers/common.py
import hmac
import time
import hashlib
import datetime 
import jwt
from flask import request, jsonify

def generate_signature(secret: str, message: str) -> str:
    """
    Generate an HMAC SHA256 signature.

    Args:
        secret (str): The secret key used for hashing.
        message (str): The message to be signed.

    Returns:
        str: Hexadecimal HMAC signature.
    """
    message_bytes = message.encode("utf-8")
    secret_bytes = secret.encode("utf-8")
    hash_obj = hmac.new(secret_bytes, message_bytes, hashlib.sha256)
    return hash_obj.hexdigest()


SECRET_KEY = "DeltaExchangeV1TestUser$"  # Use env var in production

def generate_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)  # 30 min expiry
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def token_required(func):
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"success": False, "message": "Missing token"}), 401

        try:
            token = auth_header.split(" ")[1]
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            # Pass user_id to the protected route
            return func(*args, **kwargs, user_id=decoded["user_id"])
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Session expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Invalid token"}), 401

    wrapper.__name__ = func.__name__
    return wrapper