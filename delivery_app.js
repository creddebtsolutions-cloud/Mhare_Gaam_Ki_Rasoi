/**
 * Mhare Gaam Ki Rasoi - Delivery Partner Fleet Engine
 */

const DeliveryApp = {
  currentAgentId: 'agent_1',
  agentData: null,
  pollTimer: null,

  init() {
    const user = RasoiAPI.currentUser;
    if (user && (user.role === 'DELIVERY_ADMIN' || user.email === 'delivery@rasoi.in' || user.phone === '9876500000')) {
      this.currentAgentId = 'agent_admin';
    } else if (user && user.role === 'DELIVERY_AGENT') {
      this.currentAgentId = 'agent_1';
    }
    this.fetchOrders();
    this.pollTimer = setInterval(() => this.fetchOrders(), 5000);
  },

  destroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
  },

  async fetchOrders() {
    try {
      const res = await RasoiAPI.request(`/api/delivery/my-orders/${this.currentAgentId}`);
      if (!res.success) return;

      this.agentData = res.agent;
      this.renderRiderHeader(res.agent);
      this.renderActiveQueue(res.active_orders);
      this.renderCompletedQueue(res.completed_orders);
    } catch (err) {
      console.error('Delivery fetch error:', err);
    }
  },

  renderRiderHeader(agent) {
    if (!agent) return;
    const nameEl = document.getElementById('riderName');
    const vehicleEl = document.getElementById('riderVehicle');
    const toggleEl = document.getElementById('riderDutyToggle');

    const isAdmin = agent.id === 'agent_admin';
    if (nameEl) nameEl.innerHTML = `${agent.name} ${isAdmin ? '<span style="font-size: 0.72rem; background: var(--color-terracotta); color: #fff; padding: 2px 8px; border-radius: 12px; margin-left: 6px;">👑 Fleet Admin</span>' : ''}`;
    if (vehicleEl) vehicleEl.innerText = `${agent.vehicle_number} • Meerut Fleet Management`;

    if (toggleEl) {
      const isOnline = agent.status !== 'OFFLINE';
      toggleEl.innerText = isOnline ? '● ON DUTY' : '○ OFFLINE';
      toggleEl.className = `rider-duty-toggle ${isOnline ? 'online' : 'offline'}`;
    }
  },

  async toggleDuty() {
    if (!this.agentData) return;
    const nextStatus = this.agentData.status === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE';
    try {
      const res = await RasoiAPI.request('/api/delivery/toggle-duty', {
        method: 'POST',
        body: JSON.stringify({ agent_id: this.currentAgentId, status: nextStatus })
      });
      if (res.success) {
        RasoiAPI.showToast(res.message);
        this.fetchOrders();
      }
    } catch (e) {}
  },

  renderActiveQueue(orders) {
    const container = document.getElementById('deliveryActiveList');
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--color-muted-brown);">
          <div style="font-size: 3rem; margin-bottom: 8px;">🛵</div>
          <h4 style="font-family: var(--font-brand); color: var(--color-primary); font-size: 1.1rem;">No Active Deliveries</h4>
          <p style="font-size: 0.82rem;">New orders assigned by Admin will appear here instantly.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(ord => {
      let actionBtn = '';
      if (ord.status === 'READY') {
        actionBtn = `
          <button class="btn btn-terracotta btn-block" onclick="DeliveryApp.updateDeliveryStatus('${ord.id}', 'OUT_FOR_DELIVERY')">
            📦 PICK UP FROM KITCHEN
          </button>
        `;
      } else if (ord.status === 'OUT_FOR_DELIVERY') {
        actionBtn = `
          <button class="btn btn-forest btn-block" onclick="DeliveryApp.updateDeliveryStatus('${ord.id}', 'DELIVERED')">
            🎉 MARK DELIVERED (Collect ₹${ord.grand_total})
          </button>
        `;
      }

      const encodedAddress = encodeURIComponent(ord.delivery_address || 'Sai Plaza, Meerut');

      return `
        <div class="delivery-card active-run">
          <div class="delivery-card-header">
            <div>
              <span class="delivery-order-no">#${ord.order_number}</span>
              <span class="status-badge status-${ord.status.toLowerCase()}" style="margin-left: 6px;">${ord.status}</span>
            </div>
            <span style="font-weight: 800; font-size: 1.1rem; color: var(--color-primary);">₹${ord.grand_total}</span>
          </div>

          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--color-dark-text);">${ord.customer_name}</div>
            <div style="font-size: 0.8rem; color: var(--color-muted-brown);">Payment: ${ord.payment_method} (${ord.payment_status})</div>
          </div>

          <div class="delivery-loc-box">
            <div style="font-size: 0.76rem; font-weight: 700; color: var(--color-terracotta); text-transform: uppercase;">Delivery Address:</div>
            <div style="font-size: 0.88rem; color: var(--color-dark-text); margin-top: 2px;">
              📍 ${ord.delivery_address || 'Sai Plaza, Meerut'}
            </div>
            ${ord.cooking_instructions ? `
              <div style="font-size: 0.78rem; color: var(--color-muted-brown); margin-top: 4px;">
                Note: ${ord.cooking_instructions}
              </div>
            ` : ''}
          </div>

          <div class="delivery-actions-row">
            <a href="https://www.google.com/maps/search/?api=1&query=${encodedAddress}" target="_blank" class="btn btn-outline btn-sm" style="flex: 1; text-align: center;">
              🗺️ Map Route
            </a>
            <a href="tel:${ord.customer_phone}" class="btn btn-sm btn-primary" style="flex: 1; text-align: center;">
              📞 Call Guest
            </a>
          </div>

          ${actionBtn}
        </div>
      `;
    }).join('');
  },

  renderCompletedQueue(orders) {
    const container = document.getElementById('deliveryCompletedList');
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `<div style="text-align: center; font-size: 0.8rem; color: var(--color-muted-brown); padding: 12px;">No deliveries completed yet today.</div>`;
      return;
    }

    container.innerHTML = orders.map(ord => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #fff; margin: 6px 16px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        <div>
          <strong>#${ord.order_number}</strong> • ${ord.customer_name}
          <div style="font-size: 0.74rem; color: var(--color-success);">✓ Delivered Successfully</div>
        </div>
        <div style="font-weight: 800; color: var(--color-primary);">₹${ord.grand_total}</div>
      </div>
    `).join('');
  },

  async updateDeliveryStatus(orderId, status) {
    try {
      const res = await RasoiAPI.request('/api/delivery/update-status', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderId,
          status: status,
          agent_id: this.currentAgentId
        })
      });

      if (res.success) {
        RasoiAPI.showToast(res.message);
        this.fetchOrders();
      }
    } catch (e) {
      RasoiAPI.showToast('Failed to update status');
    }
  }
};
