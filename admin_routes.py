"""
Super Admin Management & Analytics API Routes
"""

import uuid
from flask import Blueprint, request, jsonify
from backend.models import get_db

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/overview', methods=['GET'])
def get_admin_overview():
    conn = get_db()
    cursor = conn.cursor()

    total_orders = cursor.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    total_sales = cursor.execute("SELECT COALESCE(SUM(grand_total), 0) FROM orders WHERE payment_status = 'COMPLETED'").fetchone()[0]
    pending_orders = cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'PLACED'").fetchone()[0]
    preparing_orders = cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'PREPARING'").fetchone()[0]
    ready_orders = cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'READY'").fetchone()[0]
    completed_orders = cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'DELIVERED'").fetchone()[0]
    cancelled_orders = cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'CANCELLED'").fetchone()[0]

    top_dishes = cursor.execute("""
        SELECT oi.item_name, SUM(oi.quantity) as sold_qty, SUM(oi.subtotal) as total_rev
        FROM order_items oi
        GROUP BY oi.item_name
        ORDER BY sold_qty DESC
        LIMIT 5
    """).fetchall()

    settings = cursor.execute("SELECT store_status, opening_time, closing_time, phone FROM restaurant_settings LIMIT 1").fetchone()
    conn.close()

    return jsonify({
        'success': True,
        'stats': {
            'total_orders': total_orders,
            'total_sales': round(total_sales, 2),
            'pending': pending_orders,
            'preparing': preparing_orders,
            'ready': ready_orders,
            'completed': completed_orders,
            'cancelled': cancelled_orders,
            'store_status': settings['store_status'] if settings else 'OPEN'
        },
        'top_dishes': [dict(td) for td in top_dishes]
    })

@admin_bp.route('/sales-chart', methods=['GET'])
def get_sales_chart():
    # Return formatted daily sales bars
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    sales_data = [
        {'day': 'Mon', 'sales': 4250, 'orders': 14},
        {'day': 'Tue', 'sales': 5120, 'orders': 18},
        {'day': 'Wed', 'sales': 6480, 'orders': 22},
        {'day': 'Thu', 'sales': 5890, 'orders': 19},
        {'day': 'Fri', 'sales': 8920, 'orders': 31},
        {'day': 'Sat', 'sales': 12450, 'orders': 45},
        {'day': 'Sun', 'sales': 14800, 'orders': 52}
    ]
    return jsonify({'success': True, 'chart': sales_data})

@admin_bp.route('/orders', methods=['GET'])
def get_admin_orders():
    status = request.args.get('status')
    order_type = request.args.get('type')

    conn = get_db()
    sql = """
        SELECT o.*, 
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
        FROM orders o
        WHERE 1=1
    """
    params = []
    if status and status != 'ALL':
        sql += " AND o.status = ?"
        params.append(status)
    if order_type and order_type != 'ALL':
        sql += " AND o.order_type = ?"
        params.append(order_type)

    sql += " ORDER BY o.created_at DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return jsonify({'success': True, 'orders': [dict(r) for r in rows]})

@admin_bp.route('/orders/<order_id>/assign-agent', methods=['POST'])
def assign_delivery_agent(order_id):
    data = request.get_json() or {}
    agent_id = data.get('agent_id')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE orders 
        SET assigned_agent_id = ?, status = 'OUT_FOR_DELIVERY', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? OR order_number = ?
    """, (agent_id, order_id, order_id))
    
    if agent_id:
        cursor.execute("UPDATE delivery_agents SET status = 'OUT_FOR_DELIVERY', current_order_id = ? WHERE id = ?", (order_id, agent_id))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Delivery partner assigned successfully!'})

@admin_bp.route('/menu', methods=['GET', 'POST'])
def manage_menu():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.get_json() or {}
        item_id = f"dish_{uuid.uuid4().hex[:8]}"
        name = data.get('name')
        price = float(data.get('price', 199))
        cat_id = data.get('category_id', 'cat_specials')
        desc = data.get('description', '')
        img = data.get('image_url', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80')
        spice = data.get('spice_level', 'Medium')
        is_bestseller = 1 if data.get('is_bestseller') else 0

        cursor.execute("""
            INSERT INTO menu_items (
                id, category_id, name, description, price, discount_price,
                image_url, spice_level, is_veg, is_bestseller, is_available
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1)
        """, (item_id, cat_id, name, desc, price, price + 30, img, spice, is_bestseller))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': f"Dish '{name}' added to menu successfully!"})

    # GET
    dishes = cursor.execute("""
        SELECT m.*, c.name as category_name
        FROM menu_items m
        LEFT JOIN categories c ON m.category_id = c.id
        ORDER BY m.created_at DESC
    """).fetchall()
    conn.close()
    return jsonify({'success': True, 'dishes': [dict(d) for d in dishes]})

@admin_bp.route('/menu/<item_id>', methods=['PUT', 'DELETE'])
def update_delete_menu(item_id):
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'DELETE':
        cursor.execute("DELETE FROM menu_items WHERE id = ?", (item_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Dish removed from menu'})

    data = request.get_json() or {}
    # Toggle availability or update fields
    if 'is_available' in data:
        cursor.execute("UPDATE menu_items SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (1 if data['is_available'] else 0, item_id))
    if 'price' in data:
        cursor.execute("UPDATE menu_items SET price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (float(data['price']), item_id))
    if 'name' in data:
        cursor.execute("UPDATE menu_items SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (data['name'], item_id))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Dish updated successfully'})

@admin_bp.route('/coupons', methods=['GET', 'POST'])
def manage_coupons():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.get_json() or {}
        cid = f"coup_{uuid.uuid4().hex[:8]}"
        code = data.get('code', '').strip().upper()
        dtype = data.get('discount_type', 'PERCENTAGE')
        dval = float(data.get('discount_value', 10))
        min_ord = float(data.get('min_order', 199))
        max_disc = float(data.get('max_discount', 100))

        cursor.execute("""
            INSERT INTO coupons (id, code, discount_type, discount_value, min_order, max_discount, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        """, (cid, code, dtype, dval, min_ord, max_disc))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': f"Coupon '{code}' created successfully!"})

    coupons = cursor.execute("SELECT * FROM coupons ORDER BY created_at DESC").fetchall()
    conn.close()
    return jsonify({'success': True, 'coupons': [dict(c) for c in coupons]})

@admin_bp.route('/settings', methods=['GET', 'POST'])
def manage_settings():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.get_json() or {}
        fields = [
            'restaurant_name', 'tagline', 'address', 'phone', 'whatsapp',
            'opening_time', 'closing_time', 'delivery_radius_km', 'delivery_fee',
            'min_order_amount', 'free_delivery_threshold', 'gst_percentage', 'store_status'
        ]
        for f in fields:
            if f in data:
                cursor.execute(f"UPDATE restaurant_settings SET {f} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 'setting_1'", (data[f],))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Restaurant settings saved successfully!'})

    settings = cursor.execute("SELECT * FROM restaurant_settings LIMIT 1").fetchone()
    conn.close()
    return jsonify({'success': True, 'settings': dict(settings) if settings else {}})

@admin_bp.route('/delivery-agents', methods=['GET'])
def get_agents():
    conn = get_db()
    agents = conn.execute("SELECT * FROM delivery_agents").fetchall()
    conn.close()
    return jsonify({'success': True, 'agents': [dict(a) for a in agents]})
