/**
 * Mhare Gaam Ki Rasoi - POS / Billing Counter Engine
 */

const PosApp = {
  orderType: 'DINE_IN',
  selectedTable: 'Table 1',
  selectedCategory: 'all',
  cart: [], // [{ dish, quantity }]
  dishes: [],
  categories: [],
  tables: [],
  paymentMethod: 'CASH',

  init() {
    this.fetchData();
  },

  async fetchData() {
    try {
      const [catsRes, itemsRes, tablesRes] = await Promise.all([
        RasoiAPI.getCategories(),
        RasoiAPI.getMenuItems(),
        RasoiAPI.getTables()
      ]);

      if (catsRes.success) this.categories = catsRes.categories;
      if (itemsRes.success) this.dishes = itemsRes.items;
      if (tablesRes.success) this.tables = tablesRes.tables;

      this.renderCategoryBar();
      this.renderItemsGrid();
      this.renderTableDropdown();
      this.renderCart();
      this.fetchTodayOrders();
    } catch (err) {
      console.error('POS Init Error:', err);
    }
  },

  setOrderType(type) {
    this.orderType = type;
    document.querySelectorAll('.pos-type-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-type') === type);
    });

    const tblWrap = document.getElementById('posTableSelectWrap');
    const custWrap = document.getElementById('posCustomerInfoWrap');

    if (tblWrap) tblWrap.style.display = type === 'DINE_IN' ? 'block' : 'none';
    if (custWrap) custWrap.style.display = type === 'DINE_IN' ? 'none' : 'block';
  },

  renderTableDropdown() {
    const sel = document.getElementById('posTableSelector');
    if (!sel) return;

    sel.innerHTML = this.tables.map(t => `
      <option value="${t.table_number}" ${t.table_number === this.selectedTable ? 'selected' : ''}>
        ${t.table_number} (${t.status}) • Cap: ${t.capacity}
      </option>
    `).join('');

    sel.onchange = (e) => {
      this.selectedTable = e.target.value;
    };
  },

  renderCategoryBar() {
    const bar = document.getElementById('posCategoryBar');
    if (!bar) return;

    let html = `
      <button class="pos-category-btn ${this.selectedCategory === 'all' ? 'active' : ''}" onclick="PosApp.selectCategory('all')">
        All Items
      </button>
    `;

    this.categories.forEach(c => {
      html += `
        <button class="pos-category-btn ${this.selectedCategory === c.id ? 'active' : ''}" onclick="PosApp.selectCategory('${c.id}')">
          ${c.icon || '🍲'} ${c.name}
        </button>
      `;
    });

    bar.innerHTML = html;
  },

  selectCategory(catId) {
    this.selectedCategory = catId;
    this.renderCategoryBar();
    this.renderItemsGrid();
  },

  renderItemsGrid() {
    const grid = document.getElementById('posItemsGrid');
    if (!grid) return;

    let filtered = this.dishes;
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(d => d.category_id === this.selectedCategory);
    }

    const searchInput = document.getElementById('posSearchInput');
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (q) {
      filtered = filtered.filter(d => d.name.toLowerCase().includes(q));
    }

    grid.innerHTML = filtered.map(d => `
      <div class="pos-item-card" onclick="PosApp.addToCart('${d.id}')">
        <div class="pos-item-thumb">
          <img src="${d.image_url}" alt="${d.name}" />
        </div>
        <div class="pos-item-title">${d.name}</div>
        <div class="pos-item-footer">
          <span class="pos-item-price">₹${d.price}</span>
          <span style="font-size: 0.72rem; color: var(--color-success); font-weight: 700;">+ ADD</span>
        </div>
      </div>
    `).join('');
  },

  addToCart(dishId) {
    const dish = this.dishes.find(d => d.id === dishId);
    if (!dish) return;

    const existing = this.cart.find(i => i.dish.id === dishId);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ dish, quantity: 1 });
    }

    this.renderCart();
  },

  updateQuantity(dishId, change) {
    const idx = this.cart.findIndex(i => i.dish.id === dishId);
    if (idx !== -1) {
      this.cart[idx].quantity += change;
      if (this.cart[idx].quantity <= 0) {
        this.cart.splice(idx, 1);
      }
      this.renderCart();
    }
  },

  setPaymentMethod(method) {
    this.paymentMethod = method;
    document.querySelectorAll('.pos-pay-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-method') === method);
    });

    const cashCalc = document.getElementById('posCashCalculator');
    if (cashCalc) {
      cashCalc.style.display = method === 'CASH' ? 'block' : 'none';
    }
  },

  calculateChange() {
    const tenderedInput = document.getElementById('posCashTendered');
    const changeSpan = document.getElementById('posCashChange');
    if (!tenderedInput || !changeSpan) return;

    const subtotal = this.cart.reduce((s, i) => s + (i.dish.price * i.quantity), 0);
    const taxes = Math.round((subtotal * 0.05) * 100) / 100;
    const total = subtotal + taxes;

    const tendered = parseFloat(tenderedInput.value) || 0;
    const change = Math.max(0, tendered - total);
    changeSpan.innerText = `₹${Math.round(change * 100) / 100}`;
  },

  renderCart() {
    const list = document.getElementById('posCartList');
    if (!list) return;

    if (this.cart.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; color: var(--color-muted-brown); padding: 40px 10px; font-size: 0.88rem;">
          🛒 Cart is empty.<br/>Click menu items to add to bill.
        </div>
      `;
      this.updateBillTotals(0, 0, 0);
      return;
    }

    list.innerHTML = this.cart.map(item => `
      <div class="pos-cart-row">
        <div class="pos-cart-info">
          <h5>${item.dish.name}</h5>
          <p>₹${item.dish.price} x ${item.quantity}</p>
        </div>
        <div class="pos-cart-qty-ctrl">
          <button onclick="PosApp.updateQuantity('${item.dish.id}', -1)">−</button>
          <span style="font-weight: 700; padding: 0 4px;">${item.quantity}</span>
          <button onclick="PosApp.updateQuantity('${item.dish.id}', 1)">+</button>
        </div>
        <div style="font-weight: 800; color: var(--color-primary);">
          ₹${item.dish.price * item.quantity}
        </div>
      </div>
    `).join('');

    const subtotal = this.cart.reduce((s, i) => s + (i.dish.price * i.quantity), 0);
    const taxes = Math.round((subtotal * 0.05) * 100) / 100;
    const grandTotal = subtotal + taxes;

    this.updateBillTotals(subtotal, taxes, grandTotal);
  },

  updateBillTotals(subtotal, taxes, grandTotal) {
    const subEl = document.getElementById('posSubtotal');
    const taxEl = document.getElementById('posTaxes');
    const totalEl = document.getElementById('posGrandTotal');
    const btnPay = document.getElementById('posBtnSubmitOrder');

    if (subEl) subEl.innerText = `₹${subtotal}`;
    if (taxEl) taxEl.innerText = `₹${taxes}`;
    if (totalEl) totalEl.innerText = `₹${grandTotal}`;
    if (btnPay) {
      btnPay.innerText = `GENERATE INVOICE • ₹${grandTotal}`;
      btnPay.disabled = this.cart.length === 0;
    }

    this.calculateChange();
  },

  async submitPosOrder() {
    if (this.cart.length === 0) return;

    const customerName = document.getElementById('posCustName') ? document.getElementById('posCustName').value : 'Walk-in Guest';
    const customerPhone = document.getElementById('posCustPhone') ? document.getElementById('posCustPhone').value : '9876543210';
    const instructions = document.getElementById('posInstructions') ? document.getElementById('posInstructions').value : '';

    const payload = {
      order_type: this.orderType,
      table_number: this.orderType === 'DINE_IN' ? this.selectedTable : null,
      customer_name: customerName,
      customer_phone: customerPhone,
      payment_method: this.paymentMethod,
      cooking_instructions: instructions,
      items: this.cart.map(i => ({
        menu_item_id: i.dish.id,
        quantity: i.quantity
      }))
    };

    try {
      const res = await RasoiAPI.createPosOrder(payload);
      if (res.success) {
        RasoiAPI.showToast(res.message);
        const orderId = res.order.id;

        // Reset cart
        this.cart = [];
        this.renderCart();
        this.fetchTodayOrders();

        // Open thermal invoice for printing
        window.open(`/receipt/${orderId}?print=true`, '_blank', 'width=420,height=600');
      }
    } catch (err) {
      RasoiAPI.showToast(err.message || 'Failed to create POS order');
    }
  },

  async fetchTodayOrders() {
    const container = document.getElementById('posTodayOrdersTable');
    if (!container) return;

    try {
      const res = await RasoiAPI.getTodayPosOrders();
      if (!res.success) return;

      container.innerHTML = res.orders.slice(0, 15).map(o => `
        <tr>
          <td><strong>#${o.order_number}</strong></td>
          <td>${o.order_type}${o.table_number ? ` (${o.table_number})` : ''}</td>
          <td>${o.customer_name}</td>
          <td>₹${o.grand_total}</td>
          <td><span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span></td>
          <td>
            <button class="btn btn-sm btn-outline" onclick="window.open('/receipt/${o.id}', '_blank')">
              🖨️ Receipt
            </button>
          </td>
        </tr>
      `).join('');
    } catch (e) {}
  }
};
