import urllib.request
import urllib.parse
import json
import sys

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

dishes = [
    ('dish_mg_thali', ['Special Indian Thali', 'Grand Indian Thali', 'Rajasthani Thali']),
    ('dish_deluxe_thali', ['North Indian Thali vegetarian', 'Punjabi Thali', 'Indian Thali meal']),
    ('dish_gaam_thali', ['Simple Indian Thali', 'Homestyle Indian meal roti dal', 'Indian vegetarian meal plate']),
    ('dish_pbm', ['Paneer butter masala', 'Paneer makhani']),
    ('dish_kadhai_paneer', ['Kadai paneer', 'Karahi paneer', 'Kadhai paneer']),
    ('dish_shahi_paneer', ['Shahi paneer', 'Shahi paneer korma']),
    ('dish_paneer_tikka', ['Paneer tikka tandoori', 'Paneer tikka']),
    ('dish_dal_makhani', ['Dal makhani', 'Maa ki dal']),
    ('dish_dal_tadka', ['Dal tadka', 'Yellow dal tadka', 'Tadka dal']),
    ('dish_mix_veg', ['Mix veg curry', 'Vegetable handi', 'Mixed vegetable sabzi']),
    ('dish_jeera_aloo', ['Jeera aloo', 'Aloo jeera', 'Cumin potato']),
    ('dish_chole_bhature', ['Chole bhature', 'Chole bhature Indian']),
    ('dish_rajma_chawal', ['Rajma chawal', 'Rajma rice']),
    ('dish_aloo_paratha', ['Aloo paratha', 'Aloo paratha butter']),
    ('dish_samosa_chaat', ['Samosa chaat', 'Dahi samosa']),
    ('dish_butter_naan', ['Butter naan', 'Naan bread butter']),
    ('dish_garlic_naan', ['Garlic naan', 'Garlic naan bread']),
    ('dish_tandoori_roti', ['Tandoori roti', 'Roti tandoor']),
    ('dish_missi_roti', ['Missi roti', 'Besan roti']),
    ('dish_veg_biryani', ['Veg biryani handi', 'Vegetable dum biryani', 'Veg biryani']),
    ('dish_jeera_rice', ['Jeera rice', 'Cumin rice']),
    ('dish_family_combo', ['Indian food feast spread', 'Indian dinner spread', 'Indian vegetarian banquet']),
    ('dish_gulab_jamun', ['Gulab jamun sweet', 'Gulab jamun']),
    ('dish_kheer', ['Kheer rice pudding', 'Kesar kheer', 'Rice kheer']),
    ('dish_sweet_lassi', ['Sweet lassi kulhad', 'Lassi clay cup', 'Punjabi lassi']),
    ('dish_chaas', ['Masala chaas', 'Chaas buttermilk', 'Spiced buttermilk Indian'])
]

def search_wikimedia(query):
    url = f'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(query)}&gsrnamespace=6&gsrlimit=4&prop=imageinfo&iiprop=url|size|mime&format=json'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            results = []
            for pid, p in pages.items():
                title = p.get('title', '')
                info = p.get('imageinfo', [{}])[0]
                mime = info.get('mime', '')
                if mime in ['image/jpeg', 'image/png']:
                    w = info.get('width', 0)
                    h = info.get('height', 0)
                    if w >= 400 and h >= 300:
                        results.append({
                            'title': title,
                            'url': info.get('url'),
                            'width': w,
                            'height': h
                        })
            return results
    except Exception as e:
        return []

selected = {}
for did, queries in dishes:
    found = False
    for q in queries:
        res = search_wikimedia(q)
        if res:
            selected[did] = {'query': q, 'match': res[0]}
            print(f"[FOUND] {did} via '{q}': {res[0]['title']} ({res[0]['width']}x{res[0]['height']})", flush=True)
            found = True
            break
    if not found:
        print(f"[MISSING] {did}", flush=True)

with open('scripts/search_results.json', 'w', encoding='utf-8') as f:
    json.dump(selected, f, indent=2)
print(f"Total found: {len(selected)} / {len(dishes)}", flush=True)
