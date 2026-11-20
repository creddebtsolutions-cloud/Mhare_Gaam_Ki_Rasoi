"""
Order Processing, Cart Calculation, Checkout, Tracking & Reviews
"""

import json
import uuid
import random
from flask import Blueprint, request, jsonify
from backend.models import get_db
from backend.auth import get_current_user

order_bp = Blueprint('order_bp', __name__)

@order_bp.route('/apply-coupon', methods=['POST'])
def apply_coupon():
    data = request.get_json() or {}
    code = (data.get('code') or '').strip().upper()
    subtotal = float(data.get('subtotal', 0))

    if not code:
        return jsonify({'success': False, 'message': 'Coupon code is required'}), 400

    conn = get_db()
    coupon = conn.execute("SELECT * FROM coupons WHERE code = ? AND is_active = 1", (code,)).fetchone()
    conn.close()

    if not coupon:
        return jsonify({'success': False, 'message': f"Coupon '{code}' is invalid or expired."}), 400

    if subtotal < coupon['min_order']:
        return jsonify({
            'success': False, 
            'message': f"Coupon applies on minimum order of ₹{int(coupon['min_order'])}. Add ₹{int(coupon['min_order'] - subtotal)} more!"
        }), 400

    if coupon['discount_type'] == 'PERCENTAGE':
        discount = (subtotal * coupon['discount_value']) / 100.0
        if coupon['max_discount'] > 0 and discount > coupon['max_discount']:
            discount = float(coupon['max_discount'])
    else:
        discount = float(coupon['discount_value'])

    return jsonify({
        'success': True,
        'code': code,
        'discount': round(discount, 2),
        'message': f"Coupon '{code}' applied! You save ₹{round(discount, 2)} 🎉"
    })

@order_bp.route('/create', methods=['POST'])
def create_order():
    data = request.get_json() or {}
    user = get_current_user()

    items = data.get('items', [])
    if not items:
        return jsonify({'success': False, 'message': 'Aapki thali abhi khaali hai 😋 (Cart is empty)'}), 400

    order_type = data.get('order_type', 'DELIVERY').upper() # DELIVERY, TAKEAWAY, DINE_IN
    table_number = data.get('table_number')
    customer_name = data.get('customer_name') or (user['name'] if user else 'Valued Guest')
    customer_phone = data.get('customer_phone') or (user['phone'] if user else '9876543210')
    delivery_address = data.get('delivery_address', 'Sai Plaza, Meerut')
    cooking_instructions = data.get('cooking_instructions', '')
    coupon_code = data.get('coupon_code')
    payment_method = data.get('payment_method', 'UPI').upper()

    conn = get_db()
    cursor = conn.cursor()

    # Calculate items total
    subtotal = 0.0
    verified_items = []
    for item in items:
        dish_id = item.get('menu_item_id')
        qty = max(1, int(item.get('quantity', 1)))
        dish_row = cursor.execute("SELECT * FROM menu_items WHERE id = ?", (dish_id,)).fetchone()
        if not dish_row:
            continue

        base_price = float(dish_row['price'])
        # Addon prices
        addons = item.get('addons', [])
        addon_cost = sum([float(a.get('price', 0)) for a in addons])
        line_total = (base_price + addon_cost) * qty
        subtotal += line_total

        verified_items.append({
            'menu_item_id': dish_id,
            'item_name': dish_row['name'],
            'item_price': base_price + addon_cost,
            'quantity': qty,
            'addons_json': json.dumps(addons),
            'subtotal': line_total
        })

    if not verified_items:
        conn.close()
        return jsonify({'success': False, 'message': 'No valid items found in order'}), 400

    # Settings for fees
    settings = cursor.execute("SELECT * FROM restaurant_settings LIMIT 1").fetchone()
    packaging_fee = float(settings['packaging_fee']) if order_type in ['DELIVERY', 'TAKEAWAY'] else 0.0
    
    delivery_fee = 0.0
    if order_type == 'DELIVERY':
        if subtotal < float(settings['free_delivery_threshold']):
            delivery_fee = float(settings['delivery_fee'])
        else:
            delivery_fee = 0.0

    # Coupon calculation
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
            
            cursor.execute("UPDATE coupons SET times_used = times_used + 1 WHERE id = ?", (coup['id'],))

    # Taxes (GST 5%)
    taxable_amount = max(0, subtotal - discount)
    gst_percent = float(settings['gst_percentage'])
    taxes = round((taxable_amount * gst_percent) / 100.0, 2)

    grand_total = round(taxable_amount + packaging_fee + delivery_fee + taxes, 2)

    # Generate Order Number
    order_id = f"ord_{uuid.uuid4().hex[:8]}"
    order_num = f"MGK-{random.randint(1000, 9999)}"
    user_id = user['user_id'] if user else 'guest_user'

    cursor.execute("""
        INSERT INTO orders (
            id, order_number, user_id, customer_name, customer_phone,
            order_type, table_number, status, subtotal, discount,
            packaging_fee, delivery_fee, taxes, grand_total,
            payment_method, payment_status, delivery_address,
            cooking_instructions, prep_time_minutes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PLACED', ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', ?, ?, 25)
    """, (
        order_id, order_num, user_id, customer_name, customer_phone,
        order_type, table_number, subtotal, discount,
        packaging_fee, delivery_fee, taxes, grand_total,
        payment_method, delivery_address, cooking_instructions
    ))

    # Insert items
    for vi in verified_items:
        cursor.execute("""
            INSERT INTO order_items (id, order_id, menu_item_id, item_name, item_price, quantity, addons_json, subtotal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (f"oi_{uuid.uuid4().hex[:8]}", order_id, vi['menu_item_id'], vi['item_name'], vi['item_price'], vi['quantity'], vi['addons_json'], vi['subtotal']))

    # Insert payment record
    cursor.execute("""
        INSERT INTO payments (id, order_id, method, amount, status, transaction_ref)
        VALUES (?, ?, ?, ?, 'COMPLETED', ?)
    """, (f"pay_{uuid.uuid4().hex[:8]}", order_id, payment_method, grand_total, f"TXN-{random.randint(100000, 999999)}"))

    # Award Loyalty Points (₹100 spent = 5 points)
    points_earned = int((grand_total // 100) * 5)
    if points_earned > 0 and user:
        cursor.execute("""
            INSERT INTO reward_transactions (id, user_id, order_id, points, type, description)
            VALUES (?, ?, ?, ?, 'EARNED', ?)
        """, (f"rew_{uuid.uuid4().hex[:8]}", user_id, order_id, points_earned, f"Loyalty points for order #{order_num}"))

    # Notification
    cursor.execute("""
        INSERT INTO notifications (id, user_id, title, message, type)
        VALUES (?, ?, ?, ?, 'ORDER')
    """, (f"notif_{uuid.uuid4().hex[:8]}", user_id, 'Order Placed Successfully! 🙏', f"Order #{order_num} has been received by Mhare Gaam Ki Rasoi."))

    # If Dine-In, update table status to OCCUPIED
    if order_type == 'DINE_IN' and table_number:
        cursor.execute("UPDATE tables SET status = 'OCCUPIED', current_order_id = ? WHERE table_number = ?", (order_id, table_number))

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': 'Order placed successfully! Ram Ram! 🙏',
        'order': {
            'id': order_id,
            'order_number': order_num,
            'grand_total': grand_total,
            'discount': discount,
            'points_earned': points_earned,
            'status': 'PLACED',
            'order_type': order_type,
            'prep_time_minutes': 25
        }
    })

@order_bp.route('/<order_id>', methods=['GET'])
def get_order_details(order_id):
    conn = get_db()
    order = conn.execute("SELECT * FROM orders WHERE id = ? OR order_number = ?", (order_id, order_id)).fetchone()
    if not order:
        conn.close()
        return jsonify({'success': False, 'message': 'Order not found'}), 404

    items = conn.execute("SELECT * FROM order_items WHERE order_id = ?", (order['id'],)).fetchall()
    review = conn.execute("SELECT * FROM reviews WHERE order_id = ?", (order['id'],)).fetchone()
    agent = None
    if order['assigned_agent_id']:
        agent_row = conn.execute("SELECT * FROM delivery_agents WHERE id = ?", (order['assigned_agent_id'],)).fetchone()
        if agent_row:
            agent = dict(agent_row)

    conn.close()
    ord_dict = dict(order)
    ord_dict['items'] = [dict(i) for i in items]
    ord_dict['review'] = dict(review) if review else None
    ord_dict['delivery_agent'] = agent

    return jsonify({'success': True, 'order': ord_dict})

@order_bp.route('/user/<user_id>', methods=['GET'])
def get_user_orders(user_id):
    conn = get_db()
    rows = conn.execute("""
        SELECT o.*, 
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
               (SELECT item_name FROM order_items WHERE order_id = o.id LIMIT 1) as first_item_name
        FROM orders o 
        WHERE o.user_id = ? OR o.customer_phone = ?
        ORDER BY o.created_at DESC
    """, (user_id, user_id)).fetchall()

    orders = [dict(r) for r in rows]
    conn.close()
    return jsonify({'success': True, 'orders': orders})

@order_bp.route('/<order_id>/review', methods=['POST'])
def add_review(order_id):
    data = request.get_json() or {}
    rating = int(data.get('rating', 5))
    food_rating = int(data.get('food_rating', rating))
    packaging_rating = int(data.get('packaging_rating', rating))
    delivery_rating = int(data.get('delivery_rating', rating))
    comment = data.get('comment', '')

    user = get_current_user()
    user_id = user['user_id'] if user else 'guest'
    customer_name = user['name'] if user else 'Customer'

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO reviews (id, order_id, user_id, customer_name, rating, food_rating, packaging_rating, delivery_rating, comment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (f"rev_{uuid.uuid4().hex[:8]}", order_id, user_id, customer_name, rating, food_rating, packaging_rating, delivery_rating, comment))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Dhanyawad! Aapka review safalta-purvak darj ho gaya hai. 🙏'})

@order_bp.route('/rewards/user/<user_id>', methods=['GET'])
def get_rewards(user_id):
    conn = get_db()
    txns = conn.execute("""
        SELECT * FROM reward_transactions 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    """, (user_id,)).fetchall()

    total_points = conn.execute("""
        SELECT COALESCE(SUM(CASE WHEN type = 'EARNED' THEN points ELSE -points END), 0)
        FROM reward_transactions WHERE user_id = ?
    """, (user_id,)).fetchone()[0]

    conn.close()
    return jsonify({
        'success': True,
        'current_points': total_points,
        'transactions': [dict(t) for t in txns]
    })
