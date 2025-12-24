
# helpers/common.py
import hmac
import time
import hashlib

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


if __name__ == "__main__":
    raise RuntimeError("This module is not meant to be executed directly")