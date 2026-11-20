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

THUMB_MAP = {
    'dish_jeera_rice': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Jeera-rice.JPG/960px-Jeera-rice.JPG',
    'dish_sweet_lassi': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Lassi_%28Sweet%29.JPG/960px-Lassi_%28Sweet%29.JPG',
    'dish_chaas': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Masala_Buttermilk.JPG/960px-Masala_Buttermilk.JPG',
    'dish_kheer': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Kheer_Rice_Pudding_Indian_Sweet_Buffalo_New_York.jpg/960px-Kheer_Rice_Pudding_Indian_Sweet_Buffalo_New_York.jpg',
    'dish_samosa_chaat': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Samosa_Chaat.jpg/960px-Samosa_Chaat.jpg',
    'dish_missi_roti': 'https://upload.wikimedia.org/wikipedia/commons/1/16/Missi_Roti_With_Achar_And_Lassi....%21.jpg',
    'dish_garlic_naan': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Cheese_naan_and_Garlic_naan.jpg/960px-Cheese_naan_and_Garlic_naan.jpg',
    'dish_tandoori_roti': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Tandoori-roti.jpg/960px-Tandoori-roti.jpg'
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

for did, url in THUMB_MAP.items():
    dest_file = os.path.join(OUTPUT_DIR, f"{did}.jpg")
    print(f"Downloading {did} from {url[:50]}...", end=" ", flush=True)
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = resp.read()
            sz = process_and_save(data, dest_file)
            print(f"SUCCESS -> Saved {sz // 1024} KB")
    except Exception as e:
        print(f"FAILED: {e}")
    time.sleep(1)

print("\nDone downloading exact thumbs.")
