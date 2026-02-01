import pymysql
import pymysql.cursors
from config import DB_USER, DB_PASSWORD, DB_NAME

def get_db_connection():
    return pymysql.connect(
        host="localhost",
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )

# ✅ Helper function to fetch single-column values
def fetch_values(query, params=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params or ())
    results = [{"id": row[list(row.keys())[0]], "name": row[list(row.keys())[1]]} for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return results

def fetch_one_value(query, params=None):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)  # ✅ DictCursor
    cursor.execute(query, params or ())
    result = cursor.fetchone()  # single row as dict
    cursor.close()
    conn.close()
    return result


