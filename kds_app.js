/**
 * Mhare Gaam Ki Rasoi - Chef Kitchen Display System (KDS) Engine
 */

const KdsApp = {
  pollInterval: null,
  ordersData: null,

  init() {
    this.startClock();
    this.fetchOrders();
    // Poll every 4 seconds for real-time kitchen sync
    this.pollInterval = setInterval(() => this.fetchOrders(), 4000);
  },

  destroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  },

  startClock() {
    const clockEl = document.getElementById('kdsClock');
    const update = () => {
      const now = new Date();
      if (clockEl) {
        clockEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    };
    update();
    setInterval(update, 1000);
  },

  async fetchOrders() {
    try {
      const res = await RasoiAPI.getKdsOrders();
      if (!res.success) return;
      this.ordersData = res.orders;

      // Update counters
      const counts = res.counts || {};
      const cNew = document.getElementById('countNew');
      const cAcc = document.getElementById('countAccepted');
      const cPrep = document.getElementById('countPrep');
      const cRdy = document.getElementById('countReady');

      if (cNew) cNew.innerText = counts['PLACED'] || 0;
      if (cAcc) cAcc.innerText = counts['ACCEPTED'] || 0;
      if (cPrep) cPrep.innerText = counts['PREPARING'] || 0;
      if (cRdy) cRdy.innerText = counts['READY'] || 0;

      const prevCount = this.lastPlacedCount || 0;
      const newCount = counts['PLACED'] || 0;
      if (newCount > prevCount && window.RasoiSound) {
        RasoiSound.playOrderChime();
      }
      this.lastPlacedCount = newCount;

      this.renderColumn('kdsListNew', res.orders['PLACED'] || [], 'PLACED');
      this.renderColumn('kdsListAccepted', res.orders['ACCEPTED'] || [], 'ACCEPTED');
      this.renderColumn('kdsListPreparing', res.orders['PREPARING'] || [], 'PREPARING');
      this.renderColumn('kdsListReady', res.orders['READY'] || [], 'READY');
    } catch (err) {
      console.error('KDS Fetch Error:', err);
    }
  },

  renderColumn(containerId, orders, statusKey) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: rgba(255,255,255,0.4); padding: 30px 10px; font-size: 0.85rem;">
          No orders in this state
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(ord => {
      let actionBtn = '';
      if (statusKey === 'PLACED') {
        actionBtn = `
          <button class="kds-action-btn btn-kds-accept" onclick="KdsApp.updateStatus('${ord.id}', 'ACCEPTED')">
            ACCEPT ORDER 👍
          </button>
        `;
      } else if (statusKey === 'ACCEPTED') {
        actionBtn = `
          <button class="kds-action-btn btn-kds-cook" onclick="KdsApp.updateStatus('${ord.id}', 'PREPARING')">
            START COOKING 👨‍🍳
          </button>
        `;
      } else if (statusKey === 'PREPARING') {
        actionBtn = `
          <button class="kds-action-btn btn-kds-ready" onclick="KdsApp.updateStatus('${ord.id}', 'READY')">
            MARK READY 📦
          </button>
        `;
      } else if (statusKey === 'READY') {
        actionBtn = `
          <div style="text-align: center; color: var(--color-success); font-weight: 700; font-size: 0.88rem; padding: 6px;">
            ✓ READY FOR DISPATCH
          </div>
        `;
      }

      return `
        <div class="kds-card">
          <div class="kds-card-header">
            <div>
              <span class="kds-order-num">#${ord.order_number}</span>
              <span class="kds-order-type" style="margin-left: 6px;">
                ${ord.order_type}${ord.table_number ? ` • ${ord.table_number}` : ''}
              </span>
            </div>
            <div class="kds-timer-wrap">
              ⏱️ ${ord.prep_time_minutes}m
            </div>
          </div>

          ${ord.cooking_instructions ? `
            <div class="kds-instruction-box">
              ⚠️ <strong>Note:</strong> ${ord.cooking_instructions}
            </div>
          ` : ''}

          <ul class="kds-items-list">
            ${ord.items.map(item => `
              <li class="kds-item-row">
                <span class="kds-item-qty">${item.quantity}x</span>
                <div>
                  <span class="kds-item-name">${item.name}</span>
                  ${item.addons && item.addons.length ? `
                    <div class="kds-item-addons">+ ${item.addons.map(a => a.name).join(', ')}</div>
                  ` : ''}
                </div>
              </li>
            `).join('')}
          </ul>

          ${actionBtn}
        </div>
      `;
    }).join('');
  },

  async updateStatus(orderId, newStatus) {
    try {
      const res = await RasoiAPI.updateKdsStatus(orderId, newStatus);
      if (res.success) {
        RasoiAPI.showToast(`Order status updated to ${newStatus}`);
        this.fetchOrders();
      }
    } catch (err) {
      RasoiAPI.showToast(err.message || 'Failed to update order status');
    }
  }
};
