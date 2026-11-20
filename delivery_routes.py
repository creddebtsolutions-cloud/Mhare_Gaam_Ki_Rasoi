"""
Delivery Partner API Routes (Role: DELIVERY_AGENT)
Handles order assignments, live status updates, rider duty status, and delivery history.
"""

from flask import Blueprint, request, jsonify
from backend.models import get_db

delivery_bp = Blueprint('delivery_bp', __name__)

@delivery_bp.route('/my-orders/<agent_id>', methods=['GET'])
def get_agent_orders(agent_id):
    conn = get_db()
    # Fetch active deliveries for this rider
    active_rows = conn.execute("""
        SELECT o.*,
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
        FROM orders o
        WHERE o.assigned_agent_id = ? AND o.status IN ('READY', 'OUT_FOR_DELIVERY')
        ORDER BY o.created_at ASC
    """, (agent_id,)).fetchall()

    # Fetch completed deliveries for this rider today
    completed_rows = conn.execute("""
        SELECT o.*,
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
        FROM orders o
        WHERE o.assigned_agent_id = ? AND o.status = 'DELIVERED'
        ORDER BY o.updated_at DESC
        LIMIT 10
    """, (agent_id,)).fetchall()

    agent_info = conn.execute("SELECT * FROM delivery_agents WHERE id = ?", (agent_id,)).fetchone()
    conn.close()

    return jsonify({
        'success': True,
        'agent': dict(agent_info) if agent_info else None,
        'active_orders': [dict(r) for r in active_rows],
        'completed_orders': [dict(r) for r in completed_rows]
    })

@delivery_bp.route('/update-status', methods=['POST'])
def update_delivery_status():
    data = request.get_json() or {}
    order_id = data.get('order_id')
    new_status = data.get('status') # 'OUT_FOR_DELIVERY' or 'DELIVERED'
    agent_id = data.get('agent_id')

    if not order_id or new_status not in ['OUT_FOR_DELIVERY', 'DELIVERED']:
        return jsonify({'success': False, 'message': 'Invalid delivery status update'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE orders 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? OR order_number = ?
    """, (new_status, order_id, order_id))

    if new_status == 'DELIVERED':
        cursor.execute("UPDATE delivery_agents SET status = 'AVAILABLE', current_order_id = NULL WHERE id = ?", (agent_id,))
        # Send delivery push notification
        ord_row = cursor.execute("SELECT user_id, order_number FROM orders WHERE id = ? OR order_number = ?", (order_id, order_id)).fetchone()
        if ord_row and ord_row['user_id']:
            import uuid
            cursor.execute("""
                INSERT INTO notifications (id, user_id, title, message, type)
                VALUES (?, ?, ?, ?, 'ORDER')
            """, (f"notif_{uuid.uuid4().hex[:8]}", ord_row['user_id'], 'Delivered! Swad Ka Anand Lein 🙏', f"Order #{ord_row['order_number']} has been delivered. Rating zaroor dein!"))
    else:
        cursor.execute("UPDATE delivery_agents SET status = 'OUT_FOR_DELIVERY', current_order_id = ? WHERE id = ?", (order_id, agent_id))

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f'Delivery status updated to {new_status}'})

@delivery_bp.route('/toggle-duty', methods=['POST'])
def toggle_duty():
    data = request.get_json() or {}
    agent_id = data.get('agent_id')
    status = data.get('status', 'AVAILABLE') # AVAILABLE or OFFLINE

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE delivery_agents SET status = ? WHERE id = ?", (status, agent_id))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f'Rider duty status is now {status}'})

@delivery_bp.route('/fleet', methods=['GET'])
def get_fleet():
    conn = get_db()
    agents = conn.execute("SELECT * FROM delivery_agents ORDER BY id ASC").fetchall()
    all_delivery_orders = conn.execute("""
        SELECT o.*,
               da.name as agent_name,
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
        FROM orders o
        LEFT JOIN delivery_agents da ON o.assigned_agent_id = da.id
        WHERE o.order_type = 'DELIVERY' AND o.status NOT IN ('CANCELLED', 'DELIVERED')
        ORDER BY o.created_at ASC
    """).fetchall()
    conn.close()
    return jsonify({
        'success': True,
        'agents': [dict(a) for a in agents],
        'active_orders': [dict(o) for o in all_delivery_orders]
    })
