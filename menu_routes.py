"""
Menu and Food Categories API Routes
"""

from flask import Blueprint, request, jsonify
from backend.models import get_db

menu_bp = Blueprint('menu_bp', __name__)

@menu_bp.route('/categories', methods=['GET'])
def get_categories():
    conn = get_db()
    rows = conn.execute("""
        SELECT * FROM categories 
        WHERE is_active = 1 
        ORDER BY display_order ASC
    """).fetchall()
    conn.close()
    return jsonify({'success': True, 'categories': [dict(r) for r in rows]})

@menu_bp.route('/items', methods=['GET'])
def get_menu_items():
    category = request.args.get('category')
    search = request.args.get('search', '').strip().lower()
    filter_type = request.args.get('filter') # bestseller, featured, spicy, mild, under200
    sort_by = request.args.get('sort') # price_asc, price_desc, rating

    conn = get_db()
    sql = "SELECT * FROM menu_items WHERE is_available = 1"
    params = []

    if category and category != 'all':
        sql += " AND category_id = ?"
        params.append(category)

    if search:
        sql += " AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(ingredients) LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])

    if filter_type == 'bestseller':
        sql += " AND is_bestseller = 1"
    elif filter_type == 'featured':
        sql += " AND is_featured = 1"
    elif filter_type == 'spicy':
        sql += " AND spice_level LIKE '%Spicy%'"
    elif filter_type == 'mild':
        sql += " AND spice_level LIKE '%Mild%'"
    elif filter_type == 'under200':
        sql += " AND price <= 200"

    if sort_by == 'price_asc':
        sql += " ORDER BY price ASC"
    elif sort_by == 'price_desc':
        sql += " ORDER BY price DESC"
    else:
        sql += " ORDER BY is_bestseller DESC, is_featured DESC, price ASC"

    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return jsonify({'success': True, 'items': [dict(r) for r in rows]})

@menu_bp.route('/items/<item_id>', methods=['GET'])
def get_single_dish(item_id):
    conn = get_db()
    item = conn.execute("SELECT * FROM menu_items WHERE id = ?", (item_id,)).fetchone()
    if not item:
        conn.close()
        return jsonify({'success': False, 'message': 'Dish not found'}), 404

    addons = conn.execute("""
        SELECT * FROM addons 
        WHERE (menu_item_id IS NULL OR menu_item_id = ?) AND is_available = 1
    """, (item_id,)).fetchall()

    conn.close()
    dish_data = dict(item)
    dish_data['addons'] = [dict(a) for a in addons]
    return jsonify({'success': True, 'dish': dish_data})

@menu_bp.route('/addons', methods=['GET'])
def get_addons():
    conn = get_db()
    rows = conn.execute("SELECT * FROM addons WHERE is_available = 1").fetchall()
    conn.close()
    return jsonify({'success': True, 'addons': [dict(r) for r in rows]})

@menu_bp.route('/offers', methods=['GET'])
def get_active_offers():
    conn = get_db()
    offers = conn.execute("SELECT * FROM offers WHERE is_active = 1").fetchall()
    coupons = conn.execute("SELECT * FROM coupons WHERE is_active = 1").fetchall()
    conn.close()
    return jsonify({
        'success': True,
        'offers': [dict(o) for o in offers],
        'coupons': [dict(c) for c in coupons]
    })
