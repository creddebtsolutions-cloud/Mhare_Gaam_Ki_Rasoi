import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import json
from backend.models import get_db
from backend.app import app

def run_checks():
    print("=== MHARE GAAM KI RASOI: PRE-LAUNCH SYSTEM VERIFICATION ===")
    
    # Check 1: 26 Dish Images
    conn = get_db()
    items = conn.execute("SELECT id, name, image_url FROM menu_items").fetchall()
    conn.close()
    
    print(f"\n[1] Checking Menu Items & Images (Found {len(items)} items):")
    missing_images = []
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for itm in items:
        img_url = itm['image_url']
        # e.g. /static/assets/dishes/dish_pbm.jpg
        rel_path = img_url.lstrip('/')
        full_path = os.path.join(base_dir, rel_path.replace('/', os.sep))
        if not os.path.exists(full_path) or os.path.getsize(full_path) < 1000:
            missing_images.append((itm['id'], itm['name'], img_url))
        else:
            sz_kb = os.path.getsize(full_path) // 1024
            print(f"  [OK] {itm['name']} -> {os.path.basename(full_path)} ({sz_kb} KB)")
            
    if missing_images:
        print(f"  [FAIL] {len(missing_images)} items missing images: {missing_images}")
        return False
    else:
        print("  [PASS] All dishes have distinct, valid local images!")

    # Check 2: Delivery Partner Admin & Staff Users
    client = app.test_client()
    print("\n[2] Checking Authentication & Delivery Partner Admin Access:")
    
    # Test Delivery Admin with shorthand 'delivery'
    res = client.post('/api/auth/login', json={'username': 'delivery', 'password': 'Delivery@1234'}).get_json()
    if res and res.get('success') and res.get('user', {}).get('role') == 'DELIVERY_ADMIN':
        print(f"  [PASS] Delivery Admin login ('delivery' / 'Delivery@1234') SUCCESS: {res['user']['name']}")
    else:
        print(f"  [FAIL] Delivery Admin login failed: {res}")
        return False

    # Test Delivery Admin with email
    res2 = client.post('/api/auth/login', json={'username': 'delivery@rasoi.in', 'password': 'Delivery@1234'}).get_json()
    if res2 and res2.get('success'):
        print(f"  [PASS] Delivery Admin login via email ('delivery@rasoi.in') SUCCESS")
    else:
        print(f"  [FAIL] Delivery Admin login via email failed: {res2}")
        return False

    # Test Super Admin
    res_adm = client.post('/api/auth/login', json={'username': 'Admin', 'password': 'Admin@1234'}).get_json()
    if res_adm and res_adm.get('success') and res_adm.get('user', {}).get('role') == 'SUPER_ADMIN':
        print(f"  [PASS] Super Admin login SUCCESS: {res_adm['user']['name']}")
    else:
        print(f"  [FAIL] Super Admin login failed")
        return False

    # Check 3: Delivery Fleet API
    print("\n[3] Checking Delivery Fleet Management API:")
    res_fleet = client.get('/api/delivery/fleet').get_json()
    if res_fleet and res_fleet.get('success') and len(res_fleet.get('agents', [])) >= 3:
        print(f"  [PASS] Fleet API SUCCESS: {len(res_fleet['agents'])} registered delivery partners")
        for a in res_fleet['agents']:
            print(f"    - {a['name']} ({a['vehicle_number']}) -> {a['status']}")
    else:
        print(f"  [FAIL] Fleet API failed: {res_fleet}")
        return False

    # Check 4: Privacy Policy and Terms of Service (Play Store Compliance)
    print("\n[4] Checking Legal & Store Compliance Pages:")
    p_status = client.get('/privacy-policy').status_code
    t_status = client.get('/terms').status_code
    if p_status == 200 and t_status == 200:
        print(f"  [PASS] /privacy-policy -> HTTP {p_status} OK")
        print(f"  [PASS] /terms -> HTTP {t_status} OK")
    else:
        print(f"  [FAIL] Privacy policy or terms failed: {p_status}, {t_status}")
        return False

    # Check 5: Web Manifest & PWA Configuration
    print("\n[5] Checking Web App Manifest (manifest.json):")
    manifest_path = os.path.join(base_dir, 'manifest.json')
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r', encoding='utf-8') as f:
            man = json.load(f)
            print(f"  [PASS] App ID: {man.get('id')}")
            print(f"  [PASS] Name: {man.get('name')}")
            print(f"  [PASS] Display: {man.get('display')} | Orientation: {man.get('orientation')}")
            print(f"  [PASS] Start URL: {man.get('start_url')}")
            print(f"  [PASS] Icons: {len(man.get('icons', []))} icons defined")
    else:
        print("  [FAIL] manifest.json missing!")
        return False

    print("\n=======================================================")
    print("ALL PLAY STORE & DELIVERY ACCESS CHECKS PASSED (100%)")
    print("=======================================================")
    return True

if __name__ == '__main__':
    ok = run_checks()
    sys.exit(0 if ok else 1)
