# Mhare Gaam Ki Rasoi — Backend & Admin Portal Server

Official Node.js backend server and management portal for **Mhare Gaam Ki Rasoi**.

---

## 🚀 Quick Start (Local)

1. Make sure **Node.js (v16+)** is installed.
2. In this folder, run:
   ```bash
   node server.js
   ```
   or
   ```bash
   npm start
   ```
3. Open your browser:
   - **Customer Web App**: `http://localhost:3000`
   - **Admin & Management Portal**: `http://localhost:3000/admin.html`
   - **Menu API Endpoint**: `http://localhost:3000/api/menu`

---

## ☁️ Deployment Guide (Render / Railway / Cloud)

### Deploy to Render (Recommended & Free):
1. Create a free account at [Render.com](https://render.com/).
2. Click **New +** > **Web Service**.
3. Upload this project folder (or push to GitHub and connect repository).
4. Configure:
   - **Runtime**: `Node`
   - **Build Command**: *(leave blank)*
   - **Start Command**: `node server.js`
5. Click **Create Web Service**.
6. Render will assign a public HTTPS domain (e.g., `https://mhare-gaam-rasoi.onrender.com`).

---

## 🔑 Default Credentials

| Role | Username / ID | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Master Admin** | `admin` | `gaam123` *(or `admin@1234`)* | Full restaurant control, settings, GST/FSSAI, user management |
| **Kitchen Manager** | `kitchen` | `kitchen123` *(or `Kitchen@1234`)* | Kitchen Display System (KDS), Chulha preparation queue |
| **Floor Staff** | `staff1` | `staff123` *(or `Staff@1234`)* | In-House POS, Table Order Punching, Billing |
| **Delivery Rider** | `delivery` | `delivery123` *(or `Rider@1234`)* | Delivery partner dispatch & status updates |

---

## 📂 File Architecture
- `server.js` — HTTP REST API & Static Asset Server
- `package.json` — Application metadata & start scripts
- `Procfile` — Cloud platform process declaration
- `data/` — JSON Database files (menu, orders, bills, bookings, staff users)
- `images/` — Traditional cuisine dish imagery & branding
- `admin.html / admin.js / admin.css` — Responsive Admin & Management Portal
- `index.html / app.js / style.css` — Customer-facing village dining experience
