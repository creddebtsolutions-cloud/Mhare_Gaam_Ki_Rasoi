# 🌾 Mhare Gaam Ki Rasoi - Google Play Store Submission Guide & Assets

This guide contains everything required to publish **Mhare Gaam Ki Rasoi** to the **Google Play Console**.

---

## 📦 1. Upload Package Files

| File | Purpose | Location |
| :--- | :--- | :--- |
| **Android App Bundle (.aab)** | **Upload to Play Store Production Track** | `play_store_assets/MhareGaamKiRasoi-release.aab` |
| **Release Signed APK (.apk)** | Direct install on physical phone for final testing | `play_store_assets/MhareGaamKiRasoi-release.apk` |

> ⚠️ **IMPORTANT**: Google Play Console only accepts `.aab` (Android App Bundle). Upload `MhareGaamKiRasoi-release.aab`.
> 📱 **BUILD SPECIFICATIONS**:
> - **Target SDK**: **API 36** (Android 16 / Latest Developer API standard)
> - **Min SDK**: **API 24** (Android 7.0+)
> - **Version Code**: **5**
> - **Version Name**: **1.0.4**
> - **Package ID**: `com.mharegaam.rasoi`

---

## 🔑 2. Production Keystore Credentials (CRITICAL - DO NOT LOSE)

Your app has been signed with a production release keystore valid for **10,000 days (~27 years)**:

* **Keystore File**: `release.keystore`
* **Keystore Alias**: `mharegaam`
* **Keystore Password**: `MhareGaam@2026!`
* **Key Password**: `MhareGaam@2026!`
* **Certificate SHA-256**: `52:C0:F1:B7:7F:33:96:53:A1:05:EF:EC:A1:B7:AE:23:CB:E7:A1:4F:58:C7:40:1F:A6:67:05:E1:C3:4A:6B:CE`
* **Certificate SHA-1**: `3F:12:9B:7D:13:5B:3C:5C:5A:1D:EC:05:1E:97:BE:05:D7:78:62:B5`

> 💾 **BACKUP WARNING**: Keep a copy of `release.keystore` in a safe, secure cloud backup or USB drive. If lost, Google Play will not allow you to update the app in the future.

---

## 🎨 3. Store Listing Graphics (Included in `play_store_assets/`)

| Asset | Specifications | File Path |
| :--- | :--- | :--- |
| **App Icon** | 512 × 512 px PNG (32-bit with alpha) | `play_store_assets/icon_512x512.png` |
| **Feature Graphic Banner** | 1024 × 500 px PNG | `play_store_assets/feature_graphic_1024x500.png` |
| **Screenshot 1** | 1080 × 1920 px (Village Ambience & Chulha) | `play_store_assets/screenshots/screenshot_1_village_dining.png` |
| **Screenshot 2** | 1080 × 1920 px (Authentic Shahi Desi Thali) | `play_store_assets/screenshots/screenshot_2_authentic_thali.png` |
| **Screenshot 3** | 1080 × 1920 px (Smokey Wood-Fired Pizzas) | `play_store_assets/screenshots/screenshot_3_smokey_pizzas.png` |
| **Screenshot 4** | 1080 × 1920 px (Kulhad Cold Coffee & Shakes) | `play_store_assets/screenshots/screenshot_4_cold_coffee.png` |
| **Screenshot 5** | 1080 × 1920 px (Slow-Cooked Handi Dal Makhani) | `play_store_assets/screenshots/screenshot_5_handi_dal.png` |
| **Screenshot 6** | 1080 × 1920 px (Khatiya Baithak Table Booking) | `play_store_assets/screenshots/screenshot_6_table_booking.png` |
| **Screenshot 7** | 1080 × 1920 px (Instant PhonePe & UPI Scanner) | `play_store_assets/screenshots/screenshot_7_phonepe_scanner.png` |

---

## 📝 4. Store Listing Text Metadata (Copy & Paste)

### App Name (30 characters max):
```text
Mhare Gaam Ki Rasoi
```

### Short Description (80 characters max):
```text
Authentic 100% Pure Veg Traditional Village Food Delivery & Dine-In in Meerut.
```

### Full Description (4000 characters max):
```text
🌾 Welcome to Mhare Gaam Ki Rasoi - Ghar Jaisa Swaad! 🌾

Experience the purest traditions of rural Indian cooking right at your doorstep in Meerut. At Mhare Gaam Ki Rasoi, every meal is prepared with love, traditional recipes, and 100% pure vegetarian ingredients cooked on traditional mitti ka chulha with pure Desi Ghee.

✨ OUR HIGHLIGHTS:
🍲 Authentic Village Thalis - Special royal platters served with traditional grains, bajra/makka rotis, hand-churned white butter, and gur.
🔥 Slow-Simmered Handi Dal - Cooked in earthen clay pots for that inimitable saundha aroma.
🥛 Traditional Kulhad Lassi & Rabri - Thick, chilled, and garnished with malai and dry fruits.
🌾 Desi Ghee Churma & Bati - Authentic festive preparation cooked to perfection.
⚡ Direct PhonePe / UPI Scanner Payment - Hassle-free contactless payment directly via PhonePe, Google Pay, or Paytm.
🛵 Real-Time Order Tracking - Track your order from the Chulha chef's hearth right to your dining table.
🪑 Khatiya Baithak Table Booking - Reserve traditional charpai/khatiya seating for family gatherings.

📍 LOCATION:
Sai Plaza, Meerut, Uttar Pradesh, India
100% Pure Vegetarian | Traditional Hospitality
```

---

## 🛡️ 5. Privacy Policy URL
Google Play strictly requires a public Privacy Policy URL:
* **File created**: `web/privacy-policy.html`
* **Local Test URL**: `http://localhost:3000/privacy-policy`
* **Public URL**: When you deploy your server to a cloud domain (e.g. `https://mharegaamkirasoi.com/privacy-policy` or on GitHub Pages / Render), paste that public URL into the **App Content > Privacy Policy** field on Google Play Console.

---

## 📋 6. Play Console Form Answers

### A. App Category:
* **Category**: Food & Drink
* **Tags**: Food Delivery, Restaurant, Vegetarian, Dine-in

### B. Target Audience & Content Rating:
* **Target Age**: 18 and above, or All ages (Food delivery)
* **Violence, Sexual Content, Gambling**: None (Select **No** for all)
* **Expected Rating**: Everyone (PEGI 3 / ESRB Everyone)

### C. Data Safety Questionnaire:
* **Does your app collect or share user data?**: Yes
* **Is data encrypted in transit?**: Yes (HTTPS)
* **Can users request data deletion?**: Yes (Provide contact email: `support@mharegaamkirasoi.com`)
* **Data Types Collected**:
  1. **Personal Info**:
     - *Name* (App functionality / account management)
     - *Phone number* (Order status updates & delivery contact)
     - *Physical address* (Order delivery)
  2. **Financial Info**:
     - *Purchase history / transaction reference* (For UPI verification)
     - *(Select No for Credit cards / CVV)*
* **Is data shared with third parties?**: No (Only shared with restaurant delivery riders for order fulfillment).

---

## 🚀 7. Step-by-Step Upload Instructions

1. Log in to [Google Play Console](https://play.google.com/console).
2. Click **Create App**:
   - App Name: `Mhare Gaam Ki Rasoi`
   - Default Language: English (India)
   - App or Game: App
   - Free or Paid: Free
3. In the left navigation, go to **Store Presence > Main Store Listing**:
   - Paste the **Short Description** and **Full Description** from section 4.
   - Upload `icon_512x512.png` to **App Icon**.
   - Upload `feature_graphic_1024x500.png` to **Feature Graphic**.
   - Upload screenshots from `play_store_assets/screenshots/` to **Phone Screenshots**.
4. Go to **Policy > App Content**:
   - Add your **Privacy Policy URL**.
   - Complete the **Content Rating** and **Data Safety** questionnaires using section 6.
5. Go to **Production > Releases > Create new release**:
   - Click **Upload** and select `play_store_assets/MhareGaamKiRasoi-release.aab`.
   - Release name will auto-populate as `1.0.4 (5)`.
   - Release notes: `Release 1.0.4 (Version Code 5) - Full offline Rasoi Admin & Management Portal integration, enhanced responsive UI, updated table selection, and faster ordering.`
6. Click **Next**, review any warnings, and click **Start Rollout to Production**!
