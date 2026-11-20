/**
 * Mhare Gaam Ki Rasoi - Customer Mobile Application Engine
 */

const CustomerApp = {
  activeTab: 'home',
  cart: [], // [{ dish, quantity, addons: [], instructions }]
  categories: [],
  dishes: [],
  selectedCategory: 'all',
  activeCoupon: null,
  activeOrder: null,
  currentDishDetail: null,

  init() {
    this.loadState();
    this.bindEvents();
    this.checkSplashAndOnboarding();
    this.fetchInitialData();
  },

  loadState() {
    try {
      const savedCart = localStorage.getItem('mgk_cart');
      if (savedCart) this.cart = JSON.parse(savedCart);
    } catch (e) {
      this.cart = [];
    }
  },

  saveCart() {
    localStorage.setItem('mgk_cart', JSON.stringify(this.cart));
    this.renderFloatingCartBar();
  },

  checkSplashAndOnboarding() {
    const splash = document.getElementById('splashScreen');
    const onboarding = document.getElementById('onboardingScreen');
    const seenOnboarding = localStorage.getItem('mgk_onboarding_done');

    // Display splash for 2 seconds
    setTimeout(() => {
      if (splash) {
        splash.classList.add('hidden');
      }
      if (!seenOnboarding && onboarding) {
        onboarding.style.display = 'flex';
      }
    }, 2000);
  },

  finishOnboarding() {
    localStorage.setItem('mgk_onboarding_done', 'true');
    const onboarding = document.getElementById('onboardingScreen');
    if (onboarding) onboarding.style.display = 'none';
  },

  async fetchInitialData() {
    try {
      const [catsRes, itemsRes, offersRes] = await Promise.all([
        RasoiAPI.getCategories(),
        RasoiAPI.getMenuItems(),
        RasoiAPI.getOffers()
      ]);

      if (catsRes.success) this.categories = catsRes.categories;
      if (itemsRes.success) this.dishes = itemsRes.items;
      if (offersRes.success) this.offers = offersRes.offers;

      this.renderHome();
      this.renderCategoriesScroller();
      this.renderFloatingCartBar();
    } catch (err) {
      console.error('Error fetching initial data:', err);
      RasoiAPI.showToast('Failed to load menu. Check your internet connection.');
    }
  },

  bindEvents() {
    // Bottom navigation
    document.querySelectorAll('.bottom-nav-bar .nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Close modals when clicking backdrop
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  },

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.bottom-nav-bar .nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-tab') === tabName);
    });

    // Hide all view containers
    document.querySelectorAll('.tab-view').forEach(view => {
      view.style.display = 'none';
    });

    const targetView = document.getElementById(`view-${tabName}`);
    if (targetView) {
      targetView.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (tabName === 'home') this.renderHome();
    if (tabName === 'menu') this.renderFullMenu();
    if (tabName === 'search') this.initSearchView();
    if (tabName === 'orders') this.renderOrdersView();
    if (tabName === 'profile') this.renderProfileView();
  },

  renderCategoriesScroller() {
    const container = document.getElementById('categoryScroller');
    if (!container) return;

    let html = `
      <div class="category-pill ${this.selectedCategory === 'all' ? 'active' : ''}" onclick="CustomerApp.selectCategory('all')">
        <span class="category-icon">✨</span>
        <span class="category-name">All Dishes</span>
      </div>
    `;

    this.categories.forEach(cat => {
      html += `
        <div class="category-pill ${this.selectedCategory === cat.id ? 'active' : ''}" onclick="CustomerApp.selectCategory('${cat.id}')">
          <span class="category-icon">${cat.icon || '🍲'}</span>
          <span class="category-name">${cat.name}</span>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  selectCategory(catId) {
    this.selectedCategory = catId;
    this.renderCategoriesScroller();
    if (this.activeTab === 'menu') {
      this.renderFullMenu();
    } else {
      this.switchTab('menu');
    }
  },

  renderHome() {
    const user = RasoiAPI.getCurrentUser();
    const greetingEl = document.getElementById('customerGreetingName');
    if (greetingEl) {
      greetingEl.innerText = user ? user.name.split(' ')[0] : 'Guest';
    }

    // Render Today's Specials (Horizontal Carousel)
    const specials = this.dishes.filter(d => d.is_featured);
    const specialsContainer = document.getElementById('homeSpecialsList');
    if (specialsContainer) {
      specialsContainer.innerHTML = specials.map(dish => this.renderCompactDishCard(dish)).join('');
    }

    // Render Bestsellers
    const bestsellers = this.dishes.filter(d => d.is_bestseller);
    const bestsellersContainer = document.getElementById('homeBestsellersList');
    if (bestsellersContainer) {
      bestsellersContainer.innerHTML = bestsellers.slice(0, 6).map(dish => this.renderListDishCard(dish)).join('');
    }

    // Render Thali Specials
    const thalis = this.dishes.filter(d => d.category_id === 'cat_thali');
    const thaliContainer = document.getElementById('homeThaliList');
    if (thaliContainer) {
      thaliContainer.innerHTML = thalis.map(dish => this.renderListDishCard(dish)).join('');
    }
  },

  renderFullMenu() {
    const container = document.getElementById('menuDishesList');
    if (!container) return;

    let filtered = this.dishes;
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      filtered = filtered.filter(d => d.category_id === this.selectedCategory);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🥘</div>
          <h3 style="font-family: var(--font-brand); color: var(--color-primary); margin-bottom: 6px;">
            Arre! Yeh dish abhi rasoi mein nahi mili 😄
          </h3>
          <p style="color: var(--color-muted-brown); font-size: 0.9rem;">Please choose another category or try searching.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(dish => this.renderListDishCard(dish)).join('');
  },

  renderCompactDishCard(dish) {
    const inCart = this.getCartItem(dish.id);
    return `
      <div class="dish-card-compact">
        <div class="dish-img-wrap" onclick="CustomerApp.openDishDetail('${dish.id}')">
          <img src="${dish.image_url}" alt="${dish.name}" loading="lazy" />
          <div style="position: absolute; top: 8px; left: 8px;">
            <div class="veg-badge" title="100% Pure Vegetarian"></div>
          </div>
          ${dish.is_bestseller ? '<div style="position: absolute; top: 8px; right: 8px;"><span class="badge-pill badge-bestseller">★ Best</span></div>' : ''}
        </div>
        <div class="dish-info">
          <h4 class="dish-title" onclick="CustomerApp.openDishDetail('${dish.id}')" style="cursor: pointer;">${dish.name}</h4>
          <div class="dish-meta-row">
            <span class="rating-badge">★ 4.8</span>
            <span class="price-current">₹${dish.price}</span>
          </div>
          <div style="margin-top: 6px;">
            ${this.renderAddOrCounterBtn(dish, inCart)}
          </div>
        </div>
      </div>
    `;
  },

  renderListDishCard(dish) {
    const inCart = this.getCartItem(dish.id);
    return `
      <div class="dish-card-list">
        <div class="dish-details-col">
          <div class="dish-meta-row">
            <div class="veg-badge" title="100% Pure Vegetarian"></div>
            ${dish.is_bestseller ? '<span class="badge-pill badge-bestseller">Bestseller</span>' : ''}
            <span class="badge-pill badge-spice">${dish.spice_level}</span>
          </div>
          <h3 style="font-size: 1rem; font-weight: 700; color: var(--color-dark-text); cursor: pointer; margin-bottom: 4px;"
              onclick="CustomerApp.openDishDetail('${dish.id}')">
            ${dish.name}
          </h3>
          <div class="dish-price-row">
            <span class="price-current">₹${dish.price}</span>
            ${dish.discount_price ? `<span class="price-original">₹${dish.discount_price}</span>` : ''}
            <span class="rating-badge">★ 4.8 (85+)</span>
          </div>
          <p class="dish-desc">${dish.description || ''}</p>
        </div>
        <div class="dish-action-col">
          <div class="dish-image-container" onclick="CustomerApp.openDishDetail('${dish.id}')">
            <img src="${dish.image_url}" alt="${dish.name}" loading="lazy" />
          </div>
          ${this.renderAddOrCounterBtn(dish, inCart)}
        </div>
      </div>
    `;
  },

  renderAddOrCounterBtn(dish, inCart) {
    if (inCart) {
      return `
        <div class="qty-counter">
          <button class="qty-btn" onclick="CustomerApp.updateQuantity('${dish.id}', -1)">−</button>
          <span class="qty-num">${inCart.quantity}</span>
          <button class="qty-btn" onclick="CustomerApp.updateQuantity('${dish.id}', 1)">+</button>
        </div>
      `;
    }
    return `
      <button class="btn-add-food" onclick="CustomerApp.addToCart('${dish.id}')">
        ADD +
      </button>
    `;
  },

  getCartItem(dishId) {
    return this.cart.find(i => i.dish.id === dishId);
  },

  async openDishDetail(dishId) {
    try {
      const res = await RasoiAPI.getDish(dishId);
      if (!res.success) return;

      const dish = res.dish;
      this.currentDishDetail = dish;
      const modal = document.getElementById('dishDetailModal');
      const content = document.getElementById('dishDetailContent');

      content.innerHTML = `
        <div style="position: relative; margin: -24px -24px 18px; height: 220px; overflow: hidden; border-top-left-radius: var(--radius-xl); border-top-right-radius: var(--radius-xl);">
          <img src="${dish.image_url}" alt="${dish.name}" style="width: 100%; height: 100%; object-fit: cover;" />
          <button onclick="document.getElementById('dishDetailModal').classList.remove('active')" 
                  style="position: absolute; top: 16px; right: 16px; width: 34px; height: 34px; border-radius: 50%; background: rgba(0,0,0,0.6); color: #fff; border: none; font-size: 1.2rem; cursor: pointer;">✕</button>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="veg-badge"></div>
            <span class="badge-pill badge-bestseller">${dish.is_bestseller ? 'Bestseller' : 'Pure Veg'}</span>
            <span class="badge-pill badge-spice">${dish.spice_level}</span>
          </div>
          <span style="font-size: 1.35rem; font-weight: 800; color: var(--color-primary);">₹${dish.price}</span>
        </div>

        <h2 style="font-family: var(--font-brand); font-size: 1.35rem; color: var(--color-primary); margin-bottom: 8px;">${dish.name}</h2>
        <p style="color: var(--color-muted-brown); font-size: 0.9rem; line-height: 1.5; margin-bottom: 16px;">${dish.description}</p>

        <div style="background: var(--color-warm-cream); border: 1px solid var(--border-card); border-radius: var(--radius-md); padding: 12px; margin-bottom: 16px;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary); margin-bottom: 4px;">🥘 Authentic Ingredients:</h4>
          <p style="font-size: 0.8rem; color: var(--color-muted-brown);">${dish.ingredients || 'Prepared with pure desi ghee, fresh spices, and farm ingredients.'}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 0.92rem; font-weight: 700; color: var(--color-dark-text); margin-bottom: 10px;">Thoda Aur? (Add-ons):</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;" id="dishAddonsList">
            ${(dish.addons || []).map((addon, idx) => `
              <label style="display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-card); cursor: pointer;">
                <span style="display: flex; align-items: center; gap: 10px; font-size: 0.9rem;">
                  <input type="checkbox" name="detail_addon" value="${addon.name}" data-price="${addon.price}" />
                  ${addon.name}
                </span>
                <span style="font-weight: 700; color: var(--color-terracotta);">+₹${addon.price}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <button class="btn btn-terracotta btn-block btn-lg" onclick="CustomerApp.addCurrentDetailToCart()">
          ADD TO CART • ₹${dish.price}
        </button>
      `;

      modal.classList.add('active');
    } catch (e) {
      console.error(e);
    }
  },

  addCurrentDetailToCart() {
    if (!this.currentDishDetail) return;
    const selectedAddons = [];
    document.querySelectorAll('#dishAddonsList input:checked').forEach(cb => {
      selectedAddons.push({
        name: cb.value,
        price: parseFloat(cb.getAttribute('data-price'))
      });
    });

    this.addToCart(this.currentDishDetail.id, selectedAddons);
    document.getElementById('dishDetailModal').classList.remove('active');
  },

  addToCart(dishId, addons = []) {
    const dish = this.dishes.find(d => d.id === dishId);
    if (!dish) return;

    const existing = this.getCartItem(dishId);
    if (existing) {
      existing.quantity += 1;
      if (addons.length > 0) existing.addons = addons;
    } else {
      this.cart.push({
        dish: dish,
        quantity: 1,
        addons: addons
      });
    }

    this.saveCart();
    RasoiAPI.showToast(`Swadist! ${dish.name} added to cart 🍲`);
    if (this.activeTab === 'home') this.renderHome();
    if (this.activeTab === 'menu') this.renderFullMenu();
    if (this.activeTab === 'search') this.runSearch();
  },

  updateQuantity(dishId, change) {
    const idx = this.cart.findIndex(i => i.dish.id === dishId);
    if (idx !== -1) {
      this.cart[idx].quantity += change;
      if (this.cart[idx].quantity <= 0) {
        this.cart.splice(idx, 1);
      }
      this.saveCart();
      if (this.activeTab === 'home') this.renderHome();
      if (this.activeTab === 'menu') this.renderFullMenu();
      if (this.activeTab === 'search') this.runSearch();
      this.renderCartDrawer();
    }
  },

  renderFloatingCartBar() {
    let bar = document.getElementById('floatingCartBar');
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);

    if (totalItems === 0) {
      if (bar) bar.style.display = 'none';
      return;
    }

    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'floatingCartBar';
      bar.className = 'floating-cart-bar';
      document.getElementById('appShell').appendChild(bar);
    }

    const subtotal = this.calculateSubtotal();
    bar.style.display = 'flex';
    bar.innerHTML = `
      <div>
        <div style="font-size: 0.76rem; letter-spacing: 0.5px; opacity: 0.9;">Aapki Thali (${totalItems} items)</div>
        <div style="font-size: 1.15rem; font-weight: 800;">₹${subtotal}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 0.95rem;">
        VIEW CART ➔
      </div>
    `;

    bar.onclick = () => this.openCartDrawer();
  },

  calculateSubtotal() {
    return this.cart.reduce((sum, item) => {
      const addonsCost = (item.addons || []).reduce((aSum, a) => aSum + a.price, 0);
      return sum + ((item.dish.price + addonsCost) * item.quantity);
    }, 0);
  },

  openCartDrawer() {
    const modal = document.getElementById('cartDrawerModal');
    this.renderCartDrawer();
    modal.classList.add('active');
  },

  renderCartDrawer() {
    const container = document.getElementById('cartDrawerContent');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 3.5rem; margin-bottom: 12px;">😋</div>
          <h3 style="font-family: var(--font-brand); color: var(--color-primary); margin-bottom: 6px;">
            Aapki thali abhi khaali hai 😋
          </h3>
          <p style="color: var(--color-muted-brown); font-size: 0.9rem; margin-bottom: 20px;">
            Authentic pure vegetarian swaad intezaar kar raha hai!
          </p>
          <button class="btn btn-primary" onclick="document.getElementById('cartDrawerModal').classList.remove('active'); CustomerApp.switchTab('menu');">
            EXPLORE MENU
          </button>
        </div>
      `;
      return;
    }

    const subtotal = this.calculateSubtotal();
    const discount = this.activeCoupon ? this.activeCoupon.discount : 0;
    const packagingFee = 20.0;
    const deliveryFee = subtotal >= 499 ? 0.0 : 35.0;
    const taxable = Math.max(0, subtotal - discount);
    const taxes = Math.round((taxable * 0.05) * 100) / 100;
    const grandTotal = Math.round((taxable + packagingFee + deliveryFee + taxes) * 100) / 100;
    const totalSavings = discount + (deliveryFee === 0 ? 35 : 0);

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle);">
        <h3 style="font-family: var(--font-brand); font-size: 1.25rem; color: var(--color-primary);">Aapki Thali (Cart)</h3>
        <button onclick="document.getElementById('cartDrawerModal').classList.remove('active')" style="background: none; border: none; font-size: 1.3rem; cursor: pointer;">✕</button>
      </div>

      ${totalSavings > 0 ? `
        <div style="background: rgba(62, 125, 50, 0.12); border: 1px solid var(--color-success); border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--color-success); font-size: 0.9rem;">
          <span>🎉</span> You saved ₹${totalSavings} on this order!
        </div>
      ` : ''}

      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        ${this.cart.map(item => `
          <div style="display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-card);">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <div class="veg-badge"></div>
                <h4 style="font-size: 0.92rem; font-weight: 700; color: var(--color-dark-text);">${item.dish.name}</h4>
              </div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary); margin-top: 4px;">
                ₹${item.dish.price}
              </div>
              ${item.addons && item.addons.length > 0 ? `
                <div style="font-size: 0.74rem; color: var(--color-muted-brown);">
                  + ${item.addons.map(a => a.name).join(', ')}
                </div>
              ` : ''}
            </div>
            <div class="qty-counter">
              <button class="qty-btn" onclick="CustomerApp.updateQuantity('${item.dish.id}', -1)">−</button>
              <span class="qty-num">${item.quantity}</span>
              <button class="qty-btn" onclick="CustomerApp.updateQuantity('${item.dish.id}', 1)">+</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="margin-bottom: 16px;">
        <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-dark-text); display: block; margin-bottom: 6px;">
          👨‍🍳 Special Cooking Instructions:
        </label>
        <input type="text" id="cartInstructionsInput" placeholder="e.g. Less spicy please, extra onion salad" 
               style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-card); background: var(--color-warm-cream); font-size: 0.88rem;" />
      </div>

      <div style="margin-bottom: 16px; background: #fff; border: 1px dashed var(--color-golden); padding: 12px; border-radius: var(--radius-md);">
        <div style="display: flex; gap: 8px;">
          <input type="text" id="couponCodeInput" placeholder="Enter Coupon (e.g. WELCOME50)" value="${this.activeCoupon ? this.activeCoupon.code : ''}" 
                 style="flex: 1; text-transform: uppercase; padding: 8px 12px; border: 1px solid var(--border-card); border-radius: var(--radius-xs); font-weight: 700; font-size: 0.85rem;" />
          <button class="btn btn-terracotta btn-sm" onclick="CustomerApp.handleApplyCoupon()">APPLY</button>
        </div>
        ${this.activeCoupon ? `<div style="color: var(--color-success); font-size: 0.8rem; font-weight: 700; margin-top: 6px;">✓ ${this.activeCoupon.message}</div>` : ''}
      </div>

      <div style="background: var(--color-warm-cream); border: 1px solid var(--border-card); border-radius: var(--radius-md); padding: 14px; margin-bottom: 20px;">
        <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--color-primary); margin-bottom: 10px;">Bill Summary</h4>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; color: var(--color-muted-brown);">
          <span>Item Total:</span>
          <span>₹${subtotal}</span>
        </div>
        ${discount > 0 ? `
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; color: var(--color-success); font-weight: 700;">
            <span>Coupon Discount:</span>
            <span>-₹${discount}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; color: var(--color-muted-brown);">
          <span>Packaging Charges:</span>
          <span>₹${packagingFee}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; color: var(--color-muted-brown);">
          <span>Delivery Fee:</span>
          <span>${deliveryFee === 0 ? '<span style="color: var(--color-success); font-weight: 700;">FREE</span>' : `₹${deliveryFee}`}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; color: var(--color-muted-brown);">
          <span>Taxes (GST 5%):</span>
          <span>₹${taxes}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 800; color: var(--color-primary); border-top: 1.5px dashed var(--border-card); padding-top: 8px; margin-top: 6px;">
          <span>Grand Total:</span>
          <span>₹${grandTotal}</span>
        </div>
      </div>

      <button class="btn btn-primary btn-block btn-lg" onclick="CustomerApp.openCheckoutModal(${grandTotal})">
        PROCEED TO CHECKOUT • ₹${grandTotal}
      </button>
    `;
  },

  async handleApplyCoupon() {
    const code = document.getElementById('couponCodeInput').value.trim();
    if (!code) {
      RasoiAPI.showToast('Please enter a coupon code.');
      return;
    }
    const subtotal = this.calculateSubtotal();
    try {
      const res = await RasoiAPI.applyCoupon(code, subtotal);
      if (res.success) {
        this.activeCoupon = res;
        RasoiAPI.showToast(res.message);
        this.renderCartDrawer();
      }
    } catch (err) {
      RasoiAPI.showToast(err.message || 'Invalid coupon code');
    }
  },

  openCheckoutModal(grandTotal) {
    document.getElementById('cartDrawerModal').classList.remove('active');
    const user = RasoiAPI.getCurrentUser();
    const modal = document.getElementById('checkoutModal');
    const content = document.getElementById('checkoutContent');

    content.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle);">
        <h3 style="font-family: var(--font-brand); font-size: 1.25rem; color: var(--color-primary);">Complete Your Order</h3>
        <button onclick="document.getElementById('checkoutModal').classList.remove('active')" style="background: none; border: none; font-size: 1.3rem; cursor: pointer;">✕</button>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-dark-text); margin-bottom: 6px; display: block;">Order Type:</label>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          <button type="button" class="btn btn-sm btn-terracotta" id="btnTypeDelivery" onclick="CustomerApp.setCheckoutOrderType('DELIVERY')">🛵 Delivery</button>
          <button type="button" class="btn btn-sm btn-outline" id="btnTypeTakeaway" onclick="CustomerApp.setCheckoutOrderType('TAKEAWAY')">🛍️ Takeaway</button>
          <button type="button" class="btn btn-sm btn-outline" id="btnTypeDineIn" onclick="CustomerApp.setCheckoutOrderType('DINE_IN')">🍽️ Dine-In</button>
        </div>
      </div>

      <div id="dineInTableField" style="display: none; margin-bottom: 16px;">
        <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-dark-text); margin-bottom: 6px; display: block;">Select Table Number:</label>
        <select id="checkoutTableNum" style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-card);">
          <option value="Table 1">Table 1 (Window Side)</option>
          <option value="Table 2">Table 2</option>
          <option value="Table 3">Table 3</option>
          <option value="Table 4">Table 4 (Family Corner)</option>
        </select>
      </div>

      <div id="deliveryAddressField" style="margin-bottom: 16px;">
        <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-dark-text); margin-bottom: 6px; display: block;">Delivery Address:</label>
        <input type="text" id="checkoutAddress" value="Flat 402, Green Valley Apartments, Near Sai Plaza, Meerut" 
               style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-card); background: #fff; font-size: 0.88rem;" />
      </div>

      <div style="margin-bottom: 16px;">
        <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-dark-text); margin-bottom: 6px; display: block;">Contact Mobile Number:</label>
        <input type="tel" id="checkoutPhone" value="${user ? user.phone : '9876543210'}" 
               style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-card); background: #fff; font-size: 0.88rem;" />
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-dark-text); margin-bottom: 8px; display: block;">Payment Method:</label>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: var(--radius-sm); border: 1.5px solid var(--color-secondary); background: #fff; cursor: pointer;">
            <input type="radio" name="checkoutPayment" value="UPI" checked />
            <span style="font-weight: 700;">UPI (Google Pay / PhonePe / Paytm / BHIM)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-card); background: #fff; cursor: pointer;">
            <input type="radio" name="checkoutPayment" value="CARD" />
            <span>Credit / Debit Card / Net Banking</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-card); background: #fff; cursor: pointer;">
            <input type="radio" name="checkoutPayment" value="CASH" />
            <span>Cash on Delivery / Pay at Counter</span>
          </label>
        </div>
      </div>

      <div style="background: rgba(196, 138, 58, 0.15); border: 1px solid var(--color-golden); border-radius: var(--radius-md); padding: 12px; margin-bottom: 18px; font-size: 0.85rem; color: var(--color-primary);">
        ⏱️ <strong>Estimated preparation time:</strong> ~25 minutes (Piping hot from Gaam Ki Rasoi)
      </div>

      <button class="btn btn-terracotta btn-block btn-lg" onclick="CustomerApp.submitOrder(${grandTotal})">
        PLACE ORDER • ₹${grandTotal}
      </button>
    `;

    modal.classList.add('active');
  },

  setCheckoutOrderType(type) {
    this.checkoutType = type;
    const btnDel = document.getElementById('btnTypeDelivery');
    const btnTak = document.getElementById('btnTypeTakeaway');
    const btnDin = document.getElementById('btnTypeDineIn');
    const addrField = document.getElementById('deliveryAddressField');
    const tableField = document.getElementById('dineInTableField');

    [btnDel, btnTak, btnDin].forEach(b => {
      b.className = 'btn btn-sm btn-outline';
    });

    if (type === 'DELIVERY') {
      btnDel.className = 'btn btn-sm btn-terracotta';
      if (addrField) addrField.style.display = 'block';
      if (tableField) tableField.style.display = 'none';
    } else if (type === 'TAKEAWAY') {
      btnTak.className = 'btn btn-sm btn-terracotta';
      if (addrField) addrField.style.display = 'none';
      if (tableField) tableField.style.display = 'none';
    } else if (type === 'DINE_IN') {
      btnDin.className = 'btn btn-sm btn-terracotta';
      if (addrField) addrField.style.display = 'none';
      if (tableField) tableField.style.display = 'block';
    }
  },

  async submitOrder(grandTotal) {
    const user = RasoiAPI.getCurrentUser();
    const orderType = this.checkoutType || 'DELIVERY';
    const address = document.getElementById('checkoutAddress') ? document.getElementById('checkoutAddress').value : 'Sai Plaza, Meerut';
    const phone = document.getElementById('checkoutPhone') ? document.getElementById('checkoutPhone').value : '9876543210';
    const tableNumber = document.getElementById('checkoutTableNum') ? document.getElementById('checkoutTableNum').value : null;
    const paymentRadio = document.querySelector('input[name="checkoutPayment"]:checked');
    const paymentMethod = paymentRadio ? paymentRadio.value : 'UPI';
    const instructions = document.getElementById('cartInstructionsInput') ? document.getElementById('cartInstructionsInput').value : '';

    const payload = {
      order_type: orderType,
      table_number: orderType === 'DINE_IN' ? tableNumber : null,
      delivery_address: address,
      customer_phone: phone,
      customer_name: user ? user.name : 'Valued Guest',
      payment_method: paymentMethod,
      cooking_instructions: instructions,
      coupon_code: this.activeCoupon ? this.activeCoupon.code : null,
      items: this.cart.map(i => ({
        menu_item_id: i.dish.id,
        quantity: i.quantity,
        addons: i.addons || []
      }))
    };

    try {
      const res = await RasoiAPI.createOrder(payload);
      if (res.success) {
        // Clear cart
        this.cart = [];
        this.activeCoupon = null;
        this.saveCart();
        document.getElementById('checkoutModal').classList.remove('active');
        if (window.RasoiSound) RasoiSound.playOrderChime();
        RasoiAPI.showToast('Order Mil Gaya! 🙏 Order Placed Successfully!');
        
        // Open Tracking
        this.openOrderTracking(res.order.id);
      }
    } catch (err) {
      RasoiAPI.showToast(err.message || 'Failed to place order.');
    }
  },

  async openOrderTracking(orderId) {
    try {
      const res = await RasoiAPI.getOrder(orderId);
      if (!res.success) return;

      const order = res.order;
      this.activeOrder = order;

      const modal = document.getElementById('orderTrackingModal');
      const content = document.getElementById('orderTrackingContent');

      const statuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
      const currentIndex = statuses.indexOf(order.status);

      content.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle);">
          <div>
            <h3 style="font-family: var(--font-brand); font-size: 1.25rem; color: var(--color-primary);">Order #${order.order_number}</h3>
            <span style="font-size: 0.76rem; color: var(--color-muted-brown);">${order.order_type} • ${order.created_at}</span>
          </div>
          <button onclick="document.getElementById('orderTrackingModal').classList.remove('active')" style="background: none; border: none; font-size: 1.3rem; cursor: pointer;">✕</button>
        </div>

        <div style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); color: var(--color-warm-cream); border-radius: var(--radius-md); padding: 16px; margin-bottom: 18px; border: 1.5px solid var(--color-golden);">
          <div style="font-size: 0.8rem; color: var(--color-golden-light); letter-spacing: 0.5px; text-transform: uppercase;">Estimated Arrival</div>
          <div style="font-size: 1.6rem; font-weight: 800; font-family: var(--font-brand); margin: 4px 0;">~${order.prep_time_minutes || 25} Minutes</div>
          <div style="font-size: 0.82rem; opacity: 0.9;">Ghar jaisa swaad rasoi se seedha aapke ghar 🍲</div>
        </div>

        <div class="order-tracking-steps">
          <div class="step-node ${currentIndex >= 0 ? (currentIndex === 0 ? 'active' : 'completed') : ''}">
            <div class="step-icon-wrap">📝</div>
            <div class="step-info">
              <h4>Order Placed</h4>
              <p>Rasoi ko aapka order mil gaya hai</p>
            </div>
          </div>
          <div class="step-node ${currentIndex >= 1 ? (currentIndex === 1 ? 'active' : 'completed') : ''}">
            <div class="step-icon-wrap">👍</div>
            <div class="step-info">
              <h4>Order Accepted</h4>
              <p>Kitchen team ne confirm kar liya hai</p>
            </div>
          </div>
          <div class="step-node ${currentIndex >= 2 ? (currentIndex === 2 ? 'active' : 'completed') : ''}">
            <div class="step-icon-wrap">👨‍🍳</div>
            <div class="step-info">
              <h4>Food Preparing</h4>
              <p>Desi ghee aur taaza masalo mein khana ban raha hai</p>
            </div>
          </div>
          <div class="step-node ${currentIndex >= 3 ? (currentIndex === 3 ? 'active' : 'completed') : ''}">
            <div class="step-icon-wrap">📦</div>
            <div class="step-info">
              <h4>Food Ready / Packed</h4>
              <p>Garam-garam pack ho chuka hai</p>
            </div>
          </div>
          <div class="step-node ${currentIndex >= 4 ? (currentIndex === 4 ? 'active' : 'completed') : ''}">
            <div class="step-icon-wrap">🛵</div>
            <div class="step-info">
              <h4>Out for Delivery</h4>
              <p>Delivery partner raste mein hai</p>
            </div>
          </div>
          <div class="step-node ${currentIndex >= 5 ? 'completed' : ''}">
            <div class="step-icon-wrap">🎉</div>
            <div class="step-info">
              <h4>Delivered</h4>
              <p>Swad ka anand lein! Ram Ram! 🙏</p>
            </div>
          </div>
        </div>

        <div style="background: var(--color-warm-cream); border: 1px solid var(--border-card); border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px;">
          <h4 style="font-size: 0.88rem; font-weight: 700; color: var(--color-primary); margin-bottom: 6px;">Items in this order:</h4>
          ${(order.items || []).map(i => `
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0;">
              <span>${i.quantity}x ${i.item_name}</span>
              <span style="font-weight: 700;">₹${i.subtotal}</span>
            </div>
          `).join('')}
          <div style="display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: 800; border-top: 1px dashed var(--border-card); margin-top: 8px; padding-top: 6px; color: var(--color-primary);">
            <span>Total Amount Paid:</span>
            <span>₹${order.grand_total} (${order.payment_method})</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 12px;">
          <a href="tel:+919876543210" class="btn btn-outline btn-sm" style="flex: 1;">📞 Call Restaurant</a>
          <a href="https://wa.me/919876543210?text=Hello%20Mhare%20Gaam%20Ki%20Rasoi,%20Order%20${order.order_number}" target="_blank" class="btn btn-forest btn-sm" style="flex: 1;">💬 WhatsApp</a>
        </div>

        <button class="btn btn-primary btn-block btn-sm" onclick="window.open('/receipt/${order.id}', '_blank')">
          🖨️ View & Print Bill Invoice
        </button>
      `;

      modal.classList.add('active');
    } catch (err) {
      console.error(err);
    }
  },

  initSearchView() {
    this.runSearch();
  },

  runSearch() {
    const input = document.getElementById('globalSearchInput');
    const query = input ? input.value.trim().toLowerCase() : '';
    const resultsContainer = document.getElementById('searchResultsList');
    if (!resultsContainer) return;

    let filtered = this.dishes;
    if (query) {
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        (d.ingredients && d.ingredients.toLowerCase().includes(query))
      );
    }

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
          <h3 style="font-family: var(--font-brand); color: var(--color-primary); margin-bottom: 6px;">
            Arre! Yeh dish abhi rasoi mein nahi mili 😄
          </h3>
          <p style="color: var(--color-muted-brown); font-size: 0.9rem;">
            Try searching for "paneer", "thali", "dal makhani", or "chole bhature".
          </p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = filtered.map(dish => this.renderListDishCard(dish)).join('');
  },

  async renderOrdersView() {
    const container = document.getElementById('myOrdersList');
    if (!container) return;

    const user = RasoiAPI.getCurrentUser();
    const userId = user ? user.id : 'user_cust_1'; // fallback to seeded demo customer

    try {
      const res = await RasoiAPI.getUserOrders(userId);
      if (!res.success || !res.orders.length) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 3rem; margin-bottom: 10px;">📦</div>
            <h3 style="font-family: var(--font-brand); color: var(--color-primary); margin-bottom: 6px;">No Orders Yet</h3>
            <p style="color: var(--color-muted-brown); font-size: 0.88rem; margin-bottom: 16px;">Swadist desi khana order karein!</p>
            <button class="btn btn-primary" onclick="CustomerApp.switchTab('menu')">ORDER NOW</button>
          </div>
        `;
        return;
      }

      container.innerHTML = res.orders.map(o => `
        <div class="card-surface" style="padding: 16px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-weight: 800; font-family: monospace; color: var(--color-primary);">#${o.order_number}</span>
            <span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span>
          </div>
          <div style="font-size: 0.85rem; color: var(--color-muted-brown); margin-bottom: 6px;">
            ${o.order_type} • ${o.item_count} item(s) • ${o.created_at}
          </div>
          <div style="font-size: 1.05rem; font-weight: 800; color: var(--color-dark-text); margin-bottom: 12px;">
            ₹${o.grand_total}
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline btn-sm" onclick="CustomerApp.openOrderTracking('${o.id}')" style="flex: 1;">
              Track Order
            </button>
            ${o.status === 'DELIVERED' ? `
              <button class="btn btn-terracotta btn-sm" onclick="CustomerApp.openReviewModal('${o.id}')">
                ⭐ Rate
              </button>
            ` : ''}
            <button class="btn btn-primary btn-sm" onclick="window.open('/receipt/${o.id}', '_blank')">
              Invoice
            </button>
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  openReviewModal(orderId) {
    this.reviewingOrderId = orderId;
    const modal = document.getElementById('customerReviewModal');
    if (modal) modal.classList.add('active');
  },

  async submitActiveReview() {
    if (!this.reviewingOrderId) return;
    const rating = parseInt(document.getElementById('reviewRatingVal').value) || 5;
    const comment = document.getElementById('reviewCommentText').value.trim();

    try {
      const res = await RasoiAPI.submitReview(this.reviewingOrderId, {
        rating,
        food_rating: rating,
        packaging_rating: rating,
        delivery_rating: rating,
        comment
      });

      if (res.success) {
        RasoiAPI.showToast(res.message);
        document.getElementById('customerReviewModal').classList.remove('active');
      }
    } catch (e) {
      RasoiAPI.showToast('Failed to submit review');
    }
  },

  async renderProfileView() {
    const user = RasoiAPI.getCurrentUser();
    const nameEl = document.getElementById('profileUserName');
    const phoneEl = document.getElementById('profileUserPhone');
    const pointsEl = document.getElementById('profileRewardsPoints');

    if (nameEl) nameEl.innerText = user ? user.name : 'Gaurav Singh';
    if (phoneEl) phoneEl.innerText = user ? user.phone : '+91 98765 43210';

    try {
      const res = await RasoiAPI.getRewards(user ? user.id : 'user_cust_1');
      if (res.success && pointsEl) {
        pointsEl.innerText = `${res.current_points} Points`;
      }
    } catch (e) {}
  }
};
