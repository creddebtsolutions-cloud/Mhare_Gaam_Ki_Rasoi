import urllib.request
import os
import io
import time
from PIL import Image

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
}

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'static', 'assets', 'dishes')
os.makedirs(OUTPUT_DIR, exist_ok=True)

REMAINING_DISHES = {
    'dish_gulab_jamun': [
        'https://upload.wikimedia.org/wikipedia/commons/3/34/A_bowl_of_Gulab_Jamun.jpg',
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80'
    ],
    'dish_aloo_paratha': [
        'https://upload.wikimedia.org/wikipedia/commons/9/94/Aaloo_Paratha.JPG',
        'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80'
    ],
    'dish_samosa_chaat': [
        'https://upload.wikimedia.org/wikipedia/commons/6/6d/Samosa_chaat.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/e/ec/Samosa_chaat_in_making.jpg'
    ],
    'dish_butter_naan': [
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        'https://upload.wikimedia.org/wikipedia/commons/9/95/Butter_Naan.jpg'
    ],
    'dish_garlic_naan': [
        'https://upload.wikimedia.org/wikipedia/commons/f/f9/Garlic_naan.jpg',
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80'
    ],
    'dish_tandoori_roti': [
        'https://upload.wikimedia.org/wikipedia/commons/1/15/Tandoori_Roti.jpg',
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'
    ],
    'dish_missi_roti': [
        'https://upload.wikimedia.org/wikipedia/commons/4/4c/Missi_Roti.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/1/15/Tandoori_Roti.jpg'
    ],
    'dish_veg_biryani': [
        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Hyderabadi_Dum_Biryani.jpg',
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80'
    ],
    'dish_jeera_rice': [
        'https://upload.wikimedia.org/wikipedia/commons/9/92/Jeera_Rice.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/5/5e/Jeera_rice.jpg'
    ],
    'dish_family_combo': [
        'https://upload.wikimedia.org/wikipedia/commons/7/76/Vegetarian_Spread_-_Bengaluru%2C_India.jpg',
        'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80'
    ],
    'dish_kheer': [
        'https://upload.wikimedia.org/wikipedia/commons/d/d4/Rice_kheer.jpg',
        'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80'
    ],
    'dish_sweet_lassi': [
        'https://upload.wikimedia.org/wikipedia/commons/5/52/Lassi_in_Kulhad.jpg',
        'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80'
    ],
    'dish_chaas': [
        'https://upload.wikimedia.org/wikipedia/commons/0/00/Masala_chaas.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/f/f1/Salt_lassi.jpg'
    ]
}

def process_and_save(img_bytes, dest_path):
    img = Image.open(io.BytesIO(img_bytes))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    target_w, target_h = 800, 600
    img_w, img_h = img.size
    aspect = target_w / target_h
    current_aspect = img_w / img_h
    
    if current_aspect > aspect:
        new_w = int(img_h * aspect)
        left = (img_w - new_w) // 2
        img = img.crop((left, 0, left + new_w, img_h))
    else:
        new_h = int(img_w / aspect)
        top = (img_h - new_h) // 2
        img = img.crop((0, top, img_w, top + new_h))
        
    img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    img.save(dest_path, 'JPEG', quality=85, optimize=True)
    return os.path.getsize(dest_path)

for did, urls in REMAINING_DISHES.items():
    dest_file = os.path.join(OUTPUT_DIR, f"{did}.jpg")
    print(f"Downloading {did}...", end=" ", flush=True)
    saved = False
    for u in urls:
        try:
            req = urllib.request.Request(u, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = resp.read()
                if len(data) > 5000:
                    sz = process_and_save(data, dest_file)
                    print(f"SUCCESS from {u.split('/')[-1][:25]} ({sz // 1024} KB)")
                    saved = True
                    break
        except Exception as e:
            print(f"err({e})", end=" ", flush=True)
        time.sleep(1)
    if not saved:
        print(f"FAILED for {did}!")

print("\nFinished checking remaining dishes.")
