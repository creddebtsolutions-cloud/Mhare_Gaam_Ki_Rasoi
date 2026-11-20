"""
Mhare Gaam Ki Rasoi - Initial Demo Data Seeder
Populates realistic pure vegetarian restaurant menu items, categories, coupons,
roles, default credentials, tables, delivery agents, and sample orders.
"""

import hashlib
import json
import uuid
from backend.models import get_db, init_db

def hash_pw(password: str) -> str:
    # Standard salted hash
    salt = "mhare_gaam_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def seed_all():
    init_db()
    conn = get_db()
    cursor = conn.cursor()

    # Clear previous seed records cleanly
    cursor.execute("PRAGMA foreign_keys = OFF")
    tables_to_clear = [
        'order_items', 'payments', 'reviews', 'favourites', 'reward_transactions',
        'notifications', 'support_tickets', 'cart_items', 'carts', 'orders',
        'menu_variants', 'addons', 'menu_items', 'categories', 'addresses',
        'users', 'roles', 'coupons', 'offers', 'tables', 'delivery_agents',
        'restaurant_settings', 'audit_logs'
    ]
    for tbl in tables_to_clear:
        cursor.execute(f"DELETE FROM {tbl}")
    cursor.execute("PRAGMA foreign_keys = ON")

    # 1. Roles
    roles = [
        ('SUPER_ADMIN', 'Super Admin', 'Full administrative permissions and reporting'),
        ('CHEF', 'Kitchen Chef', 'Access to kitchen display system and cooking status'),
        ('BILL_COUNTER', 'Billing Counter POS', 'Front desk POS, offline orders, receipt printing'),
        ('DELIVERY_ADMIN', 'Delivery Partner Admin', 'Manages delivery fleet, driver assignments, and live rider tracking'),
        ('DELIVERY_AGENT', 'Delivery Agent', 'Order delivery updates and assignments'),
        ('CUSTOMER', 'Customer', 'Browse menu, order food, reviews, rewards')
    ]
    cursor.executemany("INSERT INTO roles (id, name, description) VALUES (?, ?, ?)", roles)

    # 2. Staff & Default Users
    # Admin: Admin / Admin@1234
    # Chef: Chef / Chef@1234
    # Bill: Bill / Bill@1234
    # Delivery Admin: Delivery / delivery@rasoi.in / Delivery@1234
    # Delivery Agent: Ramesh / ramesh@rasoi.in / Agent@1234
    # Customer: Gaurav / 9876543210 / Customer@1234
    users = [
        ('user_admin', 'Restaurant Owner (Admin)', '9999900001', 'admin@rasoi.in', hash_pw('Admin@1234'), 'SUPER_ADMIN', 'ACTIVE'),
        ('user_chef', 'Head Chef Ram Prasad', '9999900002', 'chef@rasoi.in', hash_pw('Chef@1234'), 'CHEF', 'ACTIVE'),
        ('user_bill', 'Cashier Mahesh', '9999900003', 'bill@rasoi.in', hash_pw('Bill@1234'), 'BILL_COUNTER', 'ACTIVE'),
        ('user_delivery_admin', 'Delivery Partner Admin (Suresh Verma)', '9876500000', 'delivery@rasoi.in', hash_pw('Delivery@1234'), 'DELIVERY_ADMIN', 'ACTIVE'),
        ('user_agent_1', 'Ramesh Kumar (Delivery)', '9876500001', 'ramesh@rasoi.in', hash_pw('Agent@1234'), 'DELIVERY_AGENT', 'ACTIVE'),
        ('user_cust_1', 'Gaurav Singh', '9876543210', 'gaurav@example.com', hash_pw('Customer@1234'), 'CUSTOMER', 'ACTIVE'),
        ('user_cust_2', 'Priya Sharma', '9876543211', 'priya@example.com', hash_pw('Customer@1234'), 'CUSTOMER', 'ACTIVE')
    ]
    cursor.executemany("""
        INSERT INTO users (id, name, phone, email, password_hash, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, users)

    # Customer addresses
    cursor.execute("""
        INSERT INTO addresses (id, user_id, label, street, city, pincode, is_default, instructions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, ('addr_1', 'user_cust_1', 'Home', 'Flat 402, Green Valley Apartments, Near Sai Plaza', 'Meerut', '250001', 1, 'Ring bell twice'))

    # 3. Categories
    categories = [
        ('cat_specials', "Mhare Gaam Specials", "🍲", 1),
        ('cat_thali', "Thali Specials", "🍱", 2),
        ('cat_paneer', "Paneer Specials", "🧀", 3),
        ('cat_dal', "Dal & Kadhi", "🥣", 4),
        ('cat_sabzi', "Sabzi & Gravies", "🥘", 5),
        ('cat_tandoor', "Tandoor & Starters", "🍢", 6),
        ('cat_breads', "Indian Breads", "🫓", 7),
        ('cat_rice', "Rice & Biryani", "🍚", 8),
        ('cat_chaat', "Chaat & Snacks", "🥟", 9),
        ('cat_breakfast', "Breakfast", "🍳", 10),
        ('cat_pizza', "Smokey Pizzas", "🍕", 11),
        ('cat_combos', "Family Combos", "👨‍👩‍👧‍👦", 12),
        ('cat_desserts', "Mithai & Desserts", "🍨", 13),
        ('cat_beverages', "Desi Beverages & Cold Coffee", "☕", 14)
    ]
    cursor.executemany("""
        INSERT INTO categories (id, name, icon, display_order, is_active)
        VALUES (?, ?, ?, ?, 1)
    """, categories)

    # 4. Realistic 100% Pure Vegetarian Menu Items
    menu_items = [
        # Specials & Thali
        ('dish_mg_thali', 'cat_thali', 'Mhare Gaam Special Thali',
         'The ultimate royal village feast: Dal Makhani, Shahi Paneer, Aloo Jeera, 4 Butter Tandoori Rotis, Basmati Jeera Rice, Boondi Raita, 2 Gulab Jamun, Roasted Papad, Pickle & Mint Salad.',
         349.0, 399.0, '/static/assets/dishes/dish_mg_thali.jpg',
         'Medium', 25, 'Paneer, Butter, Urad Dal, Basmati Rice, Wheat Flour, Spices', 1, 1, 1, 1),

        ('dish_deluxe_thali', 'cat_thali', 'Deluxe Veg Thali',
         'Homestyle goodness with rich Dal Makhani, Paneer Butter Masala, 3 Butter Rotis, Steamed Rice, Sweet Kheer and Fresh Salad.',
         279.0, 310.0, '/static/assets/dishes/dish_deluxe_thali.jpg',
         'Medium', 20, 'Paneer, Cream, Tomatoes, Wheat Flour, Basmati Rice', 1, 1, 0, 1),

        ('dish_gaam_thali', 'cat_thali', 'Simple Gaam Ki Thali',
         'Daily hearty comfort food: Desi Ghee Dal Tadka, Seasonal Mix Veg, 4 Fresh Tandoori Rotis, Rice and crunchy Pyaz & Green Chilli.',
         199.0, 220.0, '/static/assets/dishes/dish_gaam_thali.jpg',
         'Medium', 15, 'Yellow Toor Dal, Ghee, Cumin, Seasonal Vegetables', 1, 0, 0, 1),

        # Paneer Specials
        ('dish_pbm', 'cat_paneer', 'Paneer Butter Masala',
         'Cottage cheese cubes bathed in a velvety, buttery cashew and tomato gravy infused with roasted kasuri methi.',
         249.0, 280.0, '/static/assets/dishes/dish_pbm.jpg',
         'Mild', 20, 'Fresh Malai Paneer, Amul Butter, Cashew Paste, Fresh Cream, Kasuri Methi', 1, 1, 1, 1),

        ('dish_kadhai_paneer', 'cat_paneer', 'Kadhai Paneer',
         'Succulent paneer tossed in an iron wok with bell peppers, onions, whole coriander seeds and freshly pounded kadhai spices.',
         259.0, 290.0, '/static/assets/dishes/dish_kadhai_paneer.jpg',
         'Desi Spicy', 20, 'Fresh Paneer, Capsicum, Onion, Roasted Coriander & Dry Red Chillies', 1, 1, 0, 1),

        ('dish_shahi_paneer', 'cat_paneer', 'Shahi Paneer',
         'Royal Mughlai-style sweet and savory cottage cheese in an aromatic almond and saffron cream gravy.',
         269.0, 299.0, '/static/assets/dishes/dish_shahi_paneer.jpg',
         'Mild', 20, 'Paneer, Almonds, Saffron, Khoya, Green Cardamom, Cream', 1, 0, 0, 1),

        ('dish_paneer_tikka', 'cat_tandoor', 'Tandoori Paneer Tikka (6 Pcs)',
         'Thick cubes of farmer paneer marinated in mustard oil, ajwain, curd and Kashmiri chilli, slow roasted in the clay tandoor.',
         229.0, 260.0, '/static/assets/dishes/dish_paneer_tikka.jpg',
         'Medium', 20, 'Paneer, Hung Curd, Mustard Oil, Ajwain, Bell Peppers, Onions', 1, 1, 1, 1),

        # Dal & Kadhi
        ('dish_dal_makhani', 'cat_dal', 'Gaam Ki Dal Makhani',
         'Slow-simmered black lentils and kidney beans cooked over slow charcoal wood for 14 hours with churned white butter.',
         219.0, 240.0, '/static/assets/dishes/dish_dal_makhani.jpg',
         'Mild', 15, 'Whole Urad, Rajma, White Butter, Cream, Slow Charcoal Smoke', 1, 1, 1, 1),

        ('dish_dal_tadka', 'cat_dal', 'Desi Ghee Dal Tadka',
         'Golden yellow lentils tempered with garlic, cumin, heeng (asafoetida) and double desi ghee red chilli tadka.',
         179.0, 199.0, '/static/assets/dishes/dish_dal_tadka.jpg',
         'Medium', 15, 'Arhar Dal, Desi Ghee, Garlic, Heeng, Dry Kashmiri Mirch', 1, 0, 0, 1),

        # Sabzi
        ('dish_mix_veg', 'cat_sabzi', 'Handi Mix Vegetable',
         'Seasonal carrots, green peas, beans, cauliflower and baby corn simmered in a spiced onion tomato gravy.',
         189.0, 210.0, '/static/assets/dishes/dish_mix_veg.jpg',
         'Medium', 20, 'Carrots, Peas, Beans, Cauliflower, Paneer, Garam Masala', 1, 0, 0, 1),

        ('dish_jeera_aloo', 'cat_sabzi', 'Homestyle Jeera Aloo',
         'Baby potatoes roasted with fragrant roasted cumin, fresh ginger juliennes, green chillies and amchur (dry mango powder).',
         149.0, 170.0, '/static/assets/dishes/dish_jeera_aloo.jpg',
         'Medium', 15, 'Potatoes, Cumin Seeds, Ginger, Fresh Coriander, Desi Spices', 1, 0, 0, 1),

        # Breakfast & Chaat
        ('dish_chole_bhature', 'cat_breakfast', 'Amritsari Chole Bhature',
         'Two giant fluffy bhature served with slow-cooked dark spicy Amritsari chole, pickled carrots and tangy green chutney.',
         169.0, 190.0, '/static/assets/dishes/dish_chole_bhature.jpg',
         'Desi Spicy', 15, 'Kabuli Chana, Tea Leaves, Pomegranate Seeds, Bhatura Flour', 1, 1, 1, 1),

        ('dish_rajma_chawal', 'cat_specials', 'Dhaba Style Rajma Chawal',
         'Tender Kashmiri rajma in a thick spicy gravy poured over a generous bowl of steamed long-grain basmati rice.',
         159.0, 180.0, '/static/assets/dishes/dish_rajma_chawal.jpg',
         'Medium', 15, 'Kashmiri Red Rajma, Long Grain Basmati, Onions, Ginger Garlic', 1, 1, 0, 1),

        ('dish_aloo_paratha', 'cat_breakfast', 'Tandoori Aloo Paratha with Makhan',
         'Crispy whole wheat flatbread loaded with spiced potato mash, served piping hot with a big dollop of desi butter and pickle.',
         89.0, 100.0, '/static/assets/dishes/dish_aloo_paratha.jpg',
         'Medium', 15, 'Whole Wheat, Spiced Potatoes, White Makhan, Green Chillies', 1, 0, 0, 1),

        ('dish_samosa_chaat', 'cat_chaat', 'Dahi Samosa Chaat',
         'Two crispy samosas crushed and smothered with chole, sweet tamarind saunth, spicy mint chutney, thick beaten curd and sev.',
         99.0, 120.0, '/static/assets/dishes/dish_samosa_chaat.jpg',
         'Medium', 10, 'Crispy Samosa, Curd, Tamarind, Mint, Sev, Chaat Masala', 1, 1, 0, 1),

        # Breads
        ('dish_butter_naan', 'cat_breads', 'Butter Naan',
         'Tear-drop shaped refined flour bread baked on the hot walls of the tandoor and brushed with Amul butter.',
         45.0, 50.0, '/static/assets/dishes/dish_butter_naan.jpg',
         'Mild', 10, 'Flour, Milk, Butter, Nigella Seeds', 1, 0, 0, 1),

        ('dish_garlic_naan', 'cat_breads', 'Garlic Naan',
         'Naan topped with generous minced garlic and fresh coriander leaves, baked to golden crisp perfection.',
         55.0, 60.0, '/static/assets/dishes/dish_garlic_naan.jpg',
         'Mild', 10, 'Flour, Roasted Garlic, Butter, Fresh Dhaniya', 1, 1, 0, 1),

        ('dish_tandoori_roti', 'cat_breads', 'Tandoori Roti (Butter)',
         'Traditional 100% whole wheat roti cooked in the earthen clay oven with butter.',
         18.0, 20.0, '/static/assets/dishes/dish_tandoori_roti.jpg',
         'Mild', 8, '100% Whole Wheat Chakki Atta, Butter', 1, 0, 0, 1),

        ('dish_missi_roti', 'cat_breads', 'Missi Roti',
         'Nutritious blend of gram flour and wheat flour flavored with chopped onions, ajwain and kasuri methi.',
         35.0, 40.0, '/static/assets/dishes/dish_missi_roti.jpg',
         'Mild', 10, 'Gram Flour (Besan), Wheat Flour, Ajwain, Onions, Ghee', 1, 0, 0, 1),

        # Rice & Biryani
        ('dish_veg_biryani', 'cat_rice', 'Handi Veg Dum Biryani',
         'Fragrant basmati rice layered with garden vegetables, saffron and whole spices, slow sealed in an earthen clay pot.',
         229.0, 260.0, '/static/assets/dishes/dish_veg_biryani.jpg',
         'Medium', 25, 'Basmati Rice, Seasonal Veggies, Saffron, Fried Onions, Mint, Desi Ghee', 1, 1, 1, 1),

        ('dish_jeera_rice', 'cat_rice', 'Basmati Jeera Rice',
         'Aromatic long-grain basmati rice tempered with roasted cumin seeds and fresh coriander.',
         129.0, 140.0, '/static/assets/dishes/dish_jeera_rice.jpg',
         'Mild', 12, 'Basmati Rice, Cumin Seeds, Desi Ghee', 1, 0, 0, 1),

        # Combos
        ('dish_family_combo', 'cat_combos', 'Mhare Gaam Family Feast (Serves 4)',
         '1 Paneer Butter Masala + 1 Dal Makhani + 1 Mix Veg + 8 Butter Rotis + 2 Butter Naan + 1 Jeera Rice + 4 Gulab Jamun.',
         749.0, 899.0, '/static/assets/dishes/dish_family_combo.jpg',
         'Medium', 30, 'Full Family Feast with Curries, Breads, Rice & Dessert', 1, 1, 1, 1),

        # Desserts & Beverages
        ('dish_gulab_jamun', 'cat_desserts', 'Desi Ghee Gulab Jamun (2 Pcs)',
         'Warm, soft khoya dumplings fried in pure desi ghee and soaked in green cardamom and rose water sugar syrup.',
         69.0, 80.0, '/static/assets/dishes/dish_gulab_jamun.jpg',
         'Mild', 5, 'Pure Mawa Khoya, Desi Ghee, Saffron, Rose Water, Cardamom', 1, 1, 1, 1),

        ('dish_kheer', 'cat_desserts', 'Gaam Ki Kesar Kheer',
         'Slow-reduced full cream milk and fragrant basmati rice pudding topped with almonds, pistachios and Kashmiri saffron.',
         89.0, 100.0, '/static/assets/dishes/dish_kheer.jpg',
         'Mild', 5, 'Full Cream Buffalo Milk, Saffron, Rice, Almonds, Pistachios', 1, 0, 0, 1),

        ('dish_sweet_lassi', 'cat_beverages', 'Kulhad Malai Lassi',
         'Thick hand-churned sweet yogurt drink served in an earthen clay kulhad, topped with thick clotted malai and chopped nuts.',
         69.0, 80.0, '/static/assets/dishes/dish_sweet_lassi.jpg',
         'Mild', 5, 'Fresh Curd, Khoya Malai, Cardamom, Rose Syrup, Pistachios', 1, 1, 1, 1),

        ('dish_chaas', 'cat_beverages', 'Masala Chaas',
         'Light spiced buttermilk infused with roasted cumin seeds, black salt, fresh ginger and crushed mint leaves.',
         39.0, 45.0, '/static/assets/dishes/dish_chaas.jpg',
         'Mild', 5, 'Curd, Roasted Cumin, Fresh Mint, Rock Salt', 1, 0, 0, 1),

        # Smokey Pizzas
        ('dish_pizza_paneer_tikka', 'cat_pizza', 'Smokey Paneer Tikka Pizza',
         'Wood-fired crispy charred crust topped with marinated smoky tandoori paneer cubes, crunchy capsicum, charred red onions, gooey mozzarella cheese and mint chutney swirl.',
         269.0, 310.0, '/static/assets/dishes/dish_smokey_pizza.jpg',
         'Medium', 18, 'Wood-fired crust, Tandoori Paneer, Mozzarella Cheese, Bell Peppers, Onions, Mint Chutney', 1, 1, 1, 1),

        ('dish_pizza_farmhouse', 'cat_pizza', 'Smokey Farmhouse Veggie Pizza',
         'Loaded wood-smoked garden pizza featuring sweet golden corn, bell peppers, fresh tomatoes, sliced olives, jalapenos and dried oregano over bubbling cheese.',
         249.0, 289.0, '/static/assets/dishes/dish_smokey_pizza.jpg',
         'Mild', 18, 'Wood-fired crust, Mozzarella, Sweet Corn, Bell Peppers, Olives, Jalapenos, Oregano', 1, 1, 0, 1),

        ('dish_pizza_makhani', 'cat_pizza', 'Smokey Makhani Paneer & Corn Pizza',
         'Desi twist to Italian pizza: slow-cooked rich makhani gravy sauce base, char-grilled malai paneer, buttery sweet corn, and double mozzarella cheese.',
         279.0, 320.0, '/static/assets/dishes/dish_smokey_pizza.jpg',
         'Mild', 20, 'Wood-fired crust, Desi Makhani Sauce, Malai Paneer, Sweet Corn, Mozzarella Cheese', 1, 0, 1, 1),

        ('dish_pizza_periperi', 'cat_pizza', 'Smokey Spicy Peri-Peri Veg Pizza',
         'Fiery rustic pizza spiked with smoky African bird\'s eye peri-peri seasoning, spicy red paprika, crisp onions, crunchy capsicum and molten cheese.',
         239.0, 270.0, '/static/assets/dishes/dish_smokey_pizza.jpg',
         'Spicy', 16, 'Wood-fired crust, Peri-Peri Sauce, Mozzarella, Red Paprika, Onions, Capsicum', 1, 0, 0, 1),

        ('dish_pizza_margherita', 'cat_pizza', 'Smokey Margherita Double Cheese Pizza',
         'Classic wood-charred artisanal base, san marzano herbed tomato concasse sauce, fragrant basil leaves, and overflowing molten double smoked cheese.',
         199.0, 239.0, '/static/assets/dishes/dish_smokey_pizza.jpg',
         'Mild', 15, 'Wood-fired crust, Herbed Tomato Sauce, Double Mozzarella Cheese, Basil', 1, 1, 0, 1),

        # Cold Coffees (under cat_beverages)
        ('dish_coffee_classic', 'cat_beverages', 'Classic Kulhad Cold Coffee',
         'Rich creamy blended dark roasted espresso coffee with chilled full-cream milk, served in an authentic earthen kulhad with velvety froth.',
         89.0, 110.0, '/static/assets/dishes/dish_cold_coffee.jpg',
         'Mild', 5, 'Arabica Espresso, Full Cream Milk, Vanilla Cream, Ice, Served in Kulhad', 1, 1, 1, 1),

        ('dish_coffee_mocha', 'cat_beverages', 'Smokey Choco Mocha Cold Coffee',
         'Dark Belgian cocoa blended with chilled espresso, rich creamy milk, chocolate syrup drizzle and a subtle roasted hazelnut-smoky touch.',
         109.0, 130.0, '/static/assets/dishes/dish_cold_coffee.jpg',
         'Mild', 6, 'Espresso, Dark Belgian Cocoa, Creamy Milk, Chocolate Drizzle, Ice', 1, 1, 0, 1),

        ('dish_coffee_hazelnut', 'cat_beverages', 'Hazelnut Cream Cold Coffee',
         'Gourmet cold coffee infused with roasted hazelnut syrup, creamy vanilla froth, and cracked coffee beans.',
         119.0, 140.0, '/static/assets/dishes/dish_cold_coffee.jpg',
         'Mild', 6, 'Espresso, Roasted Hazelnut Syrup, Silky Froth, Cream, Cracked Coffee Beans', 1, 0, 0, 1),

        ('dish_coffee_caramel', 'cat_beverages', 'Caramel Crunch Cold Coffee',
         'Chilled espresso churned with rich butterscotch caramel sauce, topped with golden crunchy butter praline and caramel drizzle.',
         119.0, 140.0, '/static/assets/dishes/dish_cold_coffee.jpg',
         'Mild', 6, 'Espresso, Butterscotch Caramel, Crunchy Butter Praline, Chilled Milk', 1, 0, 0, 1),

        ('dish_coffee_vanilla_float', 'cat_beverages', 'Vanilla Ice Cream Cold Coffee Float',
         'Thick hand-blended cold coffee topped with a huge scoop of artisanal vanilla bean ice cream and dusted with dark cocoa.',
         129.0, 150.0, '/static/assets/dishes/dish_cold_coffee.jpg',
         'Mild', 5, 'Espresso, Artisanal Vanilla Bean Ice Cream Scoop, Chilled Milk, Dark Cocoa Dust', 1, 1, 1, 1)
    ]

    cursor.executemany("""
        INSERT INTO menu_items (
            id, category_id, name, description, price, discount_price,
            image_url, spice_level, prep_time_mins, ingredients, is_veg,
            is_bestseller, is_featured, is_available
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, menu_items)

    # 5. Add-ons
    addons = [
        ('addon_1', None, 'Extra Malai Paneer Cubes (50g)', 50.0, 1),
        ('addon_2', None, 'Extra Desi Butter Dollop', 20.0, 1),
        ('addon_3', None, 'Extra Rich Curry Gravy', 30.0, 1),
        ('addon_4', None, 'Chilled Boondi Raita', 40.0, 1),
        ('addon_5', None, 'Crispy Roasted Papad (2 Pcs)', 15.0, 1),
        ('addon_6', None, 'Fresh Green Salad & Sirka Pyaz', 25.0, 1)
    ]
    cursor.executemany("INSERT INTO addons (id, menu_item_id, name, price, is_available) VALUES (?, ?, ?, ?, ?)", addons)

    # 6. Coupons
    coupons = [
        ('coup_1', 'WELCOME50', 'PERCENTAGE', 50.0, 199.0, 100.0, 1000, 14, 1),
        ('coup_2', 'FIRSTORDER', 'FLAT', 75.0, 249.0, 75.0, 500, 22, 1),
        ('coup_3', 'GAAM10', 'PERCENTAGE', 10.0, 299.0, 150.0, 1000, 45, 1),
        ('coup_4', 'FAMILY100', 'FLAT', 100.0, 599.0, 100.0, 500, 18, 1),
        ('coup_5', 'FREEDELIVERY', 'FLAT', 35.0, 199.0, 35.0, 1000, 31, 1)
    ]
    cursor.executemany("""
        INSERT INTO coupons (id, code, discount_type, discount_value, min_order, max_discount, usage_limit, times_used, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, coupons)

    # 7. Offers & Promotions
    offers = [
        ('off_1', '50% Off On Your First Rasoi Order', 'Use coupon WELCOME50 and enjoy delicious desi swaad delivered to your doorstep.', 'SPECIAL OFFER', 'WELCOME50', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80', 1),
        ('off_2', 'Flat ₹100 Off On Family Combos', 'Order meals for 4+ and save ₹100 using code FAMILY100.', 'FAMILY FEAST', 'FAMILY100', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80', 1),
        ('off_3', 'Free Delivery Over ₹199', 'Enjoy zero delivery charges across Meerut on all orders above ₹199.', 'FREE DELIVERY', 'FREEDELIVERY', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80', 1)
    ]
    cursor.executemany("""
        INSERT INTO offers (id, title, description, badge_text, coupon_code, banner_url, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, offers)

    # 8. Tables for Dine-In POS
    tables = [
        ('tbl_1', 'Table 1', 4, 'AVAILABLE', None),
        ('tbl_2', 'Table 2', 2, 'AVAILABLE', None),
        ('tbl_3', 'Table 3', 4, 'OCCUPIED', 'ord_active_1'),
        ('tbl_4', 'Table 4', 6, 'AVAILABLE', None),
        ('tbl_5', 'Table 5', 8, 'RESERVED', None),
        ('tbl_6', 'Table 6', 4, 'CLEANING', None),
        ('tbl_7', 'Table 7', 2, 'AVAILABLE', None),
        ('tbl_8', 'Table 8', 4, 'AVAILABLE', None)
    ]
    cursor.executemany("INSERT INTO tables (id, table_number, capacity, status, current_order_id) VALUES (?, ?, ?, ?, ?)", tables)

    # 9. Delivery Agents & Fleet Lead
    agents = [
        ('agent_admin', 'Suresh Verma (Fleet Lead)', '9876500000', 'UP15-Fleet-01', 'AVAILABLE', None),
        ('agent_1', 'Ramesh Kumar', '9876500001', 'UP15-AB-1234', 'AVAILABLE', None),
        ('agent_2', 'Sonu Verma', '9876500002', 'UP15-XY-5678', 'OUT_FOR_DELIVERY', 'ord_delivering_1')
    ]
    cursor.executemany("INSERT INTO delivery_agents (id, name, phone, vehicle_number, status, current_order_id) VALUES (?, ?, ?, ?, ?, ?)", agents)

    # 10. Restaurant Settings
    cursor.execute("""
        INSERT INTO restaurant_settings (
            id, restaurant_name, tagline, address, phone, whatsapp,
            opening_time, closing_time, weekly_off, delivery_radius_km,
            delivery_fee, min_order_amount, free_delivery_threshold,
            prep_time_avg, gst_percentage, packaging_fee, store_status
        ) VALUES (
            'setting_1', 'Mhare Gaam Ki Rasoi', 'Ghar Jaisa Swaad',
            'Sai Plaza, Meerut, Uttar Pradesh, India',
            '+91 98765 43210', '+91 98765 43210',
            '10:00 AM', '11:00 PM', 'None', 12.0,
            35.0, 149.0, 499.0, 25, 5.0, 20.0, 'OPEN'
        )
    """)

    # 11. Sample Live Orders (for KDS, POS, and Order Tracking)
    # Order 1: New order placed by Gaurav
    ord_1 = (
        'ord_new_1', 'MGK-1001', 'user_cust_1', 'Gaurav Singh', '9876543210',
        'DELIVERY', None, 'PLACED', 468.0, 75.0, 20.0, 0.0, 20.65, 433.65,
        'UPI', 'COMPLETED', 'Flat 402, Green Valley Apartments, Near Sai Plaza, Meerut',
        'Please make it less spicy, extra green chillies on side.', None, 25
    )
    cursor.execute("""
        INSERT INTO orders (
            id, order_number, user_id, customer_name, customer_phone,
            order_type, table_number, status, subtotal, discount,
            packaging_fee, delivery_fee, taxes, grand_total,
            payment_method, payment_status, delivery_address,
            cooking_instructions, assigned_agent_id, prep_time_minutes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, ord_1)

    cursor.execute("""
        INSERT INTO order_items (id, order_id, menu_item_id, item_name, item_price, quantity, addons_json, subtotal)
        VALUES
        ('oi_1', 'ord_new_1', 'dish_pbm', 'Paneer Butter Masala', 249.0, 1, '["Extra Desi Butter Dollop (+₹20)"]', 269.0),
        ('oi_2', 'ord_new_1', 'dish_garlic_naan', 'Garlic Naan', 55.0, 2, '[]', 110.0),
        ('oi_3', 'ord_new_1', 'dish_gulab_jamun', 'Desi Ghee Gulab Jamun (2 Pcs)', 69.0, 1, '[]', 69.0)
    """)

    # Order 2: Accepted & Preparing (KDS stage 2 & 3)
    ord_2 = (
        'ord_active_1', 'MGK-1002', 'user_cust_2', 'Priya Sharma', '9876543211',
        'DINE_IN', 'Table 3', 'PREPARING', 568.0, 50.0, 0.0, 0.0, 25.90, 543.90,
        'CASH', 'COMPLETED', 'Table 3 - Dine In',
        'Crispy tandoori rotis with hot dal.', None, 20
    )
    cursor.execute("""
        INSERT INTO orders (
            id, order_number, user_id, customer_name, customer_phone,
            order_type, table_number, status, subtotal, discount,
            packaging_fee, delivery_fee, taxes, grand_total,
            payment_method, payment_status, delivery_address,
            cooking_instructions, assigned_agent_id, prep_time_minutes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, ord_2)

    cursor.execute("""
        INSERT INTO order_items (id, order_id, menu_item_id, item_name, item_price, quantity, addons_json, subtotal)
        VALUES
        ('oi_4', 'ord_active_1', 'dish_mg_thali', 'Mhare Gaam Special Thali', 349.0, 1, '[]', 349.0),
        ('oi_5', 'ord_active_1', 'dish_dal_makhani', 'Gaam Ki Dal Makhani', 219.0, 1, '["Extra Desi Butter Dollop (+₹20)"]', 219.0)
    """)

    # Order 3: Out for delivery
    ord_3 = (
        'ord_delivering_1', 'MGK-1000', 'user_cust_1', 'Gaurav Singh', '9876543210',
        'DELIVERY', None, 'OUT_FOR_DELIVERY', 328.0, 0.0, 20.0, 35.0, 16.40, 399.40,
        'UPI', 'COMPLETED', 'Flat 402, Green Valley Apartments, Near Sai Plaza, Meerut',
        'Call upon arrival.', 'agent_2', 15
    )
    cursor.execute("""
        INSERT INTO orders (
            id, order_number, user_id, customer_name, customer_phone,
            order_type, table_number, status, subtotal, discount,
            packaging_fee, delivery_fee, taxes, grand_total,
            payment_method, payment_status, delivery_address,
            cooking_instructions, assigned_agent_id, prep_time_minutes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, ord_3)

    cursor.execute("""
        INSERT INTO order_items (id, order_id, menu_item_id, item_name, item_price, quantity, addons_json, subtotal)
        VALUES
        ('oi_6', 'ord_delivering_1', 'dish_chole_bhature', 'Amritsari Chole Bhature', 169.0, 1, '[]', 169.0),
        ('oi_7', 'ord_delivering_1', 'dish_rajma_chawal', 'Dhaba Style Rajma Chawal', 159.0, 1, '[]', 159.0)
    """)

    # 12. Reward points for user_cust_1
    cursor.execute("""
        INSERT INTO reward_transactions (id, user_id, order_id, points, type, description)
        VALUES
        ('rew_1', 'user_cust_1', 'ord_delivering_1', 20, 'EARNED', 'Order MGK-1000 loyalty points (₹100 = 5 points)'),
        ('rew_2', 'user_cust_1', NULL, 50, 'EARNED', 'Welcome Signup Bonus points')
    """)

    # 13. Sample Reviews
    cursor.execute("""
        INSERT INTO reviews (id, order_id, user_id, customer_name, rating, food_rating, packaging_rating, delivery_rating, comment)
        VALUES
        ('rev_1', 'ord_delivering_1', 'user_cust_1', 'Gaurav Singh', 5, 5, 5, 5, 'Asli gaam ka swaad! Dal makhani and butter naan were outstanding.')
    """)

    # 14. Notifications
    cursor.execute("""
        INSERT INTO notifications (id, user_id, title, message, type, is_read)
        VALUES
        ('notif_1', 'user_cust_1', 'Your food is being prepared 👨‍🍳', 'Order MGK-1001 is being prepared with desi ghee and care.', 'ORDER', 0),
        ('notif_2', 'user_cust_1', 'Welcome to Mhare Gaam Ki Rasoi! 🙏', 'Enjoy 50% off on your first order with coupon WELCOME50.', 'PROMO', 1)
    """)

    conn.commit()
    conn.close()
    print("Database successfully populated with realistic demo restaurant data!")

if __name__ == '__main__':
    seed_all()
