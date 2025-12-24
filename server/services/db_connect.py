import pymysql
from config import DB_USER, DB_PASSWORD, DB_NAME

def get_db_connection():
    return pymysql.connect(
        host="localhost",
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )
