"""
Chef / Kitchen Display System (KDS) API Routes
"""

import json
from flask import Blueprint, request, jsonify
from backend.models import get_db
from backend.auth import require_role

kds_bp = Blueprint('kds_bp', __name__)

@kds_bp.route('/orders', methods=['GET'])
def get_kds_orders():
    # Accessible to CHEF, SUPER_ADMIN, and BILL_COUNTER
    conn = get_db()
    # Fetch active orders only (exclude DELIVERED, CANCELLED)
    rows = conn.execute("""
        SELECT id, order_number, order_type, table_number, status,
               customer_name, customer_phone, cooking_instructions, prep_time_minutes, created_at
        FROM orders
        WHERE status IN ('PLACED', 'ACCEPTED', 'PREPARING', 'READY')
        ORDER BY created_at ASC
    """).fetchall()

    orders_by_status = {
        'PLACED': [],
        'ACCEPTED': [],
        'PREPARING': [],
        'READY': []
    }

    for r in rows:
        ord_data = dict(r)
        # Fetch items for this order ticket
        items = conn.execute("""
            SELECT item_name, quantity, addons_json
            FROM order_items
            WHERE order_id = ?
        """, (ord_data['id'],)).fetchall()
        
        ord_data['items'] = []
        for i in items:
            addons = []
            if i['addons_json']:
                try:
                    addons = json.loads(i['addons_json'])
                except:
                    addons = []
            ord_data['items'].append({
                'name': i['item_name'],
                'quantity': i['quantity'],
                'addons': addons
            })

        st = ord_data['status']
        if st in orders_by_status:
            orders_by_status[st].append(ord_data)

    conn.close()
    return jsonify({
        'success': True,
        'orders': orders_by_status,
        'counts': {k: len(v) for k, v in orders_by_status.items()}
    })

@kds_bp.route('/orders/<order_id>/status', methods=['POST'])
def update_kds_status(order_id):
    data = request.get_json() or {}
    new_status = data.get('status', '').upper()
    valid_statuses = ['ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED']

    if new_status not in valid_statuses:
        return jsonify({'success': False, 'message': f'Invalid status: {new_status}'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR order_number = ?", (new_status, order_id, order_id))
    
    # Notify customer
    status_msg = {
        'ACCEPTED': 'Your order has been accepted! 🍛',
        'PREPARING': 'Your food is being prepared with desi ghee 👨‍🍳',
        'READY': 'Your order is hot, packed & ready!',
        'OUT_FOR_DELIVERY': 'Your delivery partner is on the way! 🛵'
    }.get(new_status)

    if status_msg:
        ord_row = cursor.execute("SELECT user_id, order_number FROM orders WHERE id = ? OR order_number = ?", (order_id, order_id)).fetchone()
        if ord_row and ord_row['user_id']:
            import uuid
            cursor.execute("""
                INSERT INTO notifications (id, user_id, title, message, type)
                VALUES (?, ?, ?, ?, 'ORDER')
            """, (f"notif_{uuid.uuid4().hex[:8]}", ord_row['user_id'], 'Order Update', f"#{ord_row['order_number']}: {status_msg}"))

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f'Order status updated to {new_status}'})
