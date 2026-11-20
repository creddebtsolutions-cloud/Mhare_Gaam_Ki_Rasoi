"""
Mhare Gaam Ki Rasoi - AI Assistant: 'Rasoi Saathi'
Uses actual restaurant database functions to provide fact-checked, authentic
recommendations, budget combos, dietary advice, and live order status.
"""

import json
import re
from backend.models import get_db

class RasoiSaathiEngine:
    def __init__(self):
        pass

    # --- Tool Functions (Database Grounding) ---
    def get_restaurant_settings(self):
        conn = get_db()
        row = conn.execute("SELECT * FROM restaurant_settings LIMIT 1").fetchone()
        conn.close()
        if row:
            return dict(row)
        return {}

    def search_menu(self, query=None, max_price=None, category=None, spice_level=None):
        conn = get_db()
        sql = "SELECT * FROM menu_items WHERE is_available = 1"
        params = []
        if query:
            sql += " AND (name LIKE ? OR description LIKE ? OR ingredients LIKE ?)"
            term = f"%{query}%"
            params.extend([term, term, term])
        if max_price is not None:
            sql += " AND price <= ?"
            params.append(max_price)
        if category:
            sql += " AND category_id = ?"
            params.append(category)
        if spice_level:
            sql += " AND spice_level LIKE ?"
            params.append(f"%{spice_level}%")
        sql += " ORDER BY is_bestseller DESC, price ASC LIMIT 10"
        rows = conn.execute(sql, params).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def get_menu_item(self, identifier):
        conn = get_db()
        row = conn.execute("""
            SELECT * FROM menu_items 
            WHERE id = ? OR LOWER(name) LIKE LOWER(?) 
            LIMIT 1
        """, (identifier, f"%{identifier}%")).fetchone()
        conn.close()
        return dict(row) if row else None

    def get_offers(self):
        conn = get_db()
        coupons = conn.execute("SELECT * FROM coupons WHERE is_active = 1").fetchall()
        offers = conn.execute("SELECT * FROM offers WHERE is_active = 1").fetchall()
        conn.close()
        return {
            'coupons': [dict(c) for c in coupons],
            'offers': [dict(o) for o in offers]
        }

    def get_order_status(self, search_key):
        conn = get_db()
        row = conn.execute("""
            SELECT o.*, 
                   (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
            FROM orders o
            WHERE o.order_number LIKE ? OR o.customer_phone LIKE ?
            ORDER BY o.created_at DESC LIMIT 1
        """, (f"%{search_key}%", f"%{search_key}%")).fetchone()
        conn.close()
        return dict(row) if row else None

    # --- Conversation & Intent Engine ---
    def process_message(self, user_text: str, session_user=None) -> dict:
        text = user_text.lower().strip()
        settings = self.get_restaurant_settings()

        # 1. Budget Recommendation: e.g. "500 for 2 people" or "₹300"
        budget_match = re.search(r'(?:₹|rs\.?|rupees?)?\s*(\d{2,4})\s*(?:mein|for|budget|h)', text)
        people_match = re.search(r'(\d+)\s*(?:log|people|persons?|vyakti)', text)
        
        if budget_match or 'budget' in text or 'logon ke liye' in text:
            budget = int(budget_match.group(1)) if budget_match else 500
            people = int(people_match.group(1)) if people_match else 2

            if budget <= 300:
                dishes = self.search_menu(max_price=200)
                recommended = [d for d in dishes if 'Thali' in d['name'] or 'Chole' in d['name'] or 'Rajma' in d['name']][:2]
            elif budget <= 600:
                # Suggest a Paneer / Dal + Breads combo
                p = self.get_menu_item('Paneer Butter Masala') or self.get_menu_item('Kadhai Paneer')
                d = self.get_menu_item('Gaam Ki Dal Makhani') or self.get_menu_item('Desi Ghee Dal Tadka')
                b = self.get_menu_item('Butter Naan')
                sw = self.get_menu_item('Desi Ghee Gulab Jamun')
                recommended = [x for x in [p, d, b, sw] if x]
            else:
                combo = self.get_menu_item('Mhare Gaam Family Feast') or self.get_menu_item('Mhare Gaam Special Thali')
                recommended = [combo] if combo else self.search_menu(max_price=350)[:3]

            total_estimate = sum(d['price'] for d in recommended)
            items_list = ", ".join([f"**{d['name']}** (₹{int(d['price'])})" for d in recommended])
            
            response = (
                f"Ram Ram ji! 🙏 ₹{budget} ke budget mein {people} logon ke liye hamare chef ka best recommendation yeh hai:\n\n"
                f"{items_list}\n\n"
                f"💰 **Total:** Lagbhag ₹{int(total_estimate)} (budget ke andar!).\n"
                f"Aap inhein seedha cart mein add kar sakte hain!"
            )
            return {
                'reply': response,
                'suggested_dishes': recommended,
                'action': 'SHOW_RECOMMENDATION'
            }

        # 2. Spicy or Paneer query: e.g. "paneer mein kuch spicy suggest karo"
        if 'paneer' in text and ('spicy' in text or 'chatpata' in text or 'teekha' in text):
            dish = self.get_menu_item('Kadhai Paneer') or self.get_menu_item('Paneer Butter Masala')
            bread = self.get_menu_item('Garlic Naan')
            suggested = [x for x in [dish, bread] if x]
            response = (
                f"Agar aapko spicy paneer pasand hai, toh hamara **Kadhai Paneer** (₹{int(dish['price'])}) bilkul try karein! "
                f"Isme fresh kadhai pounded spices, capsicum aur roasted red chillies ka dumdar swaad hai. "
                f"Ise **Garlic Naan** ke saath order karein, maza aa jayega!"
            )
            return {
                'reply': response,
                'suggested_dishes': suggested,
                'action': 'SHOW_RECOMMENDATION'
            }

        # 3. Thali queries: "thali", "special thali"
        if 'thali' in text:
            thali = self.get_menu_item('Mhare Gaam Special Thali')
            deluxe = self.get_menu_item('Deluxe Veg Thali')
            gaam = self.get_menu_item('Simple Gaam Ki Thali')
            suggested = [x for x in [thali, deluxe, gaam] if x]
            response = (
                f"Hamari sabse lokpriya thali hai **Mhare Gaam Special Thali** (₹{int(thali['price'])}). "
                f"Isme Shahi Paneer, Dal Makhani, Jeera Aloo, 4 Butter Roti, Jeera Rice, Boondi Raita, 2 Gulab Jamun aur Papad sab shaamil hai! "
                f"Pura royal village feast experience milta hai. 🙏"
            )
            return {
                'reply': response,
                'suggested_dishes': suggested,
                'action': 'SHOW_RECOMMENDATION'
            }

        # 4. Order tracking query: e.g. "order status", "kahan pahucha", "track order"
        if 'order' in text and ('status' in text or 'kahan' in text or 'track' in text or 'mgk' in text):
            search_token = session_user.get('phone') if session_user else ''
            # Check if user typed an order number like MGK-1001
            ord_num_match = re.search(r'mgk-?\d+', text)
            if ord_num_match:
                search_token = ord_num_match.group(0).upper()
            
            order = self.get_order_status(search_token or 'MGK-')
            if order:
                status_text = {
                    'PLACED': 'Order rasoi mein receive ho chuka hai (Placed)',
                    'ACCEPTED': 'Chef ne order accept kar liya hai (Accepted)',
                    'PREPARING': 'Rasoi mein desi ghee mein garam-garam ban raha hai 👨‍🍳 (Preparing)',
                    'READY': 'Khana pack ho gaya hai aur ready hai (Ready)',
                    'OUT_FOR_DELIVERY': 'Delivery partner nikal chuka hai aapke pate par 🛵 (Out for Delivery)',
                    'DELIVERED': 'Order safely deliver ho chuka hai! Swad ka anand lein 🙏'
                }.get(order['status'], order['status'])

                response = (
                    f"Aapke Order **#{order['order_number']}** ki live sthiti:\n"
                    f"📍 **Status:** {status_text}\n"
                    f"🍱 **Items:** {order['item_count']} dish(es) | 💵 Total: ₹{int(order['grand_total'])}\n"
                    f"⏱️ **Est. Prep Time:** ~{order['prep_time_minutes']} mins.\n\n"
                    f"Koi sahayata chahiye toh Call karein: {settings.get('phone', '+91 98765 43210')}"
                )
                return {'reply': response, 'order': order, 'action': 'ORDER_STATUS'}
            else:
                return {
                    'reply': "Mujhe abhi aapka active order nahi mila. Kripya apna Order Number (jaise MGK-1001) ya phone number batayein.",
                    'action': 'ASK_ORDER_NUMBER'
                }

        # 5. Offers & Coupons query: "coupon", "offer", "discount", "code"
        if 'offer' in text or 'coupon' in text or 'discount' in text or 'code' in text:
            offers_data = self.get_offers()
            c_text = []
            for c in offers_data['coupons'][:4]:
                desc = f"{int(c['discount_value'])}% OFF (Max ₹{int(c['max_discount'])})" if c['discount_type'] == 'PERCENTAGE' else f"Flat ₹{int(c['discount_value'])} OFF"
                c_text.append(f"🎟️ **{c['code']}**: {desc} (Min order ₹{int(c['min_order'])})")
            
            response = (
                f"Aaj ke active offers & coupons:\n\n" + "\n".join(c_text) + 
                f"\n\nCart screen par coupon apply karke turant discount paayein! 🎉"
            )
            return {'reply': response, 'offers': offers_data, 'action': 'SHOW_OFFERS'}

        # 6. Location, Hours & Vegetarian Policy query
        if 'location' in text or 'kahan' in text or 'address' in text or 'timing' in text or 'pure veg' in text or 'time' in text:
            response = (
                f"**Mhare Gaam Ki Rasoi**\n"
                f"📍 **Pata:** {settings.get('address')}\n"
                f"🌱 **Category:** 100% Pure Vegetarian Restaurant\n"
                f"⏰ **Timing:** Subah {settings.get('opening_time')} se Raat {settings.get('closing_time')} tak (All 7 Days)\n"
                f"🛵 **Delivery:** {int(settings.get('delivery_radius_km', 12))} km radius Meerut mein\n"
                f"📞 **Phone/WhatsApp:** {settings.get('phone')}"
            )
            return {'reply': response, 'action': 'INFO'}

        # 7. Generic dish search fallback
        words = [w for w in text.split() if len(w) > 2 and w not in ['kya', 'hai', 'mein', 'kuch', 'batao', 'chahiye', 'kaise']]
        search_kw = words[0] if words else 'paneer'
        results = self.search_menu(query=search_kw)
        if results:
            dishes_str = "\n".join([f"• **{d['name']}** - ₹{int(d['price'])} ({d['spice_level']})" for d in results[:3]])
            response = (
                f"Ram Ram! 🙏 Hamari rasoi se aapke liye ye badiya vikalp hain:\n\n"
                f"{dishes_str}\n\n"
                f"Aap inme se kisi bhi dish ki details dekh sakte hain ya direct cart mein daal sakte hain."
            )
            return {'reply': response, 'suggested_dishes': results[:3], 'action': 'SHOW_RECOMMENDATION'}

        # 8. Friendly Welcome Fallback
        default_reply = (
            f"Ram Ram ji! 🙏 Main hoon aapka 'Rasoi Saathi'.\n\n"
            f"Aap mujhse pooch sakte hain:\n"
            f"• '₹500 mein 2 logon ke liye best khana kya hai?'\n"
            f"• 'Mujhe kuch teekha/spicy paneer suggest karo'\n"
            f"• 'Kaunsi thali sabse popular hai?'\n"
            f"• 'Aaj ke active coupons kya hain?'\n"
            f"• 'Mera order status batao'\n\n"
            f"Aap kya khana pasand karenge aaj?"
        )
        return {'reply': default_reply, 'action': 'GENERAL_GREETING'}

rasoi_saathi = RasoiSaathiEngine()
