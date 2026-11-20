"""
Mhare Gaam Ki Rasoi - Server Launcher
Starts the Flask server on http://localhost:5000
"""

import sys
import os

# Add root directory to python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("=" * 65)
    print("*** MHARE GAAM KI RASOI - GHAR JAISA SWAAD ***")
    print("Sai Plaza, Meerut, Uttar Pradesh, India | 100% Pure Vegetarian")
    print(f">> Server running at:        http://localhost:{port}")
    print(f">> Customer Mobile App:      http://localhost:{port}/customer")
    print(f">> Kitchen Display (KDS):    http://localhost:{port}/chef")
    print(f">> POS Billing Counter:      http://localhost:{port}/pos")
    print(f">> Admin Dashboard:          http://localhost:{port}/admin")
    print("=" * 65)
    app.run(host='0.0.0.0', port=port, debug=True)
