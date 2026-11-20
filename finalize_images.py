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

TARGETS = {
    'dish_jeera_rice': [
        'https://upload.wikimedia.org/wikipedia/commons/5/5e/Jeera-rice.JPG',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jeera-rice.JPG/640px-Jeera-rice.JPG'
    ],
    'dish_chaas': [
        'https://upload.wikimedia.org/wikipedia/commons/f/f9/Mint_lassi.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Mint_lassi.jpg/640px-Mint_lassi.jpg'
    ],
    'dish_samosa_chaat': [
        'https://upload.wikimedia.org/wikipedia/commons/c/c4/Samosas%2C_snack_food_at_Wikipedia%27s_16th_Birthday_celebration_in_Chittagong_%2801%29.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Samosas%2C_snack_food_at_Wikipedia%27s_16th_Birthday_celebration_in_Chittagong_%2801%29.jpg/640px-Samosas%2C_snack_food_at_Wikipedia%27s_16th_Birthday_celebration_in_Chittagong_%2801%29.jpg'
    ],
    'dish_sweet_lassi': [
        'https://upload.wikimedia.org/wikipedia/commons/f/f1/Salt_lassi.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Salt_lassi.jpg/640px-Salt_lassi.jpg'
    ],
    'dish_kheer': [
        'https://upload.wikimedia.org/wikipedia/commons/4/46/Kheer.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Kheer.jpg/640px-Kheer.jpg'
    ],
    'dish_missi_roti': [
        'https://upload.wikimedia.org/wikipedia/commons/7/74/2020-05-08_19_34_28_Chapati_being_made_in_a_pan_in_the_Franklin_Farm_section_of_Oak_Hill%2C_Fairfax_County%2C_Virginia.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/2020-05-08_19_34_28_Chapati_being_made_in_a_pan_in_the_Franklin_Farm_section_of_Oak_Hill%2C_Fairfax_County%2C_Virginia.jpg/640px-2020-05-08_19_34_28_Chapati_being_made_in_a_pan_in_the_Franklin_Farm_section_of_Oak_Hill%2C_Fairfax_County%2C_Virginia.jpg'
    ],
    'dish_garlic_naan': [
        'https://upload.wikimedia.org/wikipedia/commons/4/4e/Annapurna_Naan.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Annapurna_Naan.jpg/640px-Annapurna_Naan.jpg'
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

for did, urls in TARGETS.items():
    dest_file = os.path.join(OUTPUT_DIR, f"{did}.jpg")
    print(f"Downloading {did}...", end=" ", flush=True)
    saved = False
    for u in urls:
        try:
            req = urllib.request.Request(u, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = resp.read()
                if len(data) > 3000:
                    sz = process_and_save(data, dest_file)
                    print(f"SAVED ({sz // 1024} KB) from {u.split('/')[-1][:30]}")
                    saved = True
                    break
        except Exception as e:
            print(f"err({e})", end=" ", flush=True)
        time.sleep(1)
    if not saved:
        print(f"FAILED for {did}!")

print("\nFinal image check complete.")
