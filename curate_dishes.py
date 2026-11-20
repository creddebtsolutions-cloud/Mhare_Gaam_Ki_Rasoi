import urllib.request
import urllib.parse
import json
import time
import os
import io
from PIL import Image

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Referer': 'https://commons.wikimedia.org/'
}

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'static', 'assets', 'dishes')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Curated direct Wikimedia Commons / Wikipedia images known to accurately represent the dishes:
DIRECT_MAP = {
    'dish_mg_thali': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/%278%27_A_Thali%2C_a_traditional_style_of_serving_meal_in_India.jpg',
    'dish_deluxe_thali': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Great_Indian_Thali.jpg',
    'dish_gaam_thali': 'https://upload.wikimedia.org/wikipedia/commons/0/07/A_thali_with_daal_roti_bhindi_ki_sabzi_and_mango_pickle.jpg',
    'dish_pbm': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Paneer_Butter_Masala_3.jpg',
    'dish_kadhai_paneer': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Kadai_Paneer_%2815913018051%29.jpg',
    'dish_shahi_paneer': 'https://upload.wikimedia.org/wikipedia/commons/4/48/Shahi_Paneer_Korma.jpg',
    'dish_paneer_tikka': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Barbequed_Paneer_Tikka.jpg',
    'dish_dal_makhani': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Dal_Makhani..JPG',
    'dish_dal_tadka': 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Dal_Tadka-Delhi.jpg',
    'dish_mix_veg': 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Mix_Vegetable_Curry_Indian_style.jpg',
    'dish_jeera_aloo': 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Aalu_Jeera_1.jpg',
    'dish_chole_bhature': 'https://upload.wikimedia.org/wikipedia/commons/0/07/Chole_Bhature_1.jpg',
    'dish_rajma_chawal': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Rajma_Chawal_Rajma_Rice.jpg',
    'dish_aloo_paratha': 'https://upload.wikimedia.org/wikipedia/commons/9/94/Aaloo_Paratha.JPG',
    'dish_samosa_chaat': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Samosa_chaat.jpg',
    'dish_butter_naan': 'https://upload.wikimedia.org/wikipedia/commons/9/95/Butter_Naan.jpg',
    'dish_garlic_naan': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Garlic_naan.jpg',
    'dish_tandoori_roti': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Tandoori_Roti.jpg',
    'dish_missi_roti': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Missi_Roti.jpg',
    'dish_veg_biryani': 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Hyderabadi_Dum_Biryani.jpg',
    'dish_jeera_rice': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Jeera_Rice.jpg',
    'dish_family_combo': 'https://upload.wikimedia.org/wikipedia/commons/7/76/Vegetarian_Spread_-_Bengaluru%2C_India.jpg',
    'dish_gulab_jamun': 'https://upload.wikimedia.org/wikipedia/commons/3/34/A_bowl_of_Gulab_Jamun.jpg',
    'dish_kheer': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Rice_kheer.jpg',
    'dish_sweet_lassi': 'https://upload.wikimedia.org/wikipedia/commons/5/52/Lassi_in_Kulhad.jpg',
    'dish_chaas': 'https://upload.wikimedia.org/wikipedia/commons/0/00/Masala_chaas.jpg'
}

def search_wikimedia(query):
    api_url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(query)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|size|mime&format=json"
    req = urllib.request.Request(api_url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            for pid, p in pages.items():
                info = p.get('imageinfo', [{}])[0]
                mime = info.get('mime', '')
                if mime in ['image/jpeg', 'image/png']:
                    w = info.get('width', 0)
                    h = info.get('height', 0)
                    if w >= 400 and h >= 300:
                        return info.get('url')
    except Exception as e:
        print(f"  Search error for '{query}': {e}")
    return None

def process_and_save_image(img_bytes, dest_path):
    img = Image.open(io.BytesIO(img_bytes))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Target dimensions: 800 x 600 (4:3 aspect ratio)
    target_w, target_h = 800, 600
    img_w, img_h = img.size
    
    # Crop to 4:3 ratio centered
    aspect = target_w / target_h
    current_aspect = img_w / img_h
    
    if current_aspect > aspect:
        # Image is wider: crop width
        new_w = int(img_h * aspect)
        left = (img_w - new_w) // 2
        img = img.crop((left, 0, left + new_w, img_h))
    else:
        # Image is taller: crop height
        new_h = int(img_w / aspect)
        top = (img_h - new_h) // 2
        img = img.crop((0, top, img_w, top + new_h))
        
    img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    img.save(dest_path, 'JPEG', quality=85, optimize=True)
    return os.path.getsize(dest_path)

def download_image(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read()

print(f"Processing 26 dishes to {OUTPUT_DIR}...")

search_fallbacks = {
    'dish_mix_veg': 'Mix veg Indian sabzi',
    'dish_garlic_naan': 'Garlic naan bread',
    'dish_butter_naan': 'Butter naan tandoori',
    'dish_tandoori_roti': 'Tandoori roti',
    'dish_missi_roti': 'Missi roti besan',
    'dish_samosa_chaat': 'Dahi samosa chaat',
    'dish_veg_biryani': 'Vegetable dum biryani',
    'dish_jeera_rice': 'Jeera rice cumin',
    'dish_family_combo': 'Indian vegetarian thali banquet',
    'dish_kheer': 'Kheer dessert Indian',
    'dish_sweet_lassi': 'Sweet lassi',
    'dish_chaas': 'Chaas buttermilk'
}

successes = 0
failures = []

for did, direct_url in DIRECT_MAP.items():
    dest_path = os.path.join(OUTPUT_DIR, f"{did}.jpg")
    print(f"\nFetching {did}...", end=" ", flush=True)
    
    img_bytes = None
    # 1. Try direct URL
    try:
        img_bytes = download_image(direct_url)
        print("Direct URL OK", end=" ", flush=True)
    except Exception as e:
        print(f"Direct failed ({e}), searching...", end=" ", flush=True)
        time.sleep(1)
        fallback_query = search_fallbacks.get(did, did.replace('dish_', '').replace('_', ' '))
        found_url = search_wikimedia(fallback_query)
        if found_url:
            try:
                img_bytes = download_image(found_url)
                print(f"Found & downloaded via '{fallback_query}'", end=" ", flush=True)
            except Exception as e2:
                print(f"Fallback download error: {e2}", end=" ", flush=True)

    if img_bytes:
        try:
            sz = process_and_save_image(img_bytes, dest_path)
            print(f"-> SAVED ({sz // 1024} KB)")
            successes += 1
        except Exception as pe:
            print(f"-> Image processing error: {pe}")
            failures.append(did)
    else:
        print("-> FAILED")
        failures.append(did)
        
    time.sleep(0.5)

print(f"\n======================================")
print(f"Result: {successes}/26 images saved successfully.")
if failures:
    print(f"Failures: {failures}")
