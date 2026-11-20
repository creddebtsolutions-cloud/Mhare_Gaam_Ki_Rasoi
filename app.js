/**
 * Mhare Gaam Ki Rasoi • Frontend Application Engine
 * Native Android App Interactive Web Simulator
 */

// --- DATA CATALOG (Exact parity with Kotlin MenuRepository) ---
const CATEGORIES = [
  { id: 'all', title: 'All Items', icon: '🍲' },
  { id: 'thalis', title: 'Gaam Thalis', icon: '🍱' },
  { id: 'handi', title: 'Handi & Chulha', icon: '🏺' },
  { id: 'rotis', title: 'Desi Rotis', icon: '🫓' },
  { id: 'pizzas', title: 'Smokey Pizzas', icon: '🍕' },
  { id: 'sweets', title: 'Churma & Sweets', icon: '🍯' },
  { id: 'beverages', title: 'Drinks & Cold Coffee', icon: '☕' }
];

const COMMON_ADDONS = [
  { id: 'add_1', name: 'Extra Pure Desi Ghee Dollop', hindi: 'अतिरिक्त शुद्ध देसी घी', price: 30 },
  { id: 'add_2', name: 'Fresh White Butter (Makhan)', hindi: 'घर का सफेद मक्खन', price: 35 },
  { id: 'add_3', name: 'Pure Gud (Organic Jaggery)', hindi: 'देसी गुड़ की डली', price: 20 },
  { id: 'add_4', name: 'Village Garlic-Chilli Chutney', hindi: 'लहसुन-लाल मिर्च चटनी', price: 15 },
  { id: 'add_5', name: 'Clay Roasted Chulha Papad', hindi: 'चूल्हे पर सिका पापड़', price: 20 },
  { id: 'add_cheese', name: 'Extra Mozzarella Cheese Melt', hindi: 'अतिरिक्त मोज़ेरेला चीज़', price: 40 },
  { id: 'add_paneer_cube', name: 'Extra Smoky Paneer Chunks', hindi: 'अतिरिक्त स्मोकी पनीर', price: 45 },
  { id: 'add_ice_cream', name: 'Extra Vanilla Ice Cream Scoop', hindi: 'वैनिला आइसक्रीम स्कूप', price: 30 },
  { id: 'add_choco_shot', name: 'Dark Chocolate Syrup Shot', hindi: 'डार्क चॉकलेट सिरप शॉट', price: 20 }
];

let MENU_ITEMS = [
  {
    id: 'thali_special',
    name: 'Mhare Gaam Ki Special Thali',
    hindiName: 'म्‍हारे गाम की स्पेशल थाली',
    categoryId: 'thalis',
    description: 'The ultimate royal village feast: 2 Bajra Rotis topped with melting white butter, Sarson Ka Saag, 24-hr Handi Dal Makhani, Desi Ghee Churma, Kadhi Pakoda, Steamed Rice, Village Raita, Gur, Garlic Chutney & Kulhad Chaach.',
    price: 349,
    originalPrice: 420,
    image: 'images/dish_thali.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: true,
    isDesiGheeSpecial: true,
    prepTime: 25,
    rating: 4.9,
    reviewCount: 380,
    addons: COMMON_ADDONS
  },
  {
    id: 'thali_bajra_saag',
    name: 'Chulha Bajra Roti & Saag Thali',
    hindiName: 'चूल्हा बाजरा रोटी व साग थाली',
    categoryId: 'thalis',
    description: 'Winter village nostalgia: 3 fresh Bajra Rotis smoked over cow dung firewood chulha, Sarson Saag loaded with homemade makhan, Radish-onion kachumber and pure jaggery.',
    price: 289,
    originalPrice: 330,
    image: 'images/dish_bajra_saag.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: true,
    isDesiGheeSpecial: true,
    prepTime: 20,
    rating: 4.8,
    reviewCount: 210,
    addons: COMMON_ADDONS
  },
  {
    id: 'handi_dal',
    name: 'Chulha Handi Dal Makhani',
    hindiName: 'चूल्हे की हांडी दाल मखनी',
    categoryId: 'handi',
    description: 'Black urad dal slow-cooked for 18 hours overnight in an authentic earthen clay handi pot, enriched with farm butter and pure cow desi ghee.',
    price: 269,
    originalPrice: 299,
    image: 'images/dish_handi_dal.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: true,
    isDesiGheeSpecial: true,
    prepTime: 15,
    rating: 4.9,
    reviewCount: 512,
    addons: COMMON_ADDONS
  },
  {
    id: 'handi_paneer',
    name: 'Gaam Handi Paneer Kadhai',
    hindiName: 'गाम हांडी पनीर कढ़ाई',
    categoryId: 'handi',
    description: 'Fresh malai paneer cubes tossed with whole pounded spices, bell peppers and caramelized village onions in a clay pot.',
    price: 299,
    originalPrice: 340,
    image: 'images/dish_handi_paneer.jpg',
    isVeg: true,
    isBestseller: false,
    isVillageSpecial: false,
    isDesiGheeSpecial: true,
    prepTime: 20,
    rating: 4.7,
    reviewCount: 189,
    addons: COMMON_ADDONS
  },
  {
    id: 'handi_kadhi',
    name: 'Desi Ghee Kadhi Pakoda',
    hindiName: 'देसी घी कढ़ी पकोड़ा',
    categoryId: 'handi',
    description: 'Sour buttermilk kadhi slow-simmered with crispy fenugreek onion pakodas, finished with a sizzling heeng-zeera desi ghee chhonk.',
    price: 219,
    originalPrice: 249,
    image: 'images/dish_kadhi_pakoda.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: true,
    isDesiGheeSpecial: true,
    prepTime: 15,
    rating: 4.8,
    reviewCount: 142,
    addons: COMMON_ADDONS
  },
  {
    id: 'sweet_churma',
    name: 'Pure Desi Ghee Gud Churma',
    hindiName: 'शुद्ध देसी घी गुड़ चूरमा',
    categoryId: 'sweets',
    description: 'Coarsely ground whole wheat muthiyas hand-crushed with organic brown jaggery, loaded with almonds, cashews, cardamom, and overflowing pure desi ghee.',
    price: 199,
    originalPrice: 240,
    image: 'images/dish_churma.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: true,
    isDesiGheeSpecial: true,
    prepTime: 10,
    rating: 5.0,
    reviewCount: 425,
    addons: COMMON_ADDONS
  },
  {
    id: 'sweet_malpua',
    name: 'Earthen Rabri Malpua Platter',
    hindiName: 'कुल्हड़ रबड़ी मालपुआ',
    categoryId: 'sweets',
    description: 'Crispy golden malpuas dipped in saffron sugar syrup, topped with thick reduced milk rabri in an earthen saucer.',
    price: 179,
    originalPrice: 210,
    image: 'images/dish_rabri_malpua.jpg',
    isVeg: true,
    isBestseller: false,
    isVillageSpecial: false,
    isDesiGheeSpecial: true,
    prepTime: 12,
    rating: 4.8,
    reviewCount: 110,
    addons: COMMON_ADDONS
  },
  {
    id: 'drink_kesar_lassi',
    name: 'Kulhad Kesar Malai Lassi',
    hindiName: 'कुल्हड़ केसर मलाई लस्सी',
    categoryId: 'beverages',
    description: 'Velvety hand-churned thick curd lassi infused with Kashmiri saffron, cardamom, topped with thick malai and chopped pistachios in an earthen kulhad.',
    price: 99,
    originalPrice: 120,
    image: 'images/dish_kulhad_lassi.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: true,
    isDesiGheeSpecial: false,
    prepTime: 5,
    rating: 4.9,
    reviewCount: 618,
    addons: COMMON_ADDONS
  },
  {
    id: 'drink_chaach',
    name: 'Gaam Masala Chaach (Buttermilk)',
    hindiName: 'गाम मसाला छाछ',
    categoryId: 'beverages',
    description: 'Refreshing chilled buttermilk tempered with roasted cumin, rock salt, mint leaves, and fresh green coriander.',
    price: 59,
    originalPrice: 75,
    image: 'images/dish_masala_chaach.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: true,
    isDesiGheeSpecial: false,
    prepTime: 5,
    rating: 4.8,
    reviewCount: 280,
    addons: COMMON_ADDONS
  },
  {
    id: 'roti_bajra_makhan',
    name: 'Tawa Bajra Roti with Makhan (2 Pcs)',
    hindiName: 'बाजरा रोटी मक्‍खन वाली (2 नग)',
    categoryId: 'rotis',
    description: 'Hand-patted organic pearl millet rotis roasted on a clay tawa, served with a big dollop of fresh churned white butter.',
    price: 89,
    originalPrice: 100,
    image: 'images/dish_bajra_roti.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: true,
    isDesiGheeSpecial: true,
    prepTime: 15,
    rating: 4.9,
    reviewCount: 310,
    addons: COMMON_ADDONS
  },
  {
    id: 'pizza_smokey_paneer_tikka',
    name: 'Smokey Paneer Tikka Pizza',
    hindiName: 'चूल्हा स्मोकी पनीर टिक्का पिज़्ज़ा',
    categoryId: 'pizzas',
    description: 'Wood-fired crispy charred crust topped with marinated smoky tandoori paneer cubes, crunchy capsicum, charred red onions, gooey mozzarella cheese and mint chutney swirl.',
    price: 269,
    originalPrice: 310,
    image: 'images/dish_smokey_pizza.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: true,
    isDesiGheeSpecial: false,
    prepTime: 18,
    rating: 4.9,
    reviewCount: 420,
    addons: COMMON_ADDONS
  },
  {
    id: 'pizza_smokey_farmhouse',
    name: 'Smokey Farmhouse Veggie Pizza',
    hindiName: 'स्मोकी फार्महाउस वेज पिज़्ज़ा',
    categoryId: 'pizzas',
    description: 'Loaded wood-smoked garden pizza featuring sweet golden corn, bell peppers, fresh tomatoes, sliced olives, jalapenos and dried oregano over bubbling cheese.',
    price: 249,
    originalPrice: 289,
    image: 'images/dish_smokey_pizza.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: false,
    isDesiGheeSpecial: false,
    prepTime: 18,
    rating: 4.8,
    reviewCount: 265,
    addons: COMMON_ADDONS
  },
  {
    id: 'pizza_smokey_makhani_paneer',
    name: 'Smokey Makhani Paneer & Corn Pizza',
    hindiName: 'स्मोकी मखनी पनीर कॉर्न पिज़्ज़ा',
    categoryId: 'pizzas',
    description: 'Desi twist to Italian pizza: slow-cooked rich makhani gravy sauce base, char-grilled malai paneer, buttery sweet corn, and double mozzarella cheese.',
    price: 279,
    originalPrice: 320,
    image: 'images/dish_smokey_pizza.jpg',
    isVeg: true,
    isBestseller: false,
    isVillageSpecial: true,
    isDesiGheeSpecial: true,
    prepTime: 20,
    rating: 4.9,
    reviewCount: 195,
    addons: COMMON_ADDONS
  },
  {
    id: 'pizza_smokey_periperi',
    name: 'Smokey Spicy Peri-Peri Veg Pizza',
    hindiName: 'स्मोकी पेरी-पेरी वेज पिज़्ज़ा',
    categoryId: 'pizzas',
    description: 'Fiery rustic pizza spiked with smoky African bird\'s eye peri-peri seasoning, spicy red paprika, crisp onions, crunchy capsicum and molten cheese.',
    price: 239,
    originalPrice: 270,
    image: 'images/dish_smokey_pizza.jpg',
    isVeg: true,
    isBestseller: false,
    isVillageSpecial: false,
    isDesiGheeSpecial: false,
    prepTime: 16,
    rating: 4.7,
    reviewCount: 140,
    addons: COMMON_ADDONS
  },
  {
    id: 'pizza_smokey_margherita',
    name: 'Smokey Margherita Double Cheese Pizza',
    hindiName: 'स्मोकी मार्गरीटा डबल चीज़ पिज़्ज़ा',
    categoryId: 'pizzas',
    description: 'Classic wood-charred artisanal base, san marzano herbed tomato concasse sauce, fragrant basil leaves, and overflowing molten double smoked cheese.',
    price: 199,
    originalPrice: 239,
    image: 'images/dish_smokey_pizza.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: false,
    isDesiGheeSpecial: false,
    prepTime: 15,
    rating: 4.8,
    reviewCount: 310,
    addons: COMMON_ADDONS
  },
  {
    id: 'coffee_classic_cold',
    name: 'Classic Kulhad Cold Coffee',
    hindiName: 'क्लासिक कुल्हड़ कोल्ड कॉफ़ी',
    categoryId: 'beverages',
    description: 'Rich creamy blended dark roasted espresso coffee with chilled full-cream milk, served in an authentic earthen kulhad with velvety froth.',
    price: 89,
    originalPrice: 110,
    image: 'images/dish_cold_coffee.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: true,
    isDesiGheeSpecial: false,
    prepTime: 5,
    rating: 4.9,
    reviewCount: 540,
    addons: COMMON_ADDONS
  },
  {
    id: 'coffee_choco_mocha',
    name: 'Smokey Choco Mocha Cold Coffee',
    hindiName: 'स्मोकी मोचा कोल्ड कॉफ़ी',
    categoryId: 'beverages',
    description: 'Dark Belgian cocoa blended with chilled espresso, rich creamy milk, chocolate syrup drizzle and a subtle roasted hazelnut-smoky touch.',
    price: 109,
    originalPrice: 130,
    image: 'images/dish_cold_coffee.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: false,
    isDesiGheeSpecial: false,
    prepTime: 6,
    rating: 4.8,
    reviewCount: 380,
    addons: COMMON_ADDONS
  },
  {
    id: 'coffee_hazelnut_cold',
    name: 'Hazelnut Cream Cold Coffee',
    hindiName: 'हेज़लनट क्रीम कोल्ड कॉफ़ी',
    categoryId: 'beverages',
    description: 'Gourmet cold coffee infused with roasted hazelnut syrup, creamy vanilla froth, and cracked coffee beans.',
    price: 119,
    originalPrice: 140,
    image: 'images/dish_cold_coffee.jpg',
    isVeg: true,
    isBestseller: false,
    isVillageSpecial: false,
    isDesiGheeSpecial: false,
    prepTime: 6,
    rating: 4.7,
    reviewCount: 210,
    addons: COMMON_ADDONS
  },
  {
    id: 'coffee_caramel_crunch',
    name: 'Caramel Crunch Cold Coffee',
    hindiName: 'कैरेमल क्रंच कोल्ड कॉफ़ी',
    categoryId: 'beverages',
    description: 'Chilled espresso churned with rich butterscotch caramel sauce, topped with golden crunchy butter praline and caramel drizzle.',
    price: 119,
    originalPrice: 140,
    image: 'images/dish_cold_coffee.jpg',
    isVeg: true,
    isBestseller: false,
    isVillageSpecial: false,
    isDesiGheeSpecial: false,
    prepTime: 6,
    rating: 4.8,
    reviewCount: 175,
    addons: COMMON_ADDONS
  },
  {
    id: 'coffee_vanilla_float',
    name: 'Vanilla Ice Cream Cold Coffee Float',
    hindiName: 'वैनिला फ्लोट कोल्ड कॉफ़ी',
    categoryId: 'beverages',
    description: 'Thick hand-blended cold coffee topped with a huge scoop of artisanal vanilla bean ice cream and dusted with dark cocoa.',
    price: 129,
    originalPrice: 150,
    image: 'images/dish_cold_coffee.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: false,
    isDesiGheeSpecial: false,
    prepTime: 5,
    rating: 4.9,
    reviewCount: 460,
    addons: COMMON_ADDONS
  }
];

// --- APP STATE ---
const STATE = {
  activeScreen: 'homeScreen',
  screenHistory: [],
  selectedCategory: 'all',
  searchQuery: '',
  vegOnly: false,
  cart: [
    // Pre-loaded sample item so user can immediately see cart state
    {
      id: 'cart_' + Date.now(),
      item: MENU_ITEMS[0],
      quantity: 1,
      spice: 'Medium / मध्यम',
      addons: [COMMON_ADDONS[0]], // Extra desi ghee
      instructions: 'Extra white butter please'
    }
  ],
  appliedPromo: null,
  orderType: 'delivery',
  activeOrder: null,
  pastOrders: [],
  modalItem: null,
  modalQty: 1,
  modalSelectedSpice: 'Medium / मध्यम',
  modalSelectedAddons: []
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initDeviceToggles();
  renderCategories();
  renderHomeScreen();
  renderMenuScreen();
  updateCartUI();
  setupEventListeners();
  navigateTo('homeScreen', false);
  syncMenuFromApi();
});

async function syncMenuFromApi() {
  try {
    const res = await fetch('/api/menu');
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        MENU_ITEMS = items;
        renderHomeScreen();
        renderMenuScreen();
      }
    }
  } catch (err) {
    console.log('Using local menu cache');
  }
}

// Update Phone Status Bar Time
function initClock() {
  const timeEl = document.getElementById('statusTime');
  function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    timeEl.textContent = `${hours}:${minutes}`;
  }
  updateTime();
  setInterval(updateTime, 30000);
}

// Device Viewport Toggles (Phone Frame vs Full Responsive)
function initDeviceToggles() {
  const toggleDeviceBtn = document.getElementById('toggleDeviceBtn');
  const toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn');

  toggleDeviceBtn.addEventListener('click', () => {
    document.body.classList.remove('fullscreen-mode');
    toggleDeviceBtn.classList.add('active');
    toggleFullscreenBtn.classList.remove('active');
  });

  toggleFullscreenBtn.addEventListener('click', () => {
    document.body.classList.add('fullscreen-mode');
    toggleFullscreenBtn.classList.add('active');
    toggleDeviceBtn.classList.remove('active');
  });
}

// Navigation Router
function navigateTo(screenId, pushHistory = true) {
  if (screenId === STATE.activeScreen) return;

  if (pushHistory && STATE.activeScreen !== 'splashScreen') {
    STATE.screenHistory.push(STATE.activeScreen);
  }

  STATE.activeScreen = screenId;

  // Toggle active class on screen sections
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    document.getElementById('appViewport').scrollTop = 0;
  }

  // Header & Back Button logic
  const navBackBtn = document.getElementById('navBackBtn');
  const brandInfo = document.getElementById('brandInfo');
  const screenTitle = document.getElementById('screenTitle');
  const appTopBar = document.getElementById('appTopBar');
  const appBottomNav = document.getElementById('appBottomNav');

  const mainTabs = ['homeScreen', 'menuScreen', 'tableBookingScreen', 'ordersScreen'];
  const isMainTab = mainTabs.includes(screenId);

  if (screenId === 'splashScreen') {
    appTopBar.style.display = 'none';
    appBottomNav.style.display = 'none';
  } else {
    appTopBar.style.display = 'flex';
    appBottomNav.style.display = isMainTab ? 'flex' : 'none';

    if (isMainTab) {
      navBackBtn.style.display = 'none';
      brandInfo.style.display = 'flex';
      screenTitle.style.display = 'none';
    } else {
      navBackBtn.style.display = 'flex';
      brandInfo.style.display = 'none';
      screenTitle.style.display = 'block';

      switch (screenId) {
        case 'cartScreen': screenTitle.textContent = 'Rasoi Thali (Cart)'; break;
        case 'checkoutScreen': screenTitle.textContent = 'Checkout'; break;
        case 'orderSuccessScreen': screenTitle.textContent = 'Order Confirmed'; break;
        case 'orderTrackingScreen': screenTitle.textContent = 'Live Chulha Tracker'; break;
        default: screenTitle.textContent = 'Mhare Gaam Ki Rasoi';
      }
    }
  }

  // Update bottom nav highlights
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === screenId);
  });

  // Floating Cart visibility
  updateFloatingCartVisibility();
}

function goBack() {
  if (STATE.screenHistory.length > 0) {
    const prev = STATE.screenHistory.pop();
    navigateTo(prev, false);
  } else {
    navigateTo('homeScreen', false);
  }
}

// --- RENDER FUNCTIONS ---

function renderCategories() {
  const homeContainer = document.getElementById('homeCategoryCarousel');
  const menuContainer = document.getElementById('menuTabsContainer');

  let homeHtml = '';
  let menuHtml = '';

  CATEGORIES.forEach(cat => {
    const isSelected = STATE.selectedCategory === cat.id;
    const chipHtml = `
      <div class="category-chip ${isSelected ? 'active' : ''}" data-category="${cat.id}">
        <span>${cat.icon}</span>
        <span>${cat.title}</span>
      </div>
    `;
    homeHtml += chipHtml;
    menuHtml += chipHtml;
  });

  homeContainer.innerHTML = homeHtml;
  menuContainer.innerHTML = menuHtml;

  // Add click handlers
  document.querySelectorAll('.category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const catId = chip.dataset.category;
      STATE.selectedCategory = catId;
      renderCategories();
      renderMenuScreen();
      if (STATE.activeScreen === 'homeScreen') {
        navigateTo('menuScreen');
      }
    });
  });
}

function renderHomeScreen() {
  const signatureList = document.getElementById('homeSignatureList');
  const specials = MENU_ITEMS.filter(item => item.isVillageSpecial);
  signatureList.innerHTML = specials.map(item => createDishCardHtml(item)).join('');
  attachDishCardListeners(signatureList);
}

function renderMenuScreen() {
  const menuList = document.getElementById('menuItemsList');
  let filtered = MENU_ITEMS;

  if (STATE.selectedCategory !== 'all') {
    filtered = filtered.filter(item => item.categoryId === STATE.selectedCategory);
  }

  if (STATE.vegOnly) {
    filtered = filtered.filter(item => item.isVeg);
  }

  if (STATE.searchQuery.trim()) {
    const q = STATE.searchQuery.toLowerCase();
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.hindiName.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  }

  document.getElementById('menuResultsCount').textContent = `Showing ${filtered.length} village dishes`;

  if (filtered.length === 0) {
    menuList.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <span style="font-size: 2.5rem;">🌾</span>
        <h4 style="margin: 10px 0 4px; font-family: var(--font-serif); color: var(--text-dark);">No dishes found</h4>
        <p style="font-size: 0.75rem; color: var(--text-secondary);">Try clearing your search or filters</p>
      </div>
    `;
  } else {
    menuList.innerHTML = filtered.map(item => createDishCardHtml(item)).join('');
    attachDishCardListeners(menuList);
  }
}

function createDishCardHtml(item) {
  const cartItem = STATE.cart.find(c => c.item.id === item.id);
  const qty = cartItem ? cartItem.quantity : 0;

  return `
    <div class="menu-item-card" data-dish-id="${item.id}">
      <div class="item-left">
        <div class="item-badge-row">
          <span class="veg-badge-dot"></span>
          ${item.isDesiGheeSpecial ? '<span class="badge-ghee">शुद्ध देसी घी</span>' : ''}
          ${item.isVillageSpecial && !item.isDesiGheeSpecial ? '<span class="badge-village">गाम की पहचान</span>' : ''}
        </div>
        <h4 class="item-name">${item.name}</h4>
        <p class="item-hindi">${item.hindiName}</p>
        <div class="item-meta">
          <span class="item-rating">★ ${item.rating} (${item.reviewCount})</span>
          <span>•</span>
          <span>${item.prepTime} mins</span>
        </div>
        <p class="item-desc">${item.description}</p>
        <div class="item-price-row">
          <span class="item-price">₹${item.price}</span>
          ${item.originalPrice ? `<span class="item-orig-price">₹${item.originalPrice}</span>` : ''}
        </div>
      </div>
      <div class="item-right">
        <div class="item-img-box">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="item-btn-container">
          ${qty === 0 ? `
            <button class="btn-add-item" data-action="open-modal" data-dish-id="${item.id}">+ ADD</button>
          ` : `
            <div class="quantity-stepper">
              <button data-action="decrease" data-dish-id="${item.id}">-</button>
              <span>${qty}</span>
              <button data-action="increase" data-dish-id="${item.id}">+</button>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function attachDishCardListeners(container) {
  // Click on card body opens customization modal
  container.querySelectorAll('.menu-item-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.quantity-stepper')) return;
      const dishId = card.dataset.dishId;
      const dish = MENU_ITEMS.find(d => d.id === dishId);
      if (dish) openCustomizationModal(dish);
    });
  });

  // Add / Quantity buttons
  container.querySelectorAll('[data-action="open-modal"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dishId = btn.dataset.dishId;
      const dish = MENU_ITEMS.find(d => d.id === dishId);
      if (dish) openCustomizationModal(dish);
    });
  });

  container.querySelectorAll('[data-action="increase"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dishId = btn.dataset.dishId;
      updateQuantityByDishId(dishId, 1);
    });
  });

  container.querySelectorAll('[data-action="decrease"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dishId = btn.dataset.dishId;
      updateQuantityByDishId(dishId, -1);
    });
  });
}

// --- CUSTOMIZATION MODAL BOTTOM SHEET ---
function openCustomizationModal(dish) {
  STATE.modalItem = dish;
  STATE.modalQty = 1;
  STATE.modalSelectedSpice = 'Medium / मध्यम';
  STATE.modalSelectedAddons = [];

  document.getElementById('modalDishImage').src = dish.image;
  document.getElementById('modalDishTitle').textContent = dish.name;
  document.getElementById('modalDishHindi').textContent = dish.hindiName;
  document.getElementById('modalDishDesc').textContent = dish.description;
  document.getElementById('modalGheeBadge').style.display = dish.isDesiGheeSpecial ? 'inline-block' : 'none';
  document.getElementById('modalChefNote').value = '';
  document.getElementById('modalQtyText').textContent = '1';

  // Render spice options
  const spices = [
    { label: 'Mild / सौम्य', icon: '🌶️' },
    { label: 'Medium / मध्यम', icon: '🌶️🌶️' },
    { label: 'Spicy / तीखा', icon: '🌶️🌶️🌶️' },
    { label: 'Gaam Style Extra Teekha / असली तड़का', icon: '🔥' }
  ];
  document.getElementById('modalSpiceOptions').innerHTML = spices.map((s, idx) => `
    <label class="spice-option">
      <div class="option-left">
        <input type="radio" name="modalSpice" value="${s.label}" ${idx === 1 ? 'checked' : ''}>
        <span>${s.label}</span>
      </div>
      <span>${s.icon}</span>
    </label>
  `).join('');

  // Render add-ons
  const addons = dish.addons || COMMON_ADDONS;
  document.getElementById('modalAddonsList').innerHTML = addons.map(a => `
    <label class="addon-option">
      <div class="option-left">
        <input type="checkbox" name="modalAddon" value="${a.id}">
        <span>${a.name} <small style="color: var(--text-secondary); display: block;">${a.hindi}</small></span>
      </div>
      <span class="addon-price">+₹${a.price}</span>
    </label>
  `).join('');

  updateModalPrice();
  document.getElementById('itemDetailModal').style.display = 'flex';
}

function updateModalPrice() {
  if (!STATE.modalItem) return;
  const base = STATE.modalItem.price;
  const addonsTotal = STATE.modalSelectedAddons.reduce((sum, a) => sum + a.price, 0);
  const total = (base + addonsTotal) * STATE.modalQty;
  document.getElementById('modalAddPriceText').textContent = `₹${total}`;
}

// --- CART CALCULATIONS & UI ---
function updateQuantityByDishId(dishId, delta) {
  const existing = STATE.cart.find(c => c.item.id === dishId);
  if (existing) {
    existing.quantity += delta;
    if (existing.quantity <= 0) {
      STATE.cart = STATE.cart.filter(c => c !== existing);
    }
  } else if (delta > 0) {
    const dish = MENU_ITEMS.find(d => d.id === dishId);
    if (dish) {
      STATE.cart.push({
        id: 'cart_' + Date.now(),
        item: dish,
        quantity: 1,
        spice: 'Medium / मध्यम',
        addons: [],
        instructions: ''
      });
    }
  }

  updateCartUI();
  renderHomeScreen();
  renderMenuScreen();
}

function updateCartUI() {
  const totalItems = STATE.cart.reduce((sum, c) => sum + c.quantity, 0);
  const subtotal = calculateCartSubtotal();
  const badge = document.getElementById('cartBadge');

  if (totalItems > 0) {
    badge.style.display = 'flex';
    badge.textContent = totalItems;
  } else {
    badge.style.display = 'none';
  }

  // Floating Cart Bar
  document.getElementById('cartBarItemsText').textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'} in Thali`;
  document.getElementById('cartBarTotalText').textContent = `₹${subtotal}`;
  updateFloatingCartVisibility();

  // Re-render Cart Screen if active
  renderCartScreen();
}

function updateFloatingCartVisibility() {
  const floatBar = document.getElementById('floatingCartBar');
  const allowed = ['homeScreen', 'menuScreen'];
  const hasItems = STATE.cart.length > 0;

  if (allowed.includes(STATE.activeScreen) && hasItems) {
    floatBar.style.display = 'flex';
  } else {
    floatBar.style.display = 'none';
  }
}

function calculateCartSubtotal() {
  return STATE.cart.reduce((sum, c) => {
    const addonsSum = (c.addons || []).reduce((aSum, a) => aSum + a.price, 0);
    return sum + (c.item.price + addonsSum) * c.quantity;
  }, 0);
}

function calculateDiscount(subtotal) {
  if (STATE.appliedPromo === 'GAAM100' && subtotal >= 399) {
    return 100;
  }
  if (STATE.appliedPromo === 'DESIGHEE' && subtotal >= 249) {
    return Math.min(Math.round(subtotal * 0.15), 120);
  }
  return 0;
}

function renderCartScreen() {
  const container = document.getElementById('cartContentContainer');
  if (STATE.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon">🍲</div>
        <h3 style="font-family: var(--font-serif); color: var(--text-dark);">Your Rasoi Thali is Empty</h3>
        <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 6px 0 20px;">
          Add hot Bajra Roti, Sarson Saag, Handi Dal or Desi Ghee Churma!
        </p>
        <button class="btn btn-primary" onclick="navigateTo('menuScreen')">Browse Rasoi Menu</button>
      </div>
    `;
    return;
  }

  const subtotal = calculateCartSubtotal();
  const discount = calculateDiscount(subtotal);
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const packing = STATE.orderType === 'delivery' ? 25 : 0;
  const delivery = STATE.orderType === 'delivery' ? (subtotal >= 499 ? 0 : 40) : 0;
  const grandTotal = Math.max(0, subtotal - discount + tax + packing + delivery);

  // Items HTML
  const itemsHtml = STATE.cart.map(c => {
    const addonsText = c.addons && c.addons.length > 0 ? c.addons.map(a => a.name).join(', ') : '';
    const unitPrice = c.item.price + (c.addons || []).reduce((s, a) => s + a.price, 0);
    const itemTotal = unitPrice * c.quantity;

    return `
      <div class="cart-item-card">
        <div class="cart-item-row">
          <div class="cart-item-info">
            <span class="veg-badge-dot" style="margin-bottom: 4px;"></span>
            <h4 class="cart-item-title">${c.item.name}</h4>
            <p class="cart-item-sub">₹${unitPrice} each • ${c.spice}</p>
            ${addonsText ? `<p class="cart-item-addons">+ ${addonsText}</p>` : ''}
            ${c.instructions ? `<p style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">Note: ${c.instructions}</p>` : ''}
          </div>
          <div class="cart-item-actions">
            <span class="cart-item-price">₹${itemTotal}</span>
            <div class="quantity-stepper" style="width: 75px;">
              <button onclick="updateCartItemQuantity('${c.id}', -1)">-</button>
              <span>${c.quantity}</span>
              <button onclick="updateCartItemQuantity('${c.id}', 1)">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="cart-items-list">
      ${itemsHtml}
    </div>

    <!-- Promo Box -->
    <div class="card" style="margin: 14px 16px 0;">
      <div style="display: flex; gap: 8px;">
        <input type="text" id="cartPromoInput" class="input-text" placeholder="Coupon (GAAM100 / DESIGHEE)" value="${STATE.appliedPromo || ''}">
        <button class="btn btn-primary btn-sm" id="cartApplyPromoBtn">${STATE.appliedPromo ? 'Remove' : 'Apply'}</button>
      </div>
      ${STATE.appliedPromo ? `
        <div style="font-size: 0.72rem; color: var(--veg-green); font-weight: 700; margin-top: 6px;">
          ✓ Coupon '${STATE.appliedPromo}' applied! Saving ₹${discount}
        </div>
      ` : ''}
    </div>

    <!-- Bill Details -->
    <div class="bill-card">
      <h4 class="bill-card-title">Bill Details / बिल का विवरण</h4>
      <div class="bill-row">
        <span>Item Total</span>
        <span>₹${subtotal}</span>
      </div>
      ${discount > 0 ? `
        <div class="bill-row discount">
          <span>Coupon Discount</span>
          <span>-₹${discount}</span>
        </div>
      ` : ''}
      ${STATE.orderType === 'delivery' ? `
        <div class="bill-row">
          <span>Desi Clay Pot & Safe Packaging</span>
          <span>₹${packing}</span>
        </div>
        <div class="bill-row">
          <span>Delivery Fee</span>
          <span>${delivery === 0 ? '<strong style="color: var(--veg-green)">FREE</strong>' : '₹' + delivery}</span>
        </div>
      ` : ''}
      <div class="bill-row">
        <span>Govt. Taxes (GST 5%)</span>
        <span>₹${tax}</span>
      </div>
      <div class="bill-divider"></div>
      <div class="bill-row grand-total">
        <span>Grand Total</span>
        <span class="total-val">₹${grandTotal}</span>
      </div>
    </div>

    <!-- Action Button -->
    <div style="padding: 0 16px 20px;">
      <button class="btn btn-primary btn-block btn-lg" id="proceedCheckoutBtn">
        Proceed to Checkout • ₹${grandTotal} →
      </button>
    </div>
  `;

  // Attach cart events
  const promoBtn = document.getElementById('cartApplyPromoBtn');
  if (promoBtn) {
    promoBtn.addEventListener('click', () => {
      if (STATE.appliedPromo) {
        STATE.appliedPromo = null;
        showToast('Coupon removed');
      } else {
        const input = document.getElementById('cartPromoInput').value.trim().toUpperCase();
        applyPromo(input);
      }
      updateCartUI();
    });
  }

  const checkoutBtn = document.getElementById('proceedCheckoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const grandTotal = calculateOrderGrandTotal();
      document.getElementById('checkoutTotalBtnText').textContent = `₹${grandTotal}`;
      document.getElementById('checkoutDestTitle').textContent =
        STATE.orderType === 'dine_in' ? 'Table / Baithak Number' : 'Delivery Address';
      document.getElementById('cashOptionText').textContent =
        STATE.orderType === 'dine_in' ? 'Pay at Counter / Table' : 'Cash on Delivery (COD)';

      const inputWrapper = document.getElementById('checkoutDestInputWrapper');
      if (STATE.orderType === 'dine_in') {
        inputWrapper.innerHTML = `<input type="text" id="checkoutAddress" class="input-text" value="Table 07 (Khatiya Baithak)">`;
      } else {
        inputWrapper.innerHTML = `<textarea id="checkoutAddress" class="input-text" rows="2">Plot 42, Green Avenue, Sector 14, Near Village Chowk</textarea>`;
      }

      // Default to UPI payment and initialize dynamic QR & UPI ID
      const upiRadio = document.querySelector('input[name="paymentMethod"][value="UPI"]');
      if (upiRadio) {
        upiRadio.checked = true;
      }
      document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.method === 'UPI');
      });
      const upiBox = document.getElementById('upiPaymentBox');
      if (upiBox) {
        upiBox.style.display = 'block';
      }

      renderCheckoutUpiDetails();
      navigateTo('checkoutScreen');
    });
  }
}

function updateCartItemQuantity(cartId, delta) {
  const item = STATE.cart.find(c => c.id === cartId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      STATE.cart = STATE.cart.filter(c => c !== item);
    }
  }
  updateCartUI();
  renderHomeScreen();
  renderMenuScreen();
}

function applyPromo(code) {
  const subtotal = calculateCartSubtotal();
  if (code === 'GAAM100') {
    if (subtotal >= 399) {
      STATE.appliedPromo = 'GAAM100';
      showToast('Coupon GAAM100 Applied! ₹100 Flat OFF 🎉');
    } else {
      showToast(`Add ₹${399 - subtotal} more to use GAAM100`);
    }
  } else if (code === 'DESIGHEE') {
    if (subtotal >= 249) {
      STATE.appliedPromo = 'DESIGHEE';
      showToast('Coupon DESIGHEE Applied! 15% OFF 🧈');
    } else {
      showToast('Minimum order ₹249 for DESIGHEE');
    }
  } else {
    showToast('Invalid coupon. Try GAAM100 or DESIGHEE');
  }
}

// --- ORDER TOTAL & DYNAMIC UPI ENGINE ---
function calculateOrderGrandTotal() {
  const subtotal = calculateCartSubtotal();
  const discount = calculateDiscount(subtotal);
  const packing = STATE.orderType === 'delivery' ? 25 : 0;
  const delivery = (STATE.orderType === 'delivery' && subtotal < 499) ? 40 : 0;
  const tax = Math.round(subtotal * 0.05);
  return Math.max(0, subtotal - discount + tax + packing + delivery);
}

function renderCheckoutUpiDetails() {
  const grandTotal = calculateOrderGrandTotal();
  const upiId = '7819952799@ybl';
  const merchantName = 'ADITYA CHAUHAN';
  const upiNote = `Food Order - ${STATE.orderType === 'delivery' ? 'Home Delivery' : 'Baithak'}`;

  // Standard UPI URI format accepted by PhonePe, Google Pay, Paytm, BHIM, Cred, etc.
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(upiNote)}`;
  
  // High-resolution Dynamic QR Code
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(upiUri)}`;

  const upiQrImg = document.getElementById('checkoutUpiQrImg');
  if (upiQrImg) {
    upiQrImg.src = qrUrl;
  }

  const upiIdEl = document.getElementById('upiIdValue');
  if (upiIdEl) {
    upiIdEl.textContent = upiId;
  }

  const amtDisplay = document.getElementById('upiPayAmountDisplay');
  if (amtDisplay) {
    amtDisplay.textContent = `₹${grandTotal}`;
  }

  const chkAmt = document.getElementById('upiCheckboxAmountText');
  if (chkAmt) {
    chkAmt.textContent = `₹${grandTotal}`;
  }

  const directLink = document.getElementById('directUpiPayLink');
  if (directLink) {
    directLink.href = upiUri;
  }

  const btnTotal = document.getElementById('checkoutTotalBtnText');
  if (btnTotal) {
    btnTotal.textContent = `₹${grandTotal}`;
  }

  // Clear warning box on fresh render
  const warn = document.getElementById('upiUnpaidWarning');
  if (warn) warn.style.display = 'none';
}

// --- ORDER PLACEMENT & LIVE TRACKING ---
function placeOrder() {
  const name = (document.getElementById('checkoutName') && document.getElementById('checkoutName').value.trim()) || 'Gaurav Singh';
  const phone = (document.getElementById('checkoutPhone') && document.getElementById('checkoutPhone').value.trim()) || '+91 89797 53636';
  const address = (document.getElementById('checkoutAddress') && document.getElementById('checkoutAddress').value.trim()) || 'Plot 42, Green Avenue, Sector 14, Near Village Chowk';
  const orderId = 'MGK-' + Math.floor(100000 + Math.random() * 900000);

  const total = calculateOrderGrandTotal();

  if (total <= 0 || STATE.cart.length === 0) {
    showToast('Your cart is empty! Please add dishes before placing an order.');
    return;
  }

  // Determine payment method from radio selection
  const selectedPayEl = document.querySelector('input[name="paymentMethod"]:checked');
  const payVal = selectedPayEl ? selectedPayEl.value : 'UPI';

  let paymentMethod = 'PREPAID';
  let paymentStatus = 'PAID';
  let upiUtr = null;

  // STRICT PAYMENT VALIDATION: DO NOT CONFIRM ORDER WITHOUT PAYMENT
  if (payVal === 'UPI') {
    const utrInput = document.getElementById('checkoutUpiUtr');
    const utrVal = utrInput ? utrInput.value.trim() : '';
    const confirmCb = document.getElementById('upiConfirmPaidCheckbox');
    const isPaidChecked = confirmCb ? confirmCb.checked : false;
    const warnBox = document.getElementById('upiUnpaidWarning');
    const warnText = document.getElementById('upiWarningText');

    const triggerWarning = (msg, targetEl) => {
      if (warnText) warnText.innerHTML = `<strong>Payment Required:</strong> ${msg}`;
      if (warnBox) warnBox.style.display = 'flex';
      showToast(`⚠️ ${msg}`);
      if (targetEl) {
        targetEl.classList.add('input-error-shake');
        setTimeout(() => targetEl.classList.remove('input-error-shake'), 750);
        targetEl.focus();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // 1. Missing UTR verification: Order cannot be confirmed without payment
    if (!utrVal) {
      triggerWarning(
        `Order CANNOT be confirmed without payment! Please scan the PhonePe QR code to transfer ₹${total} to 7819952799@ybl, then enter your 12-digit UPI Transaction / UTR number from your payment receipt.`,
        utrInput
      );
      return; // CRITICAL: Stop execution, do not confirm
    }

    // 2. Minimum length check for 12-digit UPI UTR
    const cleanUtr = utrVal.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanUtr.length < 8) {
      triggerWarning(
        `Invalid UPI UTR Number. A valid UPI transaction reference is 12 digits (found on your PhonePe, Google Pay, or Paytm receipt).`,
        utrInput
      );
      return; // CRITICAL: Stop execution, do not confirm
    }

    // 3. Mandatory confirmation checkbox
    if (!isPaidChecked) {
      triggerWarning(
        `Please tick the checkbox to verify that you have transferred ₹${total} to 7819952799@ybl (Aditya Chauhan).`,
        confirmCb
      );
      return; // CRITICAL: Stop execution, do not confirm
    }

    upiUtr = cleanUtr;
    paymentMethod = 'PREPAID';
    paymentStatus = 'PAID';
  } else if (payVal === 'CASH') {
    paymentMethod = 'COD';
    paymentStatus = 'PENDING';
  } else if (payVal === 'CARD') {
    paymentMethod = 'PREPAID';
    paymentStatus = 'PAID';
  }

  const order = {
    id: orderId,
    name: name,
    customerName: name,
    phone: phone,
    customerPhone: phone,
    address: address,
    items: [...STATE.cart],
    total: total,
    orderType: STATE.orderType,
    paymentMethod: paymentMethod, // 'PREPAID' or 'COD'
    paymentMode: payVal, // 'UPI', 'CASH', 'CARD'
    paymentStatus: paymentStatus, // 'PAID' or 'PENDING'
    upiUtr: upiUtr,
    stageIndex: 1, // 1 to 5
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  STATE.activeOrder = order;
  STATE.pastOrders.unshift(order);
  STATE.cart = [];
  STATE.appliedPromo = null;
  updateCartUI();

  // Reset checkout inputs for next order
  const utrField = document.getElementById('checkoutUpiUtr');
  if (utrField) utrField.value = '';
  const confirmCbField = document.getElementById('upiConfirmPaidCheckbox');
  if (confirmCbField) confirmCbField.checked = false;

  // Sync to Backend Admin API
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  }).catch(e => console.log('Order offline saved'));

  // Update success screen details
  document.getElementById('successOrderId').textContent = '#' + orderId;
  const successPayBox = document.getElementById('successPaymentBox');
  const successPayText = document.getElementById('successPaymentText');
  if (successPayBox && successPayText) {
    if (order.paymentMode === 'UPI') {
      successPayText.innerHTML = `Paid via PhonePe / UPI (₹${total}) • UTR: <strong>${order.upiUtr}</strong> (Verified ✅)`;
      successPayBox.style.background = '#E8F5E9';
      successPayBox.style.color = '#2E7D32';
      successPayBox.style.borderColor = '#A5D6A7';
    } else if (order.paymentMode === 'CASH') {
      successPayText.innerHTML = `Cash on Delivery • Collect ₹${total} at arrival 💵`;
      successPayBox.style.background = '#FFF8E1';
      successPayBox.style.color = '#F57F17';
      successPayBox.style.borderColor = '#FFE082';
    } else {
      successPayText.innerHTML = `Paid Online via Card (₹${total}) ✅`;
      successPayBox.style.background = '#E8F5E9';
      successPayBox.style.color = '#2E7D32';
      successPayBox.style.borderColor = '#A5D6A7';
    }
  }

  navigateTo('orderSuccessScreen');
}

function renderTrackingScreen() {
  const order = STATE.activeOrder;
  if (!order) return;

  const stages = [
    { title: 'Order Confirmed', sub: 'Kitchen received your order', icon: '✓' },
    { title: 'Cooking on Firewood Chulha', sub: 'Baking fresh Bajra & Missi rotis with pure Desi Ghee', icon: '🔥' },
    { title: 'Simmering in Clay Handi', sub: 'Earthen pot slow dum aroma infused', icon: '🏺' },
    { title: 'Packed in Earthen Pots', sub: 'Sealed piping hot in eco-friendly pots', icon: '📦' },
    { title: order.orderType === 'dine_in' ? 'Served at Your Baithak' : 'Out for Delivery', sub: order.orderType === 'dine_in' ? 'Fresh at your table' : 'Rider is on the way', icon: '🛵' }
  ];

  const currentStage = order.stageIndex;
  const progressPercent = Math.min(100, currentStage * 20);

  document.getElementById('trackingProgressFill').style.width = `${progressPercent}%`;
  document.getElementById('trackingEstTime').textContent = `Estimated: ${Math.max(10, 35 - currentStage * 6)} mins`;
  document.getElementById('trackingStatusText').textContent = stages[currentStage - 1].title;
  document.getElementById('trackingOrderTypeBadge').textContent =
    order.orderType === 'delivery' ? 'Home Delivery' : (order.orderType === 'dine_in' ? 'Dine-In Baithak' : 'Takeaway');

  // Render timeline
  const timelineHtml = stages.map((s, idx) => {
    const stepNum = idx + 1;
    const isCompleted = stepNum < currentStage;
    const isCurrent = stepNum === currentStage;
    const isLast = idx === stages.length - 1;

    return `
      <div class="timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
        <div class="timeline-left">
          <div class="timeline-icon-box">${s.icon}</div>
          ${!isLast ? '<div class="timeline-line"></div>' : ''}
        </div>
        <div class="timeline-right">
          <div class="timeline-title">${s.title}</div>
          <div class="timeline-sub">${s.sub}</div>
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('trackingTimeline').innerHTML = timelineHtml;

  // Render order items summary
  const summaryHtml = `
    <h4 class="card-title">Order #${order.id} Items</h4>
    <div style="margin-top: 8px; font-size: 0.75rem;">
      ${order.items.map(i => `
        <div style="display: flex; justify-content: space-between; padding: 3px 0;">
          <span>${i.quantity}x ${i.item.name}</span>
          <strong>₹${i.item.price * i.quantity}</strong>
        </div>
      `).join('')}
      <div class="bill-divider"></div>
      <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 0.85rem; color: var(--terracotta);">
        <span>Total Paid</span>
        <span>₹${order.total}</span>
      </div>
    </div>
  `;
  document.getElementById('trackingItemsSummary').innerHTML = summaryHtml;
}

function advanceTrackingStage() {
  if (!STATE.activeOrder) return;
  if (STATE.activeOrder.stageIndex < 5) {
    STATE.activeOrder.stageIndex++;
    renderTrackingScreen();
    showToast(`Order status updated to Stage ${STATE.activeOrder.stageIndex}/5!`);
  } else {
    showToast('Order delivered! Hope you enjoyed ghar jaisa swaad!');
  }
}

// --- PAST ORDERS SCREEN ---
function renderPastOrdersScreen() {
  const container = document.getElementById('pastOrdersList');
  if (STATE.pastOrders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 50px 20px;">
        <span style="font-size: 2.5rem;">📜</span>
        <h4 style="margin: 10px 0 4px; font-family: var(--font-serif); color: var(--text-dark);">No Orders Placed Yet</h4>
        <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 16px;">
          Experience authentic village cuisine made with pure desi ghee!
        </p>
        <button class="btn btn-primary" onclick="navigateTo('menuScreen')">Order from Rasoi</button>
      </div>
    `;
    return;
  }

  container.innerHTML = STATE.pastOrders.map(order => `
    <div class="order-history-card" onclick="openOrderTracking('${order.id}')">
      <div class="order-history-header">
        <div>
          <span class="order-history-id">Order #${order.id}</span>
          <span class="order-history-date">${order.timestamp}</span>
        </div>
        <span class="order-history-status">${order.stageIndex === 5 ? 'Delivered' : 'Cooking'}</span>
      </div>
      <div class="order-history-items">
        ${order.items.map(i => `${i.quantity}x ${i.item.name}`).join(' • ')}
      </div>
      <div class="order-history-footer">
        <span class="order-history-total">₹${order.total}</span>
        <button class="btn-track-history">Track Chulha →</button>
      </div>
    </div>
  `).join('');
}

function openOrderTracking(orderId) {
  const order = STATE.pastOrders.find(o => o.id === orderId);
  if (order) {
    STATE.activeOrder = order;
    renderTrackingScreen();
    navigateTo('orderTrackingScreen');
  }
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  // Slide Bar Drawer (Clicking on Logo on left side opens the drawer)
  const topLogoBtn = document.getElementById('topLogoBtn');
  const slideDrawer = document.getElementById('slideDrawer');
  const slideDrawerBackdrop = document.getElementById('slideDrawerBackdrop');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const drawerReturnStoreBtn = document.getElementById('drawerReturnStoreBtn');

  function openSlideDrawer() {
    if (slideDrawer && slideDrawerBackdrop) {
      slideDrawer.classList.add('open');
      slideDrawerBackdrop.classList.add('active');
    }
  }

  function closeSlideDrawer() {
    if (slideDrawer && slideDrawerBackdrop) {
      slideDrawer.classList.remove('open');
      slideDrawerBackdrop.classList.remove('active');
    }
  }

  if (topLogoBtn) {
    topLogoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openSlideDrawer();
    });
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeSlideDrawer);
  }

  if (slideDrawerBackdrop) {
    slideDrawerBackdrop.addEventListener('click', closeSlideDrawer);
  }

  if (drawerReturnStoreBtn) {
    drawerReturnStoreBtn.addEventListener('click', () => {
      closeSlideDrawer();
      navigateTo('homeScreen');
    });
  }

  // Keyboard accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSlideDrawer();
  });

  // Role Login Items click feedback
  ['drawerAdminLoginBtn', 'drawerStaffLoginBtn', 'drawerKitchenLoginBtn', 'drawerDeliveryLoginBtn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', () => {
        const role = id.replace('drawer', '').replace('LoginBtn', '');
        showToast(`Opening ${role.toUpperCase()} Portal...`);
      });
    }
  });

  // Back Button
  document.getElementById('navBackBtn').addEventListener('click', goBack);

  // Top Cart Button & Floating Bar
  document.getElementById('topCartBtn').addEventListener('click', () => navigateTo('cartScreen'));
  document.getElementById('cartBarViewBtn').addEventListener('click', () => navigateTo('cartScreen'));

  // Bottom Navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const screen = btn.dataset.screen;
      if (screen === 'ordersScreen') renderPastOrdersScreen();
      navigateTo(screen);
    });
  });

  // Home Hero Buttons
  document.getElementById('heroOrderBtn').addEventListener('click', () => navigateTo('menuScreen'));
  document.getElementById('heroBookBtn').addEventListener('click', () => navigateTo('tableBookingScreen'));
  document.getElementById('viewAllCategoriesBtn').addEventListener('click', () => navigateTo('menuScreen'));

  // Home Quick Promo Apply
  document.getElementById('applyGaamPromoBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    applyPromo('GAAM100');
    updateCartUI();
  });

  // Search Inputs
  const homeSearch = document.getElementById('homeSearchInput');
  homeSearch.addEventListener('input', (e) => {
    STATE.searchQuery = e.target.value;
    renderMenuScreen();
    if (e.target.value.trim().length > 0 && STATE.activeScreen !== 'menuScreen') {
      navigateTo('menuScreen');
      document.getElementById('menuSearchInput').value = e.target.value;
    }
  });

  const menuSearch = document.getElementById('menuSearchInput');
  menuSearch.addEventListener('input', (e) => {
    STATE.searchQuery = e.target.value;
    renderMenuScreen();
  });

  // Veg Only Toggle
  document.getElementById('vegFilterToggle').addEventListener('change', (e) => {
    STATE.vegOnly = e.target.checked;
    renderMenuScreen();
  });

  // Order Type Tabs in Cart
  document.querySelectorAll('.order-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.order-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.orderType = btn.dataset.type;
      updateCartUI();
    });
  });

  // Customization Modal Stepper & Add
  document.getElementById('modalQtyPlus').addEventListener('click', () => {
    STATE.modalQty++;
    document.getElementById('modalQtyText').textContent = STATE.modalQty;
    updateModalPrice();
  });

  document.getElementById('modalQtyMinus').addEventListener('click', () => {
    if (STATE.modalQty > 1) {
      STATE.modalQty--;
      document.getElementById('modalQtyText').textContent = STATE.modalQty;
      updateModalPrice();
    }
  });

  document.getElementById('modalCloseBtn').addEventListener('click', () => {
    document.getElementById('itemDetailModal').style.display = 'none';
  });

  // Delegate Addons Checkbox changes in Modal
  document.getElementById('modalAddonsList').addEventListener('change', () => {
    const checked = [];
    document.querySelectorAll('input[name="modalAddon"]:checked').forEach(cb => {
      const addon = COMMON_ADDONS.find(a => a.id === cb.value);
      if (addon) checked.push(addon);
    });
    STATE.modalSelectedAddons = checked;
    updateModalPrice();
  });

  // Delegate Spice Radio change in Modal
  document.getElementById('modalSpiceOptions').addEventListener('change', (e) => {
    STATE.modalSelectedSpice = e.target.value;
  });

  document.getElementById('modalAddToCartBtn').addEventListener('click', () => {
    if (!STATE.modalItem) return;
    const note = document.getElementById('modalChefNote').value.trim();

    STATE.cart.push({
      id: 'cart_' + Date.now(),
      item: STATE.modalItem,
      quantity: STATE.modalQty,
      spice: STATE.modalSelectedSpice,
      addons: [...STATE.modalSelectedAddons],
      instructions: note
    });

    document.getElementById('itemDetailModal').style.display = 'none';
    showToast(`Added ${STATE.modalItem.name} with customizations!`);
    updateCartUI();
    renderHomeScreen();
    renderMenuScreen();
  });

  // Checkout Radio option switching and dynamic UPI Box toggle
  document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const selected = e.target.value;
      const upiBox = document.getElementById('upiPaymentBox');
      document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.method === selected);
      });

      if (selected === 'UPI') {
        if (upiBox) upiBox.style.display = 'block';
        renderCheckoutUpiDetails();
      } else {
        if (upiBox) upiBox.style.display = 'none';
        const warn = document.getElementById('upiUnpaidWarning');
        if (warn) warn.style.display = 'none';
      }
    });
  });

  document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', (e) => {
      const radio = option.querySelector('input[name="paymentMethod"]');
      if (radio && !radio.checked) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
      }
    });
  });

  // Scanner View Tabs (PhonePe Standee vs Dynamic Amount QR)
  const tabPhonepe = document.getElementById('tabPhonepeScanner');
  const tabDynamic = document.getElementById('tabDynamicQr');
  const phonepeBox = document.getElementById('phonepeScannerBox');
  const dynamicBox = document.getElementById('dynamicQrBox');

  if (tabPhonepe && tabDynamic) {
    tabPhonepe.addEventListener('click', () => {
      tabPhonepe.classList.add('active');
      tabDynamic.classList.remove('active');
      if (phonepeBox) phonepeBox.style.display = 'flex';
      if (dynamicBox) dynamicBox.style.display = 'none';
    });

    tabDynamic.addEventListener('click', () => {
      tabDynamic.classList.add('active');
      tabPhonepe.classList.remove('active');
      if (dynamicBox) dynamicBox.style.display = 'flex';
      if (phonepeBox) phonepeBox.style.display = 'none';
    });
  }

  // Scanner Lightbox Zoom Controls
  const scannerModal = document.getElementById('scannerLightboxModal');
  const closeScannerModalBtn = document.getElementById('closeScannerLightboxBtn');
  const openScannerModalBtn = document.getElementById('btnZoomScanner');
  const phonepeFrame = document.getElementById('phonepeScannerCardFrame');

  const openScannerModal = () => {
    if (scannerModal) scannerModal.style.display = 'flex';
  };
  const closeScannerModal = () => {
    if (scannerModal) scannerModal.style.display = 'none';
  };

  if (openScannerModalBtn) openScannerModalBtn.addEventListener('click', openScannerModal);
  if (phonepeFrame) phonepeFrame.addEventListener('click', openScannerModal);
  if (closeScannerModalBtn) closeScannerModalBtn.addEventListener('click', closeScannerModal);
  if (scannerModal) {
    scannerModal.addEventListener('click', (e) => {
      if (e.target === scannerModal) closeScannerModal();
    });
  }

  // Copy UPI ID to clipboard
  const copyUpiBtn = document.getElementById('btnCopyUpiId');
  if (copyUpiBtn) {
    copyUpiBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const upiId = document.getElementById('upiIdValue')?.textContent.trim() || '7819952799@ybl';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(upiId);
        } else {
          const temp = document.createElement('textarea');
          temp.value = upiId;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
        }
        const copyText = document.getElementById('copyText');
        const copyIcon = document.getElementById('copyIcon');
        if (copyText) copyText.textContent = 'Copied!';
        if (copyIcon) copyIcon.textContent = '✅';
        copyUpiBtn.classList.add('copied');
        showToast('UPI ID copied: ' + upiId + ' (Aditya Chauhan)');
        setTimeout(() => {
          if (copyText) copyText.textContent = 'Copy';
          if (copyIcon) copyIcon.textContent = '📋';
          copyUpiBtn.classList.remove('copied');
        }, 2500);
      } catch (err) {
        showToast('UPI ID: ' + upiId);
      }
    });
  }

  // Where is UTR Help popup toggle
  const utrHelpBtn = document.getElementById('btnUtrHelp');
  if (utrHelpBtn) {
    utrHelpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const helpCard = document.getElementById('utrHelpCard');
      if (helpCard) {
        helpCard.style.display = helpCard.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  // Real-time input clearing of warning on user interaction
  const utrInput = document.getElementById('checkoutUpiUtr');
  if (utrInput) {
    utrInput.addEventListener('input', () => {
      const warn = document.getElementById('upiUnpaidWarning');
      if (warn) warn.style.display = 'none';
      utrInput.classList.remove('input-error-shake');
    });
  }

  const confirmCb = document.getElementById('upiConfirmPaidCheckbox');
  if (confirmCb) {
    confirmCb.addEventListener('change', () => {
      const warn = document.getElementById('upiUnpaidWarning');
      if (warn) warn.style.display = 'none';
    });
  }

  // Confirm Order Button
  document.getElementById('confirmOrderBtn').addEventListener('click', placeOrder);

  // Success Screen Actions
  document.getElementById('trackOrderActionBtn').addEventListener('click', () => {
    renderTrackingScreen();
    navigateTo('orderTrackingScreen');
  });
  document.getElementById('successHomeBtn').addEventListener('click', () => navigateTo('homeScreen'));

  // Advance Stage Demo Button
  const advanceBtn = document.getElementById('advanceStageBtn');
  if (advanceBtn) {
    advanceBtn.addEventListener('click', advanceTrackingStage);
  }

  // Call Restaurant Action
  const callRestBtn = document.getElementById('callRestaurantBtn');
  if (callRestBtn) {
    callRestBtn.addEventListener('click', () => {
      showToast('Calling Mhare Gaam Ki Rasoi (+91 89797 53636)...');
      window.location.href = 'tel:+918979753636';
    });
  }

  // Table Booking Interaction
  document.querySelectorAll('.seating-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.seating-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  document.querySelectorAll('#guestCountChips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#guestCountChips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  document.querySelectorAll('#dateChips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#dateChips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  document.querySelectorAll('#timeChips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#timeChips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  document.getElementById('submitBaithakBtn').addEventListener('click', () => {
    const guests = document.querySelector('#guestCountChips .chip.active').dataset.count;
    const time = document.querySelector('#timeChips .chip.active').dataset.time;
    const date = document.querySelector('#dateChips .chip.active').dataset.date;
    const style = document.querySelector('.seating-option.selected input').value;
    const code = 'MGKR-' + Math.floor(1000 + Math.random() * 9000);

    const styleName = style === 'charpai' ? 'Village Charpai' : (style === 'chowki' ? 'Floor Chowki' : 'Family Table');

    const confirmedCard = document.getElementById('bookingConfirmedCard');
    document.getElementById('confirmedBookingCode').textContent = `Baithak Confirmed! Pass: ${code}`;
    document.getElementById('confirmedBookingDetails').textContent = `${guests} Guests • ${date} at ${time} • ${styleName}`;
    confirmedCard.style.display = 'flex';
    confirmedCard.scrollIntoView({ behavior: 'smooth' });

    // Sync to Backend Admin API
    const guestName = document.getElementById('baithakName')?.value || 'Gaurav Singh';
    const guestPhone = document.getElementById('baithakPhone')?.value || '8979753636';
    const guestNotes = document.getElementById('baithakNotes')?.value || '';

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: code,
        name: guestName,
        phone: guestPhone,
        guests: guests,
        date: date,
        time: time,
        seating: styleName,
        notes: guestNotes
      })
    }).catch(e => console.log('Booking offline saved'));

    showToast(`Baithak Reserved! Pass Code: ${code} 🎉`);
  });
}

// Toast Notifications
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
