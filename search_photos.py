import urllib.request
import urllib.parse
import json

queries = [
    'indian thali vegetarian',
    'paneer butter masala',
    'kadai paneer',
    'shahi paneer',
    'paneer tikka tandoori',
    'dal makhani',
    'dal tadka',
    'mixed vegetable curry',
    'jeera aloo',
    'chole bhature',
    'rajma chawal',
    'aloo paratha',
    'samosa chaat',
    'butter naan',
    'garlic naan',
    'tandoori roti',
    'missi roti',
    'veg biryani handi',
    'jeera rice',
    'gulab jamun',
    'kheer',
    'sweet lassi',
    'masala chaas buttermilk'
]

results_map = {}
for q in queries:
    try:
        url = f"https://unsplash.com/napi/search/photos?query={urllib.parse.quote(q)}&per_page=3"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        res = urllib.request.urlopen(req, timeout=10)
        data = json.loads(res.read().decode('utf-8'))
        photos = data.get('results', [])
        if photos:
            p = photos[0]
            desc = p.get('alt_description') or p.get('description') or ''
            results_map[q] = {
                'id': p['id'],
                'url': p['urls']['regular'],
                'small': p['urls']['small'],
                'desc': desc
            }
            print(f"[FOUND] {q} -> ID: {p['id']} ({desc[:40]}...)")
        else:
            print(f"[EMPTY] {q}")
    except Exception as e:
        print(f"[ERROR] {q}: {e}")

with open('scratch/found_photos.json', 'w', encoding='utf-8') as f:
    json.dump(results_map, f, indent=2)

print("\nDone searching! Saved to scratch/found_photos.json")
