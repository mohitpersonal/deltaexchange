from flask import Blueprint, request, jsonify
from services.db_connect import get_db_connection
#from flask_cors import CORS

clients_bp = Blueprint("clients", __name__)

# Allow all origins (for development)
#CORS(clients_bp)

#CORS(clients_bp, resources={r"/*": {"origins": "http://localhost:3000"}})

@clients_bp.route('/clients/add_client', methods=['POST'])
def add_client():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    # return data

    print("Received:", data)  # Debug log

    sql = """
        INSERT INTO clients (name, mobile_no, email_id, group_id, margin_mode_id, api_key, api_secret)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    values = (
        data.get("name"),
        data.get("number"),
        data.get("email"),
        data.get("group"),
        data.get("margin"),
        data.get("apiKey"),
        data.get("apiSecret")
    )

    cursor.execute(sql, values)
    print("Executing Queries")  # Debug log
    conn.commit()
    client_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({"message": "Client added successfully", "id": client_id}), 201

@clients_bp.route("/clients", methods=["GET"])
def get_clients():
    conn = get_db_connection()
    cursor = conn.cursor()
    sql_query = "SELECT client_id, name, mobile_no as number, email_id as email, g.group_name, mm.margin_mode, wallet_balance, m2m_daily FROM `clients` c JOIN groups g ON c.group_id = g.group_id and g.status=1 JOIN margin_mode mm ON c.margin_mode_id=mm.margin_mode_id and mm.status=1 WHERE c.status=1"
    cursor.execute(sql_query)
    clients = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(clients)

@clients_bp.route('/clients/groups', methods=['GET']) 
def get_groups(): 
    conn = get_db_connection()
    cursor = conn.cursor() 
    cursor.execute("SELECT group_id, group_name FROM groups where status=1") 
    rows = cursor.fetchall() 
    cursor.close() 
    groups = [{"group_id": r["group_id"], "group_name": r["group_name"]} for r in rows] 
    return jsonify(groups) 

@clients_bp.route('/clients/margin_mode', methods=['GET']) 
def get_margin_modes(): 
    conn = get_db_connection()
    cursor = conn.cursor() 
    cursor.execute("SELECT margin_mode_id, margin_mode FROM margin_mode where status=1") 
    rows = cursor.fetchall() 
    cursor.close() 
    margin_modes = [{"margin_mode_id": r["margin_mode_id"], "margin_mode": r["margin_mode"]} for r in rows] 
    return jsonify(margin_modes)