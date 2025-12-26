from flask import Flask
from config import CORS_URL
from services.OpenOrders import open_orders_bp
from services.FetchWalletBalance import wallet_balances_bp
from services.ClientDetails import clients_bp
from services.ProductLists import productlists_bp
from services.PositionOrders import positionorders_bp

from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, supports_credentials=True, resources={r"/*": {"origins": CORS_URL}})

app.register_blueprint(open_orders_bp)
app.register_blueprint(wallet_balances_bp)
app.register_blueprint(clients_bp)
app.register_blueprint(productlists_bp)
app.register_blueprint(positionorders_bp)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
 