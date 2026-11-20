"""
Mhare Gaam Ki Rasoi - Authentication & Role-Based Access Control (RBAC)
Provides token-based authentication, password hashing, and role checks.
"""

import hashlib
import secrets
import time
from functools import wraps
from flask import request, jsonify
from backend.models import get_db

SALT = "mhare_gaam_salt_2026"

# In-memory session token store (token -> {user_id, role, name, expires_at})
ACTIVE_SESSIONS = {}

def hash_password(password: str) -> str:
    return hashlib.sha256((password + SALT).encode('utf-8')).hexdigest()

def generate_session(user_row) -> str:
    token = secrets.token_hex(24)
    # 7 days expiry
    expires_at = time.time() + (7 * 86400)
    ACTIVE_SESSIONS[token] = {
        'user_id': user_row['id'],
        'role': user_row['role'],
        'name': user_row['name'],
        'phone': user_row['phone'],
        'email': user_row['email'],
        'expires_at': expires_at
    }
    return token

def get_current_user():
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1].strip()
        session = ACTIVE_SESSIONS.get(token)
        if session and session['expires_at'] > time.time():
            return session
    # Also support X-Session-Token header or query param
    token = request.headers.get('X-Session-Token') or request.args.get('token')
    if token:
        session = ACTIVE_SESSIONS.get(token)
        if session and session['expires_at'] > time.time():
            return session
    return None

def require_role(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({'success': False, 'message': 'Authentication required. Please login.'}), 401
            
            if 'SUPER_ADMIN' not in allowed_roles and user['role'] == 'SUPER_ADMIN':
                # Super Admin can access any endpoint
                return f(*args, **kwargs)

            if user['role'] not in allowed_roles:
                return jsonify({
                    'success': False,
                    'message': f"Access denied. Required role(s): {', '.join(allowed_roles)}. Your role: {user['role']}"
                }), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator
