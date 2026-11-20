import urllib.request
import urllib.parse
import json
import time

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

categories = [
    'Thali',
    'Paneer_butter_masala',
    'Kadai_paneer',
    'Paneer_tikka',
    'Dal_makhani',
    'Dal_tadka',
    'Chole_bhature',
    'Rajma',
    'Aloo_paratha',
    'Naan',
    'Roti',
    'Biryani',
    'Gulab_jamun',
    'Kheer',
    'Lassi',
    'Chaas'
]

def list_category(cat):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:{urllib.parse.quote(cat)}&cmtype=file&cmlimit=10&format=json"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            d = json.loads(r.read().decode('utf-8'))
            return [m['title'] for m in d.get('query', {}).get('categorymembers', [])]
    except Exception as e:
        return [f"Error: {e}"]

results = {}
for cat in categories:
    files = list_category(cat)
    results[cat] = files
    print(f"=== Category:{cat} ({len(files)} files) ===", flush=True)
    for f in files[:4]:
        print(f"  {f}", flush=True)
    time.sleep(0.5)

with open('scripts/category_files.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)
