from flask import Blueprint, request, jsonify
from flask_cors import CORS
from services.db_connect import get_db_connection
from helpers.common import generate_token
import bcrypt
import jwt
import datetime

login_bp = Blueprint("login", __name__)
#CORS(login_bp)  # enable CORS for this blueprint

@login_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(silent=True) or {}
        username = data.get("username")
        password = data.get("password")
        #print(f"Username: {username}")

        if not username or not password:
            return jsonify({"success": False, "message": "Username and password are required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()  # return dict rows

        cursor.execute("SELECT login_id as id, username, password FROM login WHERE username = %s", (username,))
        user = cursor.fetchone()
        #print(f"User is: {user}")

        cursor.close()
        conn.close()

        if not user:
            return jsonify({"success": False, "message": "User not found"}), 401

        # Ensure stored hash is a string
        stored_hash = user["password"]
        if bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8")): 
            # ✅ Generate JWT token
            payload = {
                "user_id": user["id"],
                "username": user["username"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)  # expires in 30 min
            }
            token = generate_token(user["id"])

            return jsonify({
                "success": True,
                "message": "Login successful",
                "token": token
            }), 200 
        else: 
            return jsonify({"success": False, "message": "Invalid credentials"}), 401

    except Exception as e:
        print("Login error:", e)  # <-- print actual error to console for debugging
        return jsonify({"success": False, "message": "Server error"}), 500