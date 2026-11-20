"""
Authentication Routes for Customers, Admin, Chef, and Bill Counter
"""

from flask import Blueprint, request, jsonify
from backend.models import get_db
from backend.auth import hash_password, generate_session, get_current_user

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = (data.get('username') or data.get('email') or data.get('phone') or '').strip()
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({'success': False, 'message': 'Username/phone and password are required'}), 400

    conn = get_db()
    # Case-insensitive username match or email or phone
    cursor = conn.cursor()
    # Handle initial dev credentials where username is 'Admin', 'Chef', 'Bill'
    row = cursor.execute("""
        SELECT * FROM users 
        WHERE LOWER(email) = LOWER(?) 
           OR phone = ? 
           OR LOWER(name) LIKE LOWER(?)
           OR (LOWER(?) = 'admin' AND role = 'SUPER_ADMIN')
           OR (LOWER(?) = 'chef' AND role = 'CHEF')
           OR (LOWER(?) = 'bill' AND role = 'BILL_COUNTER')
           OR (LOWER(?) = 'delivery' AND role = 'DELIVERY_ADMIN')
           OR (LOWER(?) = 'agent' AND role = 'DELIVERY_AGENT')
        LIMIT 1
    """, (identifier, identifier, f"%{identifier}%", identifier, identifier, identifier, identifier, identifier)).fetchone()

    if not row:
        conn.close()
        return jsonify({'success': False, 'message': 'Invalid credentials. User not found.'}), 401

    pwd_hash = hash_password(password)
    if row['password_hash'] != pwd_hash:
        conn.close()
        return jsonify({'success': False, 'message': 'Invalid password. Please check your credentials.'}), 401

    token = generate_session(row)
    conn.close()

    return jsonify({
        'success': True,
        'message': f"Welcome back, {row['name']}! Ram Ram! 🙏",
        'token': token,
        'user': {
            'id': row['id'],
            'name': row['name'],
            'email': row['email'],
            'phone': row['phone'],
            'role': row['role']
        }
    })

@auth_bp.route('/customer-otp', methods=['POST'])
def customer_otp_login():
    """Quick mobile OTP login for Indian customers without complex password friction"""
    data = request.get_json() or {}
    phone = data.get('phone', '').strip()
    name = data.get('name', 'Customer').strip()
    otp = data.get('otp', '1234') # Dev OTP default 1234

    if not phone or len(phone) < 10:
        return jsonify({'success': False, 'message': 'Please provide a valid 10-digit mobile number'}), 400

    conn = get_db()
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM users WHERE phone = ?", (phone,)).fetchone()

    if not row:
        # Register new customer automatically
        import uuid
        user_id = f"user_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO users (id, name, phone, email, password_hash, role, status)
            VALUES (?, ?, ?, ?, ?, 'CUSTOMER', 'ACTIVE')
        """, (user_id, name, phone, f"{phone}@rasoi.in", hash_password('Customer@1234')))
        
        # Give 50 welcome reward points
        cursor.execute("""
            INSERT INTO reward_transactions (id, user_id, order_id, points, type, description)
            VALUES (?, ?, NULL, 50, 'EARNED', 'Welcome Signup Bonus points 🎉')
        """, (f"rew_{uuid.uuid4().hex[:8]}", user_id))
        
        conn.commit()
        row = cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

    token = generate_session(row)
    conn.close()

    return jsonify({
        'success': True,
        'message': f"Login successful! Ram Ram, {row['name']}! 🙏",
        'token': token,
        'user': {
            'id': row['id'],
            'name': row['name'],
            'email': row['email'],
            'phone': row['phone'],
            'role': row['role']
        }
    })

@auth_bp.route('/me', methods=['GET'])
def get_current_profile():
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
    
    conn = get_db()
    rewards = conn.execute("""
        SELECT COALESCE(SUM(CASE WHEN type = 'EARNED' THEN points ELSE -points END), 0)
        FROM reward_transactions WHERE user_id = ?
    """, (user['user_id'],)).fetchone()[0]
    conn.close()

    user_info = dict(user)
    user_info['reward_points'] = rewards
    return jsonify({'success': True, 'user': user_info})
