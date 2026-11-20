"""
Mhare Gaam Ki Rasoi - Main Application Server
"""

import os
from flask import Flask, render_template, send_from_directory, jsonify
from flask_cors import CORS

from backend.models import init_db
from backend.seed_data import seed_all

# Blueprints
from backend.routes.auth_routes import auth_bp
from backend.routes.menu_routes import menu_bp
from backend.routes.order_routes import order_bp
from backend.routes.kds_routes import kds_bp
from backend.routes.pos_routes import pos_bp
from backend.routes.admin_routes import admin_bp
from backend.routes.ai_routes import ai_bp
from backend.routes.delivery_routes import delivery_bp
from backend.routes.payment_routes import payment_bp

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, 'static')
TEMPLATE_DIR = os.path.join(BASE_DIR, 'templates')

app = Flask(__name__, static_folder=STATIC_DIR, template_folder=TEMPLATE_DIR)
CORS(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(menu_bp, url_prefix='/api/menu')
app.register_blueprint(order_bp, url_prefix='/api/orders')
app.register_blueprint(kds_bp, url_prefix='/api/kds')
app.register_blueprint(pos_bp, url_prefix='/api/pos')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(delivery_bp, url_prefix='/api/delivery')
app.register_blueprint(payment_bp, url_prefix='/api/payments')

# Frontend Web Views
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/customer')
def customer_view():
    return render_template('index.html', initial_role='CUSTOMER')

@app.route('/admin')
def admin_view():
    return render_template('index.html', initial_role='ADMIN')

@app.route('/chef')
def chef_view():
    return render_template('index.html', initial_role='CHEF')

@app.route('/pos')
def pos_view():
    return render_template('index.html', initial_role='BILL_COUNTER')

@app.route('/delivery')
def delivery_view():
    return render_template('index.html', initial_role='DELIVERY_AGENT')

@app.route('/privacy-policy')
def privacy_policy():
    return render_template('privacy_policy.html')

@app.route('/terms')
def terms_of_service():
    return render_template('terms.html')

@app.route('/receipt/<order_id>')
def print_receipt(order_id):
    from backend.models import get_db
    conn = get_db()
    order = conn.execute("SELECT * FROM orders WHERE id = ? OR order_number = ?", (order_id, order_id)).fetchone()
    if not order:
        conn.close()
        return "Order not found", 404
    items = conn.execute("SELECT * FROM order_items WHERE order_id = ?", (order['id'],)).fetchall()
    settings = conn.execute("SELECT * FROM restaurant_settings LIMIT 1").fetchone()
    conn.close()
    return render_template('receipt_print.html', order=dict(order), items=[dict(i) for i in items], settings=dict(settings))

@app.route('/manifest.json')
def manifest():
    return send_from_directory(BASE_DIR, 'manifest.json')

@app.route('/service-worker.js')
def service_worker():
    return send_from_directory(BASE_DIR, 'service-worker.js')

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'restaurant': 'Mhare Gaam Ki Rasoi',
        'tagline': 'Ghar Jaisa Swaad',
        'location': 'Sai Plaza, Meerut',
        'category': '100% Pure Vegetarian'
    })

def setup_app():
    db_file = os.path.join(BASE_DIR, 'rasoi.db')
    if not os.path.exists(db_file):
        print("Initializing and seeding database...")
        seed_all()

setup_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
