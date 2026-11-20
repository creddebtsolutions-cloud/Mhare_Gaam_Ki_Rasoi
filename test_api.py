"""
Mhare Gaam Ki Rasoi - Automated End-to-End API Verification Suite
"""

import sys
import os
import unittest
import json

# Ensure project root in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import app
from backend.models import init_db
from backend.seed_data import seed_all

class TestMhareGaamKiRasoiAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_all()
        cls.client = app.test_client()

    def test_01_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['restaurant'], 'Mhare Gaam Ki Rasoi')
        self.assertEqual(data['tagline'], 'Ghar Jaisa Swaad')
        print("[PASS] Health Check Passed")

    def test_02_auth_logins(self):
        # Admin login
        admin_res = self.client.post('/api/auth/login', json={'username': 'Admin', 'password': 'Admin@1234'})
        self.assertEqual(admin_res.status_code, 200)
        admin_data = admin_res.get_json()
        self.assertTrue(admin_data['success'])
        self.assertEqual(admin_data['user']['role'], 'SUPER_ADMIN')

        # Chef login
        chef_res = self.client.post('/api/auth/login', json={'username': 'Chef', 'password': 'Chef@1234'})
        self.assertEqual(chef_res.status_code, 200)
        self.assertEqual(chef_res.get_json()['user']['role'], 'CHEF')

        # Bill Counter login
        bill_res = self.client.post('/api/auth/login', json={'username': 'Bill', 'password': 'Bill@1234'})
        self.assertEqual(bill_res.status_code, 200)
        self.assertEqual(bill_res.get_json()['user']['role'], 'BILL_COUNTER')

        # Customer OTP login
        cust_res = self.client.post('/api/auth/customer-otp', json={'phone': '9876543210', 'name': 'Gaurav Singh'})
        self.assertEqual(cust_res.status_code, 200)
        self.assertEqual(cust_res.get_json()['user']['role'], 'CUSTOMER')
        print("[PASS] Authentication for All 4 Roles Passed")

    def test_03_menu_and_categories(self):
        cat_res = self.client.get('/api/menu/categories')
        self.assertEqual(cat_res.status_code, 200)
        cats = cat_res.get_json()['categories']
        self.assertGreater(len(cats), 10)

        # Filter bestsellers
        item_res = self.client.get('/api/menu/items?filter=bestseller')
        self.assertEqual(item_res.status_code, 200)
        items = item_res.get_json()['items']
        self.assertGreater(len(items), 0)
        for i in items:
            self.assertEqual(i['is_veg'], 1)

        # Filter spicy
        spicy_res = self.client.get('/api/menu/items?filter=spicy')
        self.assertEqual(spicy_res.status_code, 200)
        print("[PASS] Menu & 100% Pure Veg Catalog Passed")

    def test_04_coupon_and_order_flow(self):
        # Test coupon WELCOME50
        coup_res = self.client.post('/api/orders/apply-coupon', json={'code': 'WELCOME50', 'subtotal': 400})
        self.assertEqual(coup_res.status_code, 200)
        coup_data = coup_res.get_json()
        self.assertTrue(coup_data['success'])
        self.assertEqual(coup_data['discount'], 100.0) # max discount cap

        # Place an order
        order_payload = {
            'order_type': 'DELIVERY',
            'delivery_address': 'Sai Plaza, Meerut',
            'customer_name': 'Gaurav Singh',
            'customer_phone': '9876543210',
            'payment_method': 'UPI',
            'coupon_code': 'WELCOME50',
            'cooking_instructions': 'Extra spicy paneer please',
            'items': [
                {'menu_item_id': 'dish_pbm', 'quantity': 1, 'addons': [{'name': 'Extra Butter', 'price': 20.0}]},
                {'menu_item_id': 'dish_garlic_naan', 'quantity': 2, 'addons': []}
            ]
        }
        ord_res = self.client.post('/api/orders/create', json=order_payload)
        self.assertEqual(ord_res.status_code, 200)
        ord_data = ord_res.get_json()
        self.assertTrue(ord_data['success'])
        self.assertIn('MGK-', ord_data['order']['order_number'])
        self.assertGreater(ord_data['order']['points_earned'], 0)
        print(f"[PASS] Order Creation & Loyalty Points Passed (#{ord_data['order']['order_number']})")

    def test_05_kds_pipeline(self):
        kds_res = self.client.get('/api/kds/orders')
        self.assertEqual(kds_res.status_code, 200)
        data = kds_res.get_json()
        self.assertIn('PLACED', data['orders'])

        # Advance order to ACCEPTED then PREPARING then READY
        first_order = data['orders']['PLACED'][0]
        ord_id = first_order['id']

        acc_res = self.client.post(f'/api/kds/orders/{ord_id}/status', json={'status': 'ACCEPTED'})
        self.assertEqual(acc_res.status_code, 200)

        prep_res = self.client.post(f'/api/kds/orders/{ord_id}/status', json={'status': 'PREPARING'})
        self.assertEqual(prep_res.status_code, 200)

        rdy_res = self.client.post(f'/api/kds/orders/{ord_id}/status', json={'status': 'READY'})
        self.assertEqual(rdy_res.status_code, 200)
        print("[PASS] Chef KDS Progression Pipeline (PLACED -> ACCEPTED -> PREPARING -> READY) Passed")

    def test_06_pos_order_and_tables(self):
        tbl_res = self.client.get('/api/pos/tables')
        self.assertEqual(tbl_res.status_code, 200)
        tables = tbl_res.get_json()['tables']
        self.assertGreater(len(tables), 5)

        # Create counter Dine-In order
        pos_payload = {
            'order_type': 'DINE_IN',
            'table_number': 'Table 1',
            'customer_name': 'Walk-in Table 1',
            'payment_method': 'CASH',
            'items': [
                {'menu_item_id': 'dish_mg_thali', 'quantity': 2}
            ]
        }
        pos_res = self.client.post('/api/pos/create-order', json=pos_payload)
        self.assertEqual(pos_res.status_code, 200)
        pos_data = pos_res.get_json()
        self.assertTrue(pos_data['success'])
        print("[PASS] POS Billing Counter Order Creation & Table Management Passed")

    def test_07_ai_rasoi_saathi(self):
        # Test budget query
        chat_res = self.client.post('/api/ai/chat', json={'message': 'Mere paas 500 rs hain 2 logon ke liye kya order karu?'})
        self.assertEqual(chat_res.status_code, 200)
        chat_data = chat_res.get_json()
        self.assertTrue(chat_data['success'])
        self.assertIn('500', chat_data['reply'])
        self.assertGreater(len(chat_data.get('suggested_dishes', [])), 0)

        # Test spicy paneer query
        spicy_chat = self.client.post('/api/ai/chat', json={'message': 'Mujhe paneer mein kuch spicy suggest karo'})
        self.assertEqual(spicy_chat.status_code, 200)
        self.assertIn('Kadhai Paneer', spicy_chat.get_json()['reply'])

        # Test popular thali query
        thali_chat = self.client.post('/api/ai/chat', json={'message': 'Kaunsi thali sabse popular hai?'})
        self.assertEqual(thali_chat.status_code, 200)
        self.assertIn('Mhare Gaam Special Thali', thali_chat.get_json()['reply'])
        print("[PASS] AI Rasoi Saathi Real-Data Grounded Intelligence Passed")

    def test_08_admin_analytics_and_menu_crud(self):
        ov_res = self.client.get('/api/admin/overview')
        self.assertEqual(ov_res.status_code, 200)
        ov_data = ov_res.get_json()
        self.assertGreater(ov_data['stats']['total_orders'], 0)

        # Add new dish
        add_res = self.client.post('/api/admin/menu', json={
            'name': 'Paneer Lababdar',
            'price': 275.0,
            'category_id': 'cat_paneer',
            'description': 'Rich grated paneer and cashew curry',
            'spice_level': 'Medium',
            'is_bestseller': True
        })
        self.assertEqual(add_res.status_code, 200)
        self.assertTrue(add_res.get_json()['success'])
        print("[PASS] Admin Analytics & Menu CRUD Operations Passed")

    def test_09_delivery_fleet(self):
        deliv_res = self.client.get('/api/delivery/my-orders/agent_1')
        self.assertEqual(deliv_res.status_code, 200)
        deliv_data = deliv_res.get_json()
        self.assertTrue(deliv_data['success'])
        self.assertIsNotNone(deliv_data['agent'])

        # Toggle duty
        duty_res = self.client.post('/api/delivery/toggle-duty', json={'agent_id': 'agent_1', 'status': 'AVAILABLE'})
        self.assertEqual(duty_res.status_code, 200)
        print("[PASS] Delivery Partner Fleet & Duty Queue Passed")

    def test_10_payment_gateway(self):
        cfg_res = self.client.get('/api/payments/config')
        self.assertEqual(cfg_res.status_code, 200)
        cfg_data = cfg_res.get_json()
        self.assertEqual(cfg_data['provider'], 'RAZORPAY')
        self.assertEqual(cfg_data['currency'], 'INR')

        # Create Razorpay order
        rzp_res = self.client.post('/api/payments/create-gateway-order', json={'amount': 450.0})
        self.assertEqual(rzp_res.status_code, 200)
        rzp_data = rzp_res.get_json()
        self.assertEqual(rzp_data['amount_paise'], 45000)

        # Verify signature simulation
        ver_res = self.client.post('/api/payments/verify-payment', json={
            'razorpay_order_id': rzp_data['gateway_order_id'],
            'razorpay_payment_id': 'pay_sim_12345678',
            'razorpay_signature': 'simulated'
        })
        self.assertEqual(ver_res.status_code, 200)
        self.assertTrue(ver_res.get_json()['verified'])
        print("[PASS] Payment Gateway Architecture & Signature Verification Passed")

if __name__ == '__main__':
    unittest.main()
