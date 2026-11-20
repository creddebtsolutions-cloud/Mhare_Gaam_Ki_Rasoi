"""
POS & Billing Counter API Routes
"""

import json
import uuid
import random
from flask import Blueprint, request, jsonify
from backend.models import get_db

pos_bp = Blueprint('pos_bp', __name__)

@pos_bp.route('/tables', methods=['GET'])
def get_tables():
    conn = get_db()
    rows = conn.execute("""
        SELECT t.*, o.order_number, o.grand_total, o.customer_name
        FROM tables t
        LEFT JOIN orders o ON t.current_order_id = o.id
        ORDER BY t.table_number ASC
    """).fetchall()
    conn.close()
    return jsonify({'success': True, 'tables': [dict(r) for r in rows]})

@pos_bp.route('/tables/<table_id>/status', methods=['POST'])
def update_table_status(table_id):
    data = request.get_json() or {}
    status = data.get('status', 'AVAILABLE').upper()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE tables SET status = ?, current_order_id = CASE WHEN ? = 'AVAILABLE' THEN NULL ELSE current_order_id END WHERE id = ? OR table_number = ?", (status, status, table_id, table_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': f'Table status updated to {status}'})

@pos_bp.route('/create-order', methods=['POST'])
def pos_create_order():
    data = request.get_json() or {}
    order_type = data.get('order_type', 'DINE_IN').upper() # DINE_IN, TAKEAWAY, DELIVERY
    table_number = data.get('table_number')
    customer_name = data.get('customer_name', 'Walk-in Guest').strip()
    customer_phone = data.get('customer_phone', '9876543210').strip()
    items = data.get('items', [])
    payment_method = data.get('payment_method', 'CASH').upper()
    coupon_code = data.get('coupon_code')
    instructions = data.get('cooking_instructions', '')

    if not items:
        return jsonify({'success': False, 'message': 'No items selected in POS cart'}), 400

    conn = get_db()
    cursor = conn.cursor()

    subtotal = 0.0
    verified_items = []
    for itm in items:
        dish = cursor.execute("SELECT * FROM menu_items WHERE id = ?", (itm['menu_item_id'],)).fetchone()
        if not dish:
            continue
        qty = max(1, int(itm.get('quantity', 1)))
        price = float(dish['price'])
        line_total = price * qty
        subtotal += line_total
        verified_items.append({
            'menu_item_id': dish['id'],
            'name': dish['name'],
            'price': price,
            'quantity': qty,
            'subtotal': line_total
        })

    # Discount
    discount = 0.0
    if coupon_code:
        coup = cursor.execute("SELECT * FROM coupons WHERE code = ? AND is_active = 1", (coupon_code.upper(),)).fetchone()
        if coup and subtotal >= coup['min_order']:
            if coup['discount_type'] == 'PERCENTAGE':
                discount = (subtotal * coup['discount_value']) / 100.0
                if coup['max_discount'] > 0 and discount > coup['max_discount']:
                    discount = float(coup['max_discount'])
            else:
                discount = float(coup['discount_value'])

    settings = cursor.execute("SELECT * FROM restaurant_settings LIMIT 1").fetchone()
    gst_percent = float(settings['gst_percentage'])
    taxable = max(0, subtotal - discount)
    taxes = round((taxable * gst_percent) / 100.0, 2)
    grand_total = round(taxable + taxes, 2)

    order_id = f"ord_{uuid.uuid4().hex[:8]}"
    order_num = f"MGK-{random.randint(1000, 9999)}"

    # Initial status for Dine-In / Takeaway created at counter: ACCEPTED or PREPARING
    status = 'ACCEPTED' if order_type == 'DINE_IN' else 'PLACED'

    cursor.execute("""
        INSERT INTO orders (
            id, order_number, user_id, customer_name, customer_phone,
            order_type, table_number, status, subtotal, discount,
            packaging_fee, delivery_fee, taxes, grand_total,
            payment_method, payment_status, delivery_address,
            cooking_instructions, prep_time_minutes
        ) VALUES (?, ?, 'pos_user', ?, ?, ?, ?, ?, ?, ?, 0.0, 0.0, ?, ?, ?, 'COMPLETED', ?, ?, 20)
    """, (
        order_id, order_num, customer_name, customer_phone,
        order_type, table_number, status, subtotal, discount,
        taxes, grand_total, payment_method, f"{order_type} Order at Counter", instructions
    ))

    for vi in verified_items:
        cursor.execute("""
            INSERT INTO order_items (id, order_id, menu_item_id, item_name, item_price, quantity, addons_json, subtotal)
            VALUES (?, ?, ?, ?, ?, ?, '[]', ?)
        """, (f"oi_{uuid.uuid4().hex[:8]}", order_id, vi['menu_item_id'], vi['name'], vi['price'], vi['quantity'], vi['subtotal']))

    # Payment record
    cursor.execute("""
        INSERT INTO payments (id, order_id, method, amount, status, transaction_ref)
        VALUES (?, ?, ?, ?, 'COMPLETED', ?)
    """, (f"pay_{uuid.uuid4().hex[:8]}", order_id, payment_method, grand_total, f"POS-{random.randint(100000, 999999)}"))

    if order_type == 'DINE_IN' and table_number:
        cursor.execute("UPDATE tables SET status = 'OCCUPIED', current_order_id = ? WHERE table_number = ?", (order_id, table_number))

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': f"Order #{order_num} billed successfully!",
        'order': {
            'id': order_id,
            'order_number': order_num,
            'order_type': order_type,
            'table_number': table_number,
            'customer_name': customer_name,
            'subtotal': subtotal,
            'discount': discount,
            'taxes': taxes,
            'grand_total': grand_total,
            'payment_method': payment_method,
            'items': verified_items
        }
    })

@pos_bp.route('/today-orders', methods=['GET'])
def get_today_pos_orders():
    conn = get_db()
    rows = conn.execute("""
        SELECT o.*, 
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
        FROM orders o
        ORDER BY o.created_at DESC
        LIMIT 30
    """).fetchall()
    conn.close()
    return jsonify({'success': True, 'orders': [dict(r) for r in rows]})
