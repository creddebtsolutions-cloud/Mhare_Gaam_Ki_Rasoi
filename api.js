/**
 * Mhare Gaam Ki Rasoi - Central API & State Client
 */

const RasoiAPI = {
  baseUrl: '',

  getToken() {
    return localStorage.getItem('mgk_token') || '';
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('mgk_token', token);
    } else {
      localStorage.removeItem('mgk_token');
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('mgk_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('mgk_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mgk_user');
    }
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers
      });

      const data = await response.json();
      if (!response.ok && !data.success) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  },

  // Auth endpoints
  async login(username, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  async customerOtpLogin(phone, name, otp = '1234') {
    return this.request('/api/auth/customer-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, name, otp })
    });
  },

  async getMe() {
    return this.request('/api/auth/me');
  },

  // Menu endpoints
  async getCategories() {
    return this.request('/api/menu/categories');
  },

  async getMenuItems(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/menu/items?${query}`);
  },

  async getDish(dishId) {
    return this.request(`/api/menu/items/${dishId}`);
  },

  async getOffers() {
    return this.request('/api/menu/offers');
  },

  // Orders endpoints
  async createOrder(orderPayload) {
    return this.request('/api/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });
  },

  async applyCoupon(code, subtotal) {
    return this.request('/api/orders/apply-coupon', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal })
    });
  },

  async getOrder(orderId) {
    return this.request(`/api/orders/${orderId}`);
  },

  async getUserOrders(userId) {
    return this.request(`/api/orders/user/${userId}`);
  },

  async submitReview(orderId, reviewPayload) {
    return this.request(`/api/orders/${orderId}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewPayload)
    });
  },

  async getRewards(userId) {
    return this.request(`/api/orders/rewards/user/${userId}`);
  },

  // KDS endpoints
  async getKdsOrders() {
    return this.request('/api/kds/orders');
  },

  async updateKdsStatus(orderId, status) {
    return this.request(`/api/kds/orders/${orderId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  },

  // POS endpoints
  async getTables() {
    return this.request('/api/pos/tables');
  },

  async updateTableStatus(tableId, status) {
    return this.request(`/api/pos/tables/${tableId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  },

  async createPosOrder(payload) {
    return this.request('/api/pos/create-order', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getTodayPosOrders() {
    return this.request('/api/pos/today-orders');
  },

  // Admin endpoints
  async getAdminOverview() {
    return this.request('/api/admin/overview');
  },

  async getSalesChart() {
    return this.request('/api/admin/sales-chart');
  },

  async getAdminOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/admin/orders?${query}`);
  },

  async assignAgent(orderId, agentId) {
    return this.request(`/api/admin/orders/${orderId}/assign-agent`, {
      method: 'POST',
      body: JSON.stringify({ agent_id: agentId })
    });
  },

  async getAdminMenu() {
    return this.request('/api/admin/menu');
  },

  async addDish(dishData) {
    return this.request('/api/admin/menu', {
      method: 'POST',
      body: JSON.stringify(dishData)
    });
  },

  async updateDish(dishId, data) {
    return this.request(`/api/admin/menu/${dishId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteDish(dishId) {
    return this.request(`/api/admin/menu/${dishId}`, {
      method: 'DELETE'
    });
  },

  async getAdminCoupons() {
    return this.request('/api/admin/coupons');
  },

  async createCoupon(data) {
    return this.request('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getAdminSettings() {
    return this.request('/api/admin/settings');
  },

  async updateAdminSettings(settingsData) {
    return this.request('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settingsData)
    });
  },

  async getDeliveryAgents() {
    return this.request('/api/admin/delivery-agents');
  },

  // AI Assistant Chat
  async sendChatMessage(message) {
    return this.request('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  // Toast UI notification utility
  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s';
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }
};
