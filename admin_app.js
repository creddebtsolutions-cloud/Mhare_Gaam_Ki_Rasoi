/**
 * Mhare Gaam Ki Rasoi - Super Admin Dashboard & Management Engine
 */

const AdminApp = {
  currentTab: 'overview',
  categories: [],
  agents: [],

  init() {
    this.bindEvents();
    this.loadTab('overview');
  },

  bindEvents() {
    document.querySelectorAll('.admin-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-admin-tab');
        this.loadTab(tab);
      });
    });
  },

  loadTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll('.admin-nav-link').forEach(l => {
      l.classList.toggle('active', l.getAttribute('data-admin-tab') === tabName);
    });

    document.querySelectorAll('.admin-tab-section').forEach(sec => {
      sec.style.display = 'none';
    });

    const target = document.getElementById(`adminSec-${tabName}`);
    if (target) {
      target.style.display = 'block';
    }

    if (tabName === 'overview') this.fetchOverview();
    if (tabName === 'orders') this.fetchOrders();
    if (tabName === 'menu') this.fetchMenu();
    if (tabName === 'coupons') this.fetchCoupons();
    if (tabName === 'settings') this.fetchSettings();
  },

  async fetchOverview() {
    try {
      const [overviewRes, chartRes] = await Promise.all([
        RasoiAPI.getAdminOverview(),
        RasoiAPI.getSalesChart()
      ]);

      if (overviewRes.success) {
        const stats = overviewRes.stats;
        document.getElementById('statTotalSales').innerText = `₹${stats.total_sales}`;
        document.getElementById('statTotalOrders').innerText = stats.total_orders;
        document.getElementById('statPreparing').innerText = stats.preparing;
        document.getElementById('statReady').innerText = stats.ready;
        document.getElementById('statCompleted').innerText = stats.completed;

        // Store status tag
        const storeTag = document.getElementById('adminStoreStatusBadge');
        if (storeTag) {
          storeTag.innerText = `Store: ${stats.store_status}`;
          storeTag.className = `store-status-toggle ${stats.store_status !== 'OPEN' ? 'closed' : ''}`;
        }

        // Top dishes
        const topList = document.getElementById('adminTopDishesList');
        if (topList && overviewRes.top_dishes) {
          topList.innerHTML = overviewRes.top_dishes.map(td => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-subtle);">
              <div>
                <strong style="color: var(--color-dark-text); font-size: 0.9rem;">${td.item_name}</strong>
                <div style="font-size: 0.76rem; color: var(--color-muted-brown);">${td.sold_qty} orders sold</div>
              </div>
              <span style="font-weight: 800; color: var(--color-primary); font-size: 0.95rem;">₹${td.total_rev}</span>
            </div>
          `).join('');
        }
      }

      if (chartRes.success && chartRes.chart) {
        this.renderSalesChart(chartRes.chart);
      }
    } catch (e) {
      console.error(e);
    }
  },

  renderSalesChart(data) {
    const chartContainer = document.getElementById('adminSalesBarChart');
    if (!chartContainer) return;

    const maxSale = Math.max(...data.map(d => d.sales), 15000);

    chartContainer.innerHTML = data.map(item => {
      const heightPercent = Math.round((item.sales / maxSale) * 100);
      return `
        <div class="bar-column">
          <div class="bar-fill" style="height: ${Math.max(10, heightPercent)}%;">
            <div class="bar-tooltip">₹${item.sales} (${item.orders} ord)</div>
          </div>
          <span class="bar-label">${item.day}</span>
        </div>
      `;
    }).join('');
  },

  async fetchOrders() {
    const tableBody = document.getElementById('adminOrdersTableBody');
    if (!tableBody) return;

    const statusFilter = document.getElementById('adminOrderStatusFilter') ? document.getElementById('adminOrderStatusFilter').value : 'ALL';

    try {
      const [ordersRes, agentsRes] = await Promise.all([
        RasoiAPI.getAdminOrders({ status: statusFilter }),
        RasoiAPI.getDeliveryAgents()
      ]);

      if (agentsRes.success) this.agents = agentsRes.agents;

      if (!ordersRes.success || !ordersRes.orders.length) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px;">No orders found.</td></tr>`;
        return;
      }

      tableBody.innerHTML = ordersRes.orders.map(o => `
        <tr>
          <td><strong>#${o.order_number}</strong></td>
          <td>${o.customer_name}<br/><small style="color: var(--color-muted-brown);">${o.customer_phone}</small></td>
          <td>${o.order_type}${o.table_number ? ` (${o.table_number})` : ''}</td>
          <td><strong>₹${o.grand_total}</strong> (${o.payment_method})</td>
          <td><span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span></td>
          <td>
            ${o.order_type === 'DELIVERY' ? `
              <select onchange="AdminApp.assignAgent('${o.id}', this.value)" style="padding: 4px; border-radius: 4px; font-size: 0.78rem;">
                <option value="">-- Assign Rider --</option>
                ${this.agents.map(a => `
                  <option value="${a.id}" ${o.assigned_agent_id === a.id ? 'selected' : ''}>
                    ${a.name} (${a.status})
                  </option>
                `).join('')}
              </select>
            ` : '<span style="color: #999;">N/A</span>'}
          </td>
          <td>
            <button class="btn btn-sm btn-outline" onclick="window.open('/receipt/${o.id}', '_blank')">
              Invoice
            </button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  async assignAgent(orderId, agentId) {
    if (!agentId) return;
    try {
      const res = await RasoiAPI.assignAgent(orderId, agentId);
      if (res.success) {
        RasoiAPI.showToast('Delivery partner assigned successfully!');
        this.fetchOrders();
      }
    } catch (e) {
      RasoiAPI.showToast('Failed to assign partner');
    }
  },

  async fetchMenu() {
    const tableBody = document.getElementById('adminMenuTableBody');
    if (!tableBody) return;

    try {
      const res = await RasoiAPI.getAdminMenu();
      if (!res.success) return;

      tableBody.innerHTML = res.dishes.map(d => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${d.image_url}" alt="${d.name}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;" />
              <div>
                <strong>${d.name}</strong>
                ${d.is_bestseller ? '<span class="badge-pill badge-bestseller" style="font-size: 0.65rem; margin-left: 4px;">Best</span>' : ''}
              </div>
            </div>
          </td>
          <td>${d.category_name || 'Special'}</td>
          <td>
            <input type="number" value="${d.price}" style="width: 75px; padding: 4px; border-radius: 4px; border: 1px solid var(--border-card); font-weight: 700;"
                   onchange="AdminApp.updateItemPrice('${d.id}', this.value)" />
          </td>
          <td>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="checkbox" ${d.is_available ? 'checked' : ''} onchange="AdminApp.toggleItemAvailability('${d.id}', this.checked)" />
              <span style="font-size: 0.82rem; font-weight: 600; color: ${d.is_available ? 'var(--color-success)' : 'var(--color-error)'};">
                ${d.is_available ? 'In Stock' : 'Sold Out'}
              </span>
            </label>
          </td>
          <td>
            <button class="btn btn-sm btn-outline" style="color: var(--color-error); border-color: var(--color-error);" onclick="AdminApp.deleteItem('${d.id}')">
              Delete
            </button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  async updateItemPrice(itemId, newPrice) {
    try {
      const res = await RasoiAPI.updateDish(itemId, { price: parseFloat(newPrice) });
      if (res.success) RasoiAPI.showToast('Dish price updated');
    } catch (e) {
      RasoiAPI.showToast('Failed to update price');
    }
  },

  async toggleItemAvailability(itemId, isAvailable) {
    try {
      const res = await RasoiAPI.updateDish(itemId, { is_available: isAvailable });
      if (res.success) RasoiAPI.showToast(isAvailable ? 'Dish marked In Stock' : 'Dish marked Sold Out');
    } catch (e) {
      RasoiAPI.showToast('Failed to update availability');
    }
  },

  async deleteItem(itemId) {
    if (!confirm('Are you sure you want to remove this dish from the menu?')) return;
    try {
      const res = await RasoiAPI.deleteDish(itemId);
      if (res.success) {
        RasoiAPI.showToast(res.message);
        this.fetchMenu();
      }
    } catch (e) {
      RasoiAPI.showToast('Failed to delete dish');
    }
  },

  openAddDishModal() {
    const modal = document.getElementById('adminAddDishModal');
    if (modal) modal.classList.add('active');
  },

  async submitNewDish() {
    const name = document.getElementById('newDishName').value.trim();
    const price = parseFloat(document.getElementById('newDishPrice').value) || 0;
    const catId = document.getElementById('newDishCat').value;
    const desc = document.getElementById('newDishDesc').value.trim();
    const spice = document.getElementById('newDishSpice').value;
    const isBestseller = document.getElementById('newDishBestseller').checked;

    if (!name || price <= 0) {
      RasoiAPI.showToast('Please provide valid dish name and price');
      return;
    }

    try {
      const res = await RasoiAPI.addDish({
        name, price, category_id: catId, description: desc, spice_level: spice, is_bestseller: isBestseller
      });
      if (res.success) {
        RasoiAPI.showToast(res.message);
        document.getElementById('adminAddDishModal').classList.remove('active');
        this.fetchMenu();
      }
    } catch (e) {
      RasoiAPI.showToast('Failed to add dish');
    }
  },

  async fetchCoupons() {
    const tableBody = document.getElementById('adminCouponsTableBody');
    if (!tableBody) return;

    try {
      const res = await RasoiAPI.getAdminCoupons();
      if (!res.success) return;

      tableBody.innerHTML = res.coupons.map(c => `
        <tr>
          <td><strong>${c.code}</strong></td>
          <td>${c.discount_type === 'PERCENTAGE' ? `${c.discount_value}%` : `₹${c.discount_value} FLAT`}</td>
          <td>₹${c.min_order}</td>
          <td>₹${c.max_discount || 'N/A'}</td>
          <td>${c.times_used} times</td>
          <td><span class="status-badge status-ready">${c.is_active ? 'ACTIVE' : 'INACTIVE'}</span></td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  async submitNewCoupon() {
    const code = document.getElementById('newCouponCode').value.trim().toUpperCase();
    const type = document.getElementById('newCouponType').value;
    const value = parseFloat(document.getElementById('newCouponVal').value) || 0;
    const minOrder = parseFloat(document.getElementById('newCouponMin').value) || 0;
    const maxDiscount = parseFloat(document.getElementById('newCouponMax').value) || 0;

    if (!code || value <= 0) {
      RasoiAPI.showToast('Please provide valid coupon code and value');
      return;
    }

    try {
      const res = await RasoiAPI.createCoupon({
        code, discount_type: type, discount_value: value, min_order: minOrder, max_discount: maxDiscount
      });
      if (res.success) {
        RasoiAPI.showToast(res.message);
        this.fetchCoupons();
      }
    } catch (e) {
      RasoiAPI.showToast('Failed to create coupon');
    }
  },

  async fetchSettings() {
    try {
      const res = await RasoiAPI.getAdminSettings();
      if (!res.success) return;

      const s = res.settings;
      if (document.getElementById('setStoreStatus')) document.getElementById('setStoreStatus').value = s.store_status;
      if (document.getElementById('setOpenTime')) document.getElementById('setOpenTime').value = s.opening_time;
      if (document.getElementById('setCloseTime')) document.getElementById('setCloseTime').value = s.closing_time;
      if (document.getElementById('setRadius')) document.getElementById('setRadius').value = s.delivery_radius_km;
      if (document.getElementById('setDeliveryFee')) document.getElementById('setDeliveryFee').value = s.delivery_fee;
      if (document.getElementById('setGst')) document.getElementById('setGst').value = s.gst_percentage;
      if (document.getElementById('setPhone')) document.getElementById('setPhone').value = s.phone;
    } catch (e) {
      console.error(e);
    }
  },

  async saveSettings() {
    const payload = {
      store_status: document.getElementById('setStoreStatus').value,
      opening_time: document.getElementById('setOpenTime').value,
      closing_time: document.getElementById('setCloseTime').value,
      delivery_radius_km: parseFloat(document.getElementById('setRadius').value) || 12,
      delivery_fee: parseFloat(document.getElementById('setDeliveryFee').value) || 35,
      gst_percentage: (document.getElementById('setGst') && document.getElementById('setGst').value !== '' && !isNaN(parseFloat(document.getElementById('setGst').value)))
        ? parseFloat(document.getElementById('setGst').value)
        : 5,
      phone: document.getElementById('setPhone').value
    };

    try {
      const res = await RasoiAPI.updateAdminSettings(payload);
      if (res.success) {
        RasoiAPI.showToast('Restaurant settings updated successfully!');
        this.fetchOverview();
      }
    } catch (e) {
      RasoiAPI.showToast('Failed to save settings');
    }
  }
};
