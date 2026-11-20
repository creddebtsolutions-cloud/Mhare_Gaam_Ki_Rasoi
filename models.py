"""
Mhare Gaam Ki Rasoi - Database Models & Schema Management
SQLite-based relational database layer with 23 tables matching production specifications.
"""

import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'rasoi.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 1. roles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT,
        role TEXT NOT NULL DEFAULT 'CUSTOMER',
        status TEXT DEFAULT 'ACTIVE',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role) REFERENCES roles(id)
    )
    """)

    # 3. addresses
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS addresses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        label TEXT DEFAULT 'Home',
        street TEXT NOT NULL,
        city TEXT DEFAULT 'Meerut',
        pincode TEXT DEFAULT '250001',
        is_default INTEGER DEFAULT 0,
        instructions TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)

    # 4. categories
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        display_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 5. menu_items
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        discount_price REAL,
        image_url TEXT,
        spice_level TEXT DEFAULT 'Medium', -- Mild, Medium, Desi Spicy
        prep_time_mins INTEGER DEFAULT 20,
        ingredients TEXT,
        is_veg INTEGER DEFAULT 1,
        is_bestseller INTEGER DEFAULT 0,
        is_featured INTEGER DEFAULT 0,
        is_available INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
    )
    """)

    # 6. menu_variants
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS menu_variants (
        id TEXT PRIMARY KEY,
        menu_item_id TEXT NOT NULL,
        name TEXT NOT NULL, -- e.g. Half, Full, 2 Pcs, 4 Pcs
        price REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    )
    """)

    # 7. addons
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS addons (
        id TEXT PRIMARY KEY,
        menu_item_id TEXT, -- NULL if global addon
        name TEXT NOT NULL,
        price REAL NOT NULL,
        is_available INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 8. carts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS carts (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        session_id TEXT UNIQUE,
        coupon_code TEXT,
        cooking_instructions TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 9. cart_items
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        cart_id TEXT NOT NULL,
        menu_item_id TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        addons_json TEXT, -- JSON array of selected addons
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    )
    """)

    # 10. tables (restaurant dine-in)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tables (
        id TEXT PRIMARY KEY,
        table_number TEXT UNIQUE NOT NULL,
        capacity INTEGER DEFAULT 4,
        status TEXT DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, RESERVED, CLEANING
        current_order_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 11. orders
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_number TEXT UNIQUE NOT NULL,
        user_id TEXT,
        customer_name TEXT,
        customer_phone TEXT,
        order_type TEXT NOT NULL DEFAULT 'DELIVERY', -- DELIVERY, TAKEAWAY, DINE_IN
        table_number TEXT,
        status TEXT NOT NULL DEFAULT 'PLACED', -- PLACED, ACCEPTED, PREPARING, READY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
        subtotal REAL NOT NULL DEFAULT 0,
        discount REAL NOT NULL DEFAULT 0,
        packaging_fee REAL NOT NULL DEFAULT 0,
        delivery_fee REAL NOT NULL DEFAULT 0,
        taxes REAL NOT NULL DEFAULT 0,
        grand_total REAL NOT NULL DEFAULT 0,
        payment_method TEXT DEFAULT 'UPI',
        payment_status TEXT DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
        delivery_address TEXT,
        cooking_instructions TEXT,
        assigned_agent_id TEXT,
        prep_time_minutes INTEGER DEFAULT 25,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 12. order_items
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        menu_item_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        item_price REAL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        addons_json TEXT,
        subtotal REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
    """)

    # 13. payments
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        method TEXT NOT NULL, -- UPI, CASH, CARD, NETBANKING
        amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'COMPLETED',
        transaction_ref TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id)
    )
    """)

    # 14. coupons
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT NOT NULL DEFAULT 'PERCENTAGE', -- PERCENTAGE, FLAT
        discount_value REAL NOT NULL,
        min_order REAL DEFAULT 0,
        max_discount REAL DEFAULT 0,
        usage_limit INTEGER DEFAULT 1000,
        times_used INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 15. offers
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS offers (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        badge_text TEXT,
        coupon_code TEXT,
        banner_url TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 16. reviews
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        order_id TEXT UNIQUE,
        user_id TEXT,
        customer_name TEXT,
        rating INTEGER NOT NULL,
        food_rating INTEGER,
        packaging_rating INTEGER,
        delivery_rating INTEGER,
        comment TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id)
    )
    """)

    # 17. favourites
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS favourites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        menu_item_id TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, menu_item_id)
    )
    """)

    # 18. reward_transactions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reward_transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        order_id TEXT,
        points INTEGER NOT NULL,
        type TEXT NOT NULL, -- EARNED, REDEEMED
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 19. notifications
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT, -- NULL if broadcast
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'ORDER', -- ORDER, PROMO, SYSTEM
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 20. support_tickets
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS support_tickets (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        order_id TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'OPEN', -- OPEN, RESOLVED
        response TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 21. delivery_agents
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS delivery_agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        vehicle_number TEXT,
        status TEXT DEFAULT 'AVAILABLE', -- AVAILABLE, OUT_FOR_DELIVERY, OFFLINE
        current_order_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 22. restaurant_settings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS restaurant_settings (
        id TEXT PRIMARY KEY,
        restaurant_name TEXT NOT NULL DEFAULT 'Mhare Gaam Ki Rasoi',
        tagline TEXT NOT NULL DEFAULT 'Ghar Jaisa Swaad',
        address TEXT NOT NULL DEFAULT 'Sai Plaza, Meerut, Uttar Pradesh, India',
        phone TEXT NOT NULL DEFAULT '+91 98765 43210',
        whatsapp TEXT NOT NULL DEFAULT '+91 98765 43210',
        opening_time TEXT DEFAULT '10:00 AM',
        closing_time TEXT DEFAULT '11:00 PM',
        weekly_off TEXT DEFAULT 'None',
        delivery_radius_km REAL DEFAULT 12.0,
        delivery_fee REAL DEFAULT 35.0,
        min_order_amount REAL DEFAULT 149.0,
        free_delivery_threshold REAL DEFAULT 499.0,
        prep_time_avg INTEGER DEFAULT 25,
        gst_percentage REAL DEFAULT 5.0,
        packaging_fee REAL DEFAULT 20.0,
        store_status TEXT DEFAULT 'OPEN', -- OPEN, CLOSED, BUSY, TEMPORARILY_CLOSED
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 23. audit_logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        role TEXT,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized with all 23 tables successfully.")
