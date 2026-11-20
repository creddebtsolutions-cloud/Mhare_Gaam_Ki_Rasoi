/**
 * Mhare Gaam Ki Rasoi • Admin Management Engine
 * Handles REST API CRUD for Menu Dishes, Orders (KOT), and Baithak Reservations
 */

const IS_FILE_PROTOCOL = window.location.protocol === 'file:' || !window.location.origin || window.location.origin === 'null';
const API_BASE = (!IS_FILE_PROTOCOL && window.location.origin && window.location.origin.startsWith('http'))
  ? window.location.origin
  : (localStorage.getItem('mgkr_api_host') || 'http://192.168.31.133:3000');

let ALL_DISHES = [];
let ALL_ORDERS = [];
let ALL_BOOKINGS = [];
let ALL_TABLES = [];
let RESTAURANT_SETTINGS = {
  restaurantName: 'Mhare Gaam Ki Rasoi',
  tagline: 'Pure Desi Ghee & Mud Chulha Flavours',
  gstNumber: '06AABCM1234F1Z8',
  fssaiLicense: '10824001000542',
  address: 'Near Gaam Heritage Chaupal, Main Road',
  contactPhone: '+91 78199 52799',
  gstPercent: 5
};

// In-House POS State
let POS_TABLE = 'Table 1';
let POS_CART = [];
let POS_CATEGORY = 'all';
let POS_SEARCH = '';

// Billing Engine State (Save per Table & Respective Staff)
let ALL_BILLS = [];
let BILLS_FILTER_TABLE = 'all';
let BILLS_FILTER_STAFF = 'all';
let ACTIVE_BILL_ORDER_IDS = [];
let DETECTED_TABLE_ORDER = null;

// Delivery Portal State (Rider Dispatch & Delivery Screen)
let DELIVERY_FILTER = 'all';
let DELIVERY_SEARCH = '';

// Kitchen KDS State
let KDS_FILTER = 'all';
let KDS_SOUND_ENABLED = true;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initStatusBar();
  initDeviceToggles();
  initRolePreviewBar();
  initTabs();
  initAuth();
  initRoleSelector();
  initPosSystem();
  initBillingSystem();
  initDeliveryPortal();
  initKdsSystem();
  initInstallAppModal();
  setupEventListeners();

  const tabStaffBtn = document.getElementById('tabBtnStaffAccounts');
  if (tabStaffBtn) {
    tabStaffBtn.addEventListener('click', () => {
      renderStaffAccountsTab();
    });
  }

  const refreshStaffBtn = document.getElementById('refreshStaffAccountsBtn');
  if (refreshStaffBtn) {
    refreshStaffBtn.addEventListener('click', () => {
      renderStaffAccountsTab();
      showToast('Staff accounts refreshed!', 'info');
    });
  }

});

// --- ANDROID STATUS BAR & PHONE FRAME SIMULATOR LOGIC ---
function initStatusBar() {
  const timeEl = document.getElementById('statusTime');
  if (!timeEl) return;
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

function initDeviceToggles() {
  const toggleDeviceBtn = document.getElementById('toggleDeviceBtn');
  const toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn');

  // If on actual mobile device or inside Android WebView (file: protocol) or screen width <= 600px
  const isMobileOrApp = IS_FILE_PROTOCOL || 
    /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) || 
    window.innerWidth <= 600;

  if (isMobileOrApp) {
    document.body.classList.remove('device-phone-mode');
    document.body.classList.add('fullscreen-mode');
    if (toggleFullscreenBtn) toggleFullscreenBtn.classList.add('active');
    if (toggleDeviceBtn) toggleDeviceBtn.classList.remove('active');
    const toolbar = document.querySelector('.preview-toolbar');
    if (toolbar && (IS_FILE_PROTOCOL || window.innerWidth <= 600)) {
      toolbar.style.display = 'none';
    }
  }

  if (toggleDeviceBtn && toggleFullscreenBtn) {
    toggleDeviceBtn.addEventListener('click', () => {
      document.body.classList.remove('fullscreen-mode');
      document.body.classList.add('device-phone-mode');
      toggleDeviceBtn.classList.add('active');
      toggleFullscreenBtn.classList.remove('active');
    });

    toggleFullscreenBtn.addEventListener('click', () => {
      document.body.classList.remove('device-phone-mode');
      document.body.classList.add('fullscreen-mode');
      toggleFullscreenBtn.classList.add('active');
      toggleDeviceBtn.classList.remove('active');
    });
  }
}

function initInstallAppModal() {
  const modal = document.getElementById('installAppModal');
  const btnHeader = document.getElementById('btnInstallApkHeader');
  const btnToolbar = document.getElementById('btnToolbarInstallApk');
  const btnClose = document.getElementById('closeInstallAppModalBtn');
  const btnDismiss = document.getElementById('dismissInstallAppModalBtn');
  const phoneUrlEl = document.getElementById('installPhoneUrl');

  if (phoneUrlEl) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const host = isLocal ? '192.168.31.133' : window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    phoneUrlEl.textContent = `http://${host}${port}/download/apk`;
  }

  const openModal = (e) => {
    if (e) e.preventDefault();
    if (modal) modal.style.display = 'flex';
  };

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
  };

  if (btnHeader) btnHeader.addEventListener('click', openModal);
  if (btnToolbar) btnToolbar.addEventListener('click', openModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnDismiss) btnDismiss.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

function initRolePreviewBar() {
  const roleButtons = document.querySelectorAll('.btn-role-preview');
  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetRole = btn.dataset.role;
      roleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 1. If on login screen, switch role tab
      const loginTab = document.querySelector(`.login-role-tab[data-role="${targetRole}"]`);
      if (loginTab) {
        loginTab.click();
      }

      // 2. If logged in, navigate directly to that role's preview tab
      if (sessionStorage.getItem('mgkr_admin_token')) {
        if (targetRole === 'kitchen') {
          const tabOrders = document.getElementById('tabBtnOrders');
          if (tabOrders) {
            tabOrders.style.display = 'inline-flex';
            tabOrders.click();
          }
        } else if (targetRole === 'staff') {
          const tabPos = document.getElementById('tabBtnPos');
          if (tabPos) {
            tabPos.style.display = 'inline-flex';
            tabPos.click();
          }
        } else if (targetRole === 'delivery') {
          const tabDelivery = document.getElementById('tabBtnDelivery');
          if (tabDelivery) {
            tabDelivery.style.display = 'inline-flex';
            tabDelivery.click();
          }
        } else {
          const tabDishes = document.getElementById('tabBtnDishes');
          if (tabDishes) {
            tabDishes.style.display = 'inline-flex';
            tabDishes.click();
          }
        }
      }
    });
  });
}

// --- 0. ADMIN AUTHENTICATION ENGINE ---
function checkAuth() {
  const token = sessionStorage.getItem('mgkr_admin_token');
  const user = sessionStorage.getItem('mgkr_admin_user') || 'admin';
  const role = sessionStorage.getItem('mgkr_user_role') || 'Master Admin';
  const name = sessionStorage.getItem('mgkr_user_name') || user;
  const loginSection = document.getElementById('adminLoginSection');
  const dashboard = document.getElementById('adminDashboardWrapper');
  const loggedNameEl = document.getElementById('loggedAdminName');

  if (token) {
    if (loginSection) loginSection.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    if (loggedNameEl) {
      let icon = '👑';
      if (role.toLowerCase().includes('kitchen') || user === 'kitchen') icon = '👨‍🍳';
      else if (role.toLowerCase().includes('staff') || user.startsWith('staff')) icon = '🍽️';
      else if (role.toLowerCase().includes('delivery') || user.startsWith('delivery')) icon = '🛵';
      loggedNameEl.innerHTML = `${icon} ${name} <span style="opacity:0.75; font-size:0.75rem;">(${role})</span>`;
    }
    applyRolePermissions(role, user);
    initNotificationSystem();
    return true;
  } else {
    if (loginSection) loginSection.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
    return false;
  }
}

function applyRolePermissions(role, user) {
  const lowerRole = ((role || '') + ' ' + (user || '')).toLowerCase();
  const tabDishes = document.getElementById('tabBtnDishes');
  const tabPos = document.getElementById('tabBtnPos');
  const tabOrders = document.getElementById('tabBtnOrders');
  const tabBookings = document.getElementById('tabBtnBookings');
  const tabStaffAccounts = document.getElementById('tabBtnStaffAccounts');
  const tabBills = document.getElementById('tabBtnBills');
  const tabDelivery = document.getElementById('tabBtnDelivery');
  const statsGrid = document.getElementById('adminStatsGrid');

  // Reset all active
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  const headerStaffBtn = document.getElementById('openManageUsersModalBtn');
  const btnChangePwd = document.getElementById('openChangePasswordModalBtn');

  if (lowerRole.includes('kitchen')) {
    // Kitchen KDS only: direct fullscreen Chulha view
    if (statsGrid) statsGrid.style.display = 'none';
    if (tabDishes) tabDishes.style.display = 'none';
    if (tabPos) tabPos.style.display = 'none';
    if (tabBookings) tabBookings.style.display = 'none';
    if (tabStaffAccounts) tabStaffAccounts.style.display = 'none';
    if (tabBills) tabBills.style.display = 'none';
    if (tabDelivery) tabDelivery.style.display = 'none';
    if (headerStaffBtn) headerStaffBtn.style.display = 'none';
    if (btnChangePwd) btnChangePwd.style.display = 'none';
    if (tabOrders) {
      tabOrders.style.display = 'inline-flex';
      tabOrders.classList.add('active');
    }
    const ordersPane = document.getElementById('ordersTab');
    if (ordersPane) ordersPane.classList.add('active');
  } else if (lowerRole.includes('staff')) {
    // Staff In-House POS & Table Billing Terminal
    if (statsGrid) statsGrid.style.display = 'none';
    if (tabDishes) tabDishes.style.display = 'none';
    if (tabBookings) tabBookings.style.display = 'none';
    if (tabStaffAccounts) tabStaffAccounts.style.display = 'none';
    if (tabDelivery) tabDelivery.style.display = 'none';
    if (headerStaffBtn) headerStaffBtn.style.display = 'none';
    if (btnChangePwd) btnChangePwd.style.display = 'none';
    if (tabPos) {
      tabPos.style.display = 'inline-flex';
      tabPos.classList.add('active');
    }
    if (tabBills) tabBills.style.display = 'inline-flex';
    if (tabOrders) tabOrders.style.display = 'inline-flex';
    const posPane = document.getElementById('posTab');
    if (posPane) posPane.classList.add('active');
  } else if (lowerRole.includes('delivery')) {
    // Delivery Partner: Live Customer Orders Dispatch Portal
    if (statsGrid) statsGrid.style.display = 'none';
    if (tabDishes) tabDishes.style.display = 'none';
    if (tabPos) tabPos.style.display = 'none';
    if (tabOrders) tabOrders.style.display = 'none';
    if (tabBookings) tabBookings.style.display = 'none';
    if (tabStaffAccounts) tabStaffAccounts.style.display = 'none';
    if (tabBills) tabBills.style.display = 'none';
    if (headerStaffBtn) headerStaffBtn.style.display = 'none';
    if (btnChangePwd) btnChangePwd.style.display = 'none';
    if (tabDelivery) {
      tabDelivery.style.display = 'inline-flex';
      tabDelivery.classList.add('active');
    }
    const deliveryPane = document.getElementById('deliveryTab');
    if (deliveryPane) deliveryPane.classList.add('active');
    renderDeliveryPortal();
  } else {
    // Master Admin: Full Control with all tabs and stats
    if (statsGrid) statsGrid.style.display = 'grid';
    if (tabDishes) {
      tabDishes.style.display = 'inline-flex';
      tabDishes.classList.add('active');
    }
    if (tabPos) tabPos.style.display = 'inline-flex';
    if (tabOrders) tabOrders.style.display = 'inline-flex';
    if (tabBookings) tabBookings.style.display = 'inline-flex';
    if (tabStaffAccounts) tabStaffAccounts.style.display = 'inline-flex';
    if (tabBills) tabBills.style.display = 'inline-flex';
    if (tabDelivery) tabDelivery.style.display = 'inline-flex';
    if (headerStaffBtn) headerStaffBtn.style.display = 'inline-flex';
    if (btnChangePwd) btnChangePwd.style.display = 'inline-flex';
    const dishesPane = document.getElementById('dishesTab');
    if (dishesPane) dishesPane.classList.add('active');
  }

  // Admin-only In-House POS Table Management
  const isAdmin = isCurrentUserAdmin(role, user);
  const btnAddTable = document.getElementById('btnOpenAddTableModal');
  if (btnAddTable) {
    btnAddTable.style.display = isAdmin ? 'inline-flex' : 'none';
  }

  // Admin-only Business Settings (GST, FSSAI Details & Password Management)
  if (btnChangePwd) {
    btnChangePwd.style.display = isAdmin ? 'inline-flex' : 'none';
  }
  document.querySelectorAll('.admin-only-settings-btn').forEach(btn => {
    btn.style.display = isAdmin ? 'inline-flex' : 'none';
  });

  // Re-render table chips to reflect admin privileges
  if (typeof renderTableChips === 'function') {
    renderTableChips();
  }
}

function isCurrentUserAdmin(role, user) {
  const u = (user || sessionStorage.getItem('mgkr_admin_user') || '').toLowerCase().trim();
  const r = (role || sessionStorage.getItem('mgkr_user_role') || '').toLowerCase().trim();
  if (u === 'admin') return true;
  if (r.includes('admin') || r.includes('master') || r.includes('owner')) return true;
  if (u.startsWith('staff') || u.startsWith('kitchen') || u.startsWith('delivery')) return false;
  if (r.includes('staff') || r.includes('kitchen') || r.includes('delivery')) return false;
  return false;
}
window.isCurrentUserAdmin = isCurrentUserAdmin;

function initAuth() {
  initPasswordToggle();

  // Header quick-action: Open Staff & Kitchen Credentials tab (Admin only)
  const openUsersBtn = document.getElementById('openManageUsersModalBtn');
  if (openUsersBtn) {
    openUsersBtn.addEventListener('click', () => {
      const tabStaffBtn = document.getElementById('tabBtnStaffAccounts');
      if (tabStaffBtn) {
        tabStaffBtn.click();
      }
    });
  }

  initResetPasswordFlow();
  initDashboardChangePassword();
  initBusinessSettings();

  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Check initial state
  if (checkAuth()) {
    loadDishes();
    loadOrders();
    loadBookings();
    loadBills();
    loadRestaurantSettings();
  }
}

function setupPasswordToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (btn && input) {
    btn.addEventListener('click', () => {
      const isPwd = input.type === 'password';
      input.type = isPwd ? 'text' : 'password';
      btn.textContent = isPwd ? '🙈' : '👁️';
    });
  }
}

function initPasswordToggle() {
  setupPasswordToggle('togglePasswordBtn', 'adminPassword');
  setupPasswordToggle('toggleResetPinBtn', 'resetRecoveryPin');
  setupPasswordToggle('toggleResetNewPassBtn', 'resetNewPassword');
  setupPasswordToggle('toggleChangeCurrPwdBtn', 'changeCurrentPassword');
  setupPasswordToggle('toggleChangeNewPwdBtn', 'changeNewPassword');
}

function initResetPasswordFlow() {
  const loginContainer = document.getElementById('loginViewContainer');
  const resetContainer = document.getElementById('resetViewContainer');
  const showBtn = document.getElementById('showResetViewBtn');
  const showBottomBtn = document.getElementById('showResetViewBottomBtn');
  const backBtn = document.getElementById('backToLoginBtn');
  const cancelBtn = document.getElementById('cancelResetBtn');
  const resetForm = document.getElementById('adminResetForm');

  const showReset = () => {
    if (loginContainer && resetContainer) {
      loginContainer.style.display = 'none';
      resetContainer.style.display = 'block';
      const adminUserInput = document.getElementById('adminUsername');
      const resetUserInput = document.getElementById('resetAdminUsername');
      if (adminUserInput && resetUserInput && adminUserInput.value.trim()) {
        resetUserInput.value = adminUserInput.value.trim();
      } else if (resetUserInput && !resetUserInput.value) {
        resetUserInput.value = '';
      }
      const pinInput = document.getElementById('resetRecoveryPin');
      if (pinInput) pinInput.focus();
    }
  };

  const showLogin = () => {
    if (loginContainer && resetContainer) {
      resetContainer.style.display = 'none';
      loginContainer.style.display = 'block';
      const adminUserInput = document.getElementById('adminUsername');
      if (adminUserInput) adminUserInput.focus();
    }
  };

  if (showBtn) showBtn.addEventListener('click', showReset);
  if (showBottomBtn) showBottomBtn.addEventListener('click', showReset);
  if (backBtn) backBtn.addEventListener('click', showLogin);
  if (cancelBtn) cancelBtn.addEventListener('click', showLogin);



  if (resetForm) {
    resetForm.addEventListener('submit', handleResetPassword);
  }
}

async function handleResetPassword(e) {
  e.preventDefault();
  const username = document.getElementById('resetAdminUsername').value.trim();
  const recoveryPin = document.getElementById('resetRecoveryPin').value.trim();
  const newPassword = document.getElementById('resetNewPassword').value.trim();
  const confirmPassword = document.getElementById('resetConfirmPassword').value.trim();
  const submitBtn = document.getElementById('resetSubmitBtn');

  if (!username || !recoveryPin || !newPassword) {
    showToast('Please fill all required fields.', 'error');
    return;
  }

  if (newPassword.length < 4) {
    showToast('Password must be at least 4 characters.', 'error');
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast('New passwords do not match!', 'error');
    document.getElementById('resetConfirmPassword').focus();
    return;
  }

  const originalContent = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Updating Password...</span>';
  }

  try {
    const res = await fetch(`${API_BASE}/api/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, recoveryPin, newPassword })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast(data.message || 'Password reset successfully! Please sign in.', 'info');
      // Switch back to login form
      document.getElementById('resetViewContainer').style.display = 'none';
      document.getElementById('loginViewContainer').style.display = 'block';
      document.getElementById('adminUsername').value = username;
      document.getElementById('adminPassword').value = '';
      document.getElementById('adminPassword').focus();
      document.getElementById('adminResetForm').reset();
    } else {
      showToast(data.error || 'Failed to reset password. Check recovery PIN.', 'error');
    }
  } catch (err) {
    console.error('Reset password error:', err);
    showToast('Failed to connect to server. Please try again.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
    }
  }
}

function initDashboardChangePassword() {
  const modal = document.getElementById('changePasswordModal');
  const openBtn = document.getElementById('openChangePasswordModalBtn');
  const closeBtn = document.getElementById('closeChangePasswordModalBtn');
  const cancelBtn = document.getElementById('cancelChangePasswordBtn');
  const form = document.getElementById('changePasswordForm');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      if (modal) modal.style.display = 'flex';
      const currInput = document.getElementById('changeCurrentPassword');
      if (currInput) {
        currInput.value = '';
        currInput.focus();
      }
      document.getElementById('changeNewPassword').value = '';
      document.getElementById('changeConfirmPassword').value = '';
    });
  }

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', handleChangePassword);
  }
}

async function handleChangePassword(e) {
  e.preventDefault();
  if (!isCurrentUserAdmin()) {
    showToast('Permission denied: Password change is strictly restricted to Admin only. Staff, Kitchen and Delivery passwords are managed by Master Admin.', 'error');
    const modal = document.getElementById('changePasswordModal');
    if (modal) modal.style.display = 'none';
    return;
  }
  const username = sessionStorage.getItem('mgkr_admin_user') || 'admin';
  const currentPassword = document.getElementById('changeCurrentPassword').value.trim();
  const newPassword = document.getElementById('changeNewPassword').value.trim();
  const confirmPassword = document.getElementById('changeConfirmPassword').value.trim();
  const submitBtn = document.getElementById('saveChangePasswordBtn');

  if (newPassword.length < 4) {
    showToast('New password must be at least 4 characters.', 'error');
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast('New passwords do not match!', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    const res = await fetch(`${API_BASE}/api/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, currentPassword, newPassword })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast('Admin password updated successfully!', 'info');
      document.getElementById('changePasswordModal').style.display = 'none';
    } else {
      showToast(data.error || 'Failed to update password. Current password incorrect.', 'error');
    }
  } catch (err) {
    console.error('Error changing password:', err);
    showToast('Server communication error.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save New Password';
  }
}

// --- RESTAURANT BUSINESS & TAX COMPLIANCE SETTINGS (ADMIN ONLY) ---
async function loadRestaurantSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`);
    const data = await res.json();
    if (data.success && data.settings) {
      RESTAURANT_SETTINGS = data.settings;
    }
  } catch (err) {
    console.warn('Failed to load /api/settings:', err);
  }
}
window.loadRestaurantSettings = loadRestaurantSettings;

function isGstNumberPresent(gst) {
  const val = (gst || '').trim().toUpperCase();
  return Boolean(val && val !== 'NA' && val !== 'N/A' && val !== 'NONE' && val !== 'NIL' && val !== '0');
}

function getEffectiveGstRate() {
  if (!RESTAURANT_SETTINGS) return 0;
  const hasGst = isGstNumberPresent(RESTAURANT_SETTINGS.gstNumber);
  if (!hasGst) return 0; // When there is no GST Number, rate is always 0%
  if (RESTAURANT_SETTINGS.gstPercent !== undefined && RESTAURANT_SETTINGS.gstPercent !== null && !isNaN(Number(RESTAURANT_SETTINGS.gstPercent))) {
    return Math.max(0, Number(RESTAURANT_SETTINGS.gstPercent));
  }
  return 5;
}
window.getEffectiveGstRate = getEffectiveGstRate;

function initBusinessSettings() {
  const openBtn = document.getElementById('openBusinessSettingsBtn');
  if (openBtn) {
    openBtn.addEventListener('click', openBusinessSettingsModal);
  }

  const billsBtn = document.getElementById('btnBillsTabGstFssai');
  if (billsBtn) {
    billsBtn.addEventListener('click', openBusinessSettingsModal);
  }

  const closeBtn = document.getElementById('closeBusinessSettingsModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeBusinessSettingsModal);
  }

  const cancelBtn = document.getElementById('cancelBusinessSettingsBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeBusinessSettingsModal);
  }

  const form = document.getElementById('businessSettingsForm');
  if (form) {
    form.addEventListener('submit', handleBusinessSettingsSubmit);
  }

  // Live input typing listeners
  const gstIn = document.getElementById('settingGstNoInput');
  const fssaiIn = document.getElementById('settingFssaiNoInput');
  const nameIn = document.getElementById('settingBusinessNameInput');
  const rateIn = document.getElementById('settingGstPercentInput');

  if (gstIn) {
    gstIn.addEventListener('input', () => {
      gstIn.value = gstIn.value.toUpperCase();
      const hasGst = isGstNumberPresent(gstIn.value);
      if (!hasGst) {
        // Automatically switch to 0% GST when no GST Number
        if (rateIn) rateIn.value = '0';
      } else {
        // When user types a GST No., restore standard 5% if previously 0
        if (rateIn && (rateIn.value === '0' || rateIn.value === '')) {
          rateIn.value = '5';
        }
      }
      updateBusinessSettingsPreview();
    });
  }

  if (rateIn) {
    rateIn.addEventListener('input', () => {
      updateBusinessSettingsPreview();
    });
  }

  // Clickable GST Preset buttons (0%, 5%, 12%, 18%)
  document.querySelectorAll('.btn-gst-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetRate = btn.dataset.rate;
      if (rateIn) {
        rateIn.value = targetRate;
        updateBusinessSettingsPreview();
      }
    });
  });

  if (fssaiIn) {
    fssaiIn.addEventListener('input', updateBusinessSettingsPreview);
  }
  if (nameIn) {
    nameIn.addEventListener('input', updateBusinessSettingsPreview);
  }
}

function updateBusinessSettingsPreview() {
  const gstIn = document.getElementById('settingGstNoInput');
  const fssaiIn = document.getElementById('settingFssaiNoInput');
  const nameIn = document.getElementById('settingBusinessNameInput');
  const rateIn = document.getElementById('settingGstPercentInput');
  const badge = document.getElementById('gstRateStatusBadge');

  const previewName = document.getElementById('previewReceiptName');
  const previewCompliance = document.getElementById('previewReceiptCompliance');

  const nameVal = (nameIn ? nameIn.value : '') || 'MHARE GAAM KI RASOI';
  const gstVal = (gstIn ? gstIn.value : '').trim().toUpperCase();
  const fssaiVal = (fssaiIn ? fssaiIn.value : '').trim();
  const hasGst = isGstNumberPresent(gstVal);
  const rateVal = (rateIn && rateIn.value !== '' && !isNaN(Number(rateIn.value))) ? Number(rateIn.value) : (hasGst ? 5 : 0);

  if (badge) {
    if (!hasGst || rateVal === 0) {
      badge.textContent = '0% (No GST)';
      badge.style.background = '#FFEBEE';
      badge.style.color = '#C62828';
    } else {
      badge.textContent = `${rateVal}% GST Active`;
      badge.style.background = '#E8F5E9';
      badge.style.color = '#2E7D32';
    }
  }

  // Update preset buttons active highlight
  document.querySelectorAll('.btn-gst-preset').forEach(btn => {
    if (Number(btn.dataset.rate) === rateVal) {
      btn.style.background = '#2E7D32';
      btn.style.color = '#FFF';
      btn.style.borderColor = '#2E7D32';
    } else {
      btn.style.background = '#FFF';
      btn.style.color = '#333';
      btn.style.borderColor = '#CCC';
    }
  });

  if (previewName) previewName.textContent = nameVal.toUpperCase();

  let complianceText = '';
  if (hasGst) {
    complianceText += `GSTIN: ${gstVal} (${rateVal}% GST)`;
  } else {
    complianceText += `Non-GST (0% Tax Invoice)`;
  }
  if (fssaiVal && fssaiVal !== 'NA' && fssaiVal !== 'N/A') {
    complianceText += ` • FSSAI: ${fssaiVal}`;
  }
  if (previewCompliance) previewCompliance.textContent = complianceText;
}

function openBusinessSettingsModal() {
  if (!isCurrentUserAdmin()) {
    showToast('Permission Denied: Only Admin accounts can configure GST & FSSAI details!', 'error');
    return;
  }

  const modal = document.getElementById('businessSettingsModal');
  if (!modal) return;

  const gstIn = document.getElementById('settingGstNoInput');
  const fssaiIn = document.getElementById('settingFssaiNoInput');
  const nameIn = document.getElementById('settingBusinessNameInput');
  const phoneIn = document.getElementById('settingContactPhoneInput');
  const rateIn = document.getElementById('settingGstPercentInput');
  const addrIn = document.getElementById('settingAddressInput');

  const gstNumber = RESTAURANT_SETTINGS.gstNumber || '';
  const hasGst = isGstNumberPresent(gstNumber);
  const effectiveRate = hasGst ? (RESTAURANT_SETTINGS.gstPercent !== undefined ? RESTAURANT_SETTINGS.gstPercent : 5) : 0;

  if (gstIn) gstIn.value = gstNumber;
  if (fssaiIn) fssaiIn.value = RESTAURANT_SETTINGS.fssaiLicense || '';
  if (nameIn) nameIn.value = RESTAURANT_SETTINGS.restaurantName || 'Mhare Gaam Ki Rasoi';
  if (phoneIn) phoneIn.value = RESTAURANT_SETTINGS.contactPhone || '+91 78199 52799';
  if (rateIn) rateIn.value = effectiveRate;
  if (addrIn) addrIn.value = RESTAURANT_SETTINGS.address || 'Near Gaam Heritage Chaupal, Main Road';

  updateBusinessSettingsPreview();
  modal.style.display = 'flex';
}
window.openBusinessSettingsModal = openBusinessSettingsModal;

function closeBusinessSettingsModal() {
  const modal = document.getElementById('businessSettingsModal');
  if (modal) modal.style.display = 'none';
}
window.closeBusinessSettingsModal = closeBusinessSettingsModal;

async function handleBusinessSettingsSubmit(e) {
  if (e) e.preventDefault();

  if (!isCurrentUserAdmin()) {
    showToast('Permission Denied: Only Admin accounts can configure GST & FSSAI details!', 'error');
    return;
  }

  const gstIn = document.getElementById('settingGstNoInput');
  const fssaiIn = document.getElementById('settingFssaiNoInput');
  const nameIn = document.getElementById('settingBusinessNameInput');
  const phoneIn = document.getElementById('settingContactPhoneInput');
  const rateIn = document.getElementById('settingGstPercentInput');
  const addrIn = document.getElementById('settingAddressInput');

  const gstVal = (gstIn ? gstIn.value : '').trim().toUpperCase();
  const fssaiVal = (fssaiIn ? fssaiIn.value : '').trim();
  const hasGst = isGstNumberPresent(gstVal);

  let finalRate = 0;
  if (!hasGst) {
    // When no GST No., rate is strictly 0%
    finalRate = 0;
  } else if (rateIn && rateIn.value !== '' && !isNaN(Number(rateIn.value))) {
    finalRate = Math.max(0, Number(rateIn.value));
  } else {
    finalRate = 5;
  }

  const saveBtn = document.getElementById('saveBusinessSettingsBtn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span>⏳ Saving...</span>';
  }

  try {
    const payload = {
      restaurantName: (nameIn ? nameIn.value : '').trim() || 'Mhare Gaam Ki Rasoi',
      gstNumber: gstVal || 'NA',
      fssaiLicense: fssaiVal || 'NA',
      contactPhone: (phoneIn ? phoneIn.value : '').trim(),
      gstPercent: finalRate,
      address: (addrIn ? addrIn.value : '').trim(),
      updatedBy: sessionStorage.getItem('mgkr_admin_user') || 'admin'
    };

    const res = await fetch(`${API_BASE}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      RESTAURANT_SETTINGS = data.settings;
      renderPosTicket();
      const msg = finalRate === 0 
        ? '🎉 Saved! 0% GST (Non-GST) applied automatically across POS & bills.' 
        : `🎉 Saved! ${finalRate}% GST applied successfully.`;
      showToast(msg, 'success');
      closeBusinessSettingsModal();
    } else {
      showToast(data.error || 'Failed to update settings', 'error');
    }
  } catch (err) {
    console.error('Error saving settings:', err);
    showToast('Server connection error while saving settings', 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<span>💾 Save GST & FSSAI Details</span>';
    }
  }
}
window.handleBusinessSettingsSubmit = handleBusinessSettingsSubmit;

// --- ROLE SELECTOR (LOGIN SCREEN) ---
let CURRENT_LOGIN_ROLE = 'admin';

function initRoleSelector() {
  const roleButtons = document.querySelectorAll('.login-role-tab');
  const usernameInput = document.getElementById('adminUsername');
  const passwordInput = document.getElementById('adminPassword');
  const subtitle = document.getElementById('loginSubtitle');
  const hindiTag = document.getElementById('loginHindiTag');
  const userLabel = document.getElementById('loginUsernameLabel');
  const userIcon = document.getElementById('loginUsernameIcon');
  const submitLabel = document.getElementById('loginSubmitLabel');

  function setRoleTab(role) {
    CURRENT_LOGIN_ROLE = role;
    roleButtons.forEach(b => {
      if (b.dataset.role === role) b.classList.add('active');
      else b.classList.remove('active');
    });

    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';

    if (role === 'staff') {
      if (subtitle) subtitle.textContent = 'Floor Staff In-House Order POS';
      if (hindiTag) hindiTag.textContent = 'स्टाफ इन-हाउस बिलिंग प्रवेश';
      if (userLabel) userLabel.textContent = 'Staff ID / Mobile';
      if (userIcon) userIcon.textContent = '🍽️';
      if (usernameInput) usernameInput.placeholder = 'Enter Staff ID';
      if (submitLabel) submitLabel.textContent = 'Sign In to Staff POS';
    } else if (role === 'kitchen') {
      if (subtitle) subtitle.textContent = 'Kitchen Display System (KDS)';
      if (hindiTag) hindiTag.textContent = 'रसोई चूल्हा लाइव स्क्रीन';
      if (userLabel) userLabel.textContent = 'Kitchen ID / Mobile';
      if (userIcon) userIcon.textContent = '🔥';
      if (usernameInput) usernameInput.placeholder = 'Enter Kitchen ID';
      if (submitLabel) submitLabel.textContent = 'Sign In to Kitchen KDS';
    } else if (role === 'delivery') {
      if (subtitle) subtitle.textContent = 'Delivery Partner Order Dispatch Portal';
      if (hindiTag) hindiTag.textContent = 'डिलीवरी राइडर लॉगिन';
      if (userLabel) userLabel.textContent = 'Delivery Partner ID / Mobile';
      if (userIcon) userIcon.textContent = '🛵';
      if (usernameInput) usernameInput.placeholder = 'Enter Delivery Partner ID';
      if (submitLabel) submitLabel.textContent = 'Sign In as Delivery Partner';
    } else {
      CURRENT_LOGIN_ROLE = 'admin';
      if (subtitle) subtitle.textContent = 'Admin & Management Portal';
      if (hindiTag) hindiTag.textContent = 'प्रबंधक एवं एडमिन लॉगिन';
      if (userLabel) userLabel.textContent = 'Admin ID / Mobile';
      if (userIcon) userIcon.textContent = '👑';
      if (usernameInput) usernameInput.placeholder = 'Enter Admin ID';
      if (submitLabel) submitLabel.textContent = 'Sign In to Rasoi Admin';
    }
  }

  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setRoleTab(btn.dataset.role);
    });
  });

  // Read URL query parameter for role if present
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const paramRole = urlParams.get('role');
    const selected = (paramRole && ['admin', 'staff', 'kitchen', 'delivery'].includes(paramRole.toLowerCase()))
      ? paramRole.toLowerCase()
      : 'admin';
    setRoleTab(selected);

    // Sync presentation toolbar preview button
    const previewBtn = document.querySelector(`.btn-role-preview[data-role="${selected}"]`);
    if (previewBtn) {
      document.querySelectorAll('.btn-role-preview').forEach(b => b.classList.remove('active'));
      previewBtn.classList.add('active');
    }
  } catch (err) {
    setRoleTab('admin');
  }
}

// Web Audio API Bell Chime for Kitchen & POS
function playKitchenBell() {
  if (!KDS_SOUND_ENABLED) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Autoplay policy or unsupported
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const usernameInput = document.getElementById('adminUsername');
  const passwordInput = document.getElementById('adminPassword');
  const submitBtn = document.getElementById('loginSubmitBtn');

  const username = (usernameInput ? usernameInput.value : '').trim();
  const password = (passwordInput ? passwordInput.value : '').trim();

  if (!username || !password) {
    showToast('Please enter both User ID and Password', 'error');
    return;
  }

  const originalContent = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Verifying Credentials...</span>';
  }

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // STRICT ROLE ACCESS CONTROL
      const userRole = (data.role || '').toUpperCase();
      let isPermitted = false;
      let portalName = 'Admin';

      if (CURRENT_LOGIN_ROLE === 'admin') {
        portalName = 'Admin';
        isPermitted = userRole.includes('ADMIN');
      } else if (CURRENT_LOGIN_ROLE === 'staff') {
        portalName = 'Staff POS';
        isPermitted = userRole.includes('STAFF');
      } else if (CURRENT_LOGIN_ROLE === 'kitchen') {
        portalName = 'Kitchen KDS';
        isPermitted = userRole.includes('KITCHEN');
      } else if (CURRENT_LOGIN_ROLE === 'delivery') {
        portalName = 'Delivery Partner';
        isPermitted = userRole.includes('DELIVERY');
      }

      if (!isPermitted) {
        showToast(`Access Restricted: This account (${data.role}) cannot access the ${portalName} portal. Please login via your respective portal.`, 'error');
        if (passwordInput) passwordInput.value = '';
        return;
      }

      sessionStorage.setItem('mgkr_admin_token', data.token);
      sessionStorage.setItem('mgkr_admin_user', data.username);
      sessionStorage.setItem('mgkr_user_role', data.role || 'Master Admin');
      sessionStorage.setItem('mgkr_user_name', data.name || data.username);
      sessionStorage.setItem('mgkr_allowed_tabs', JSON.stringify(data.allowedTabs || []));
      showToast(`Welcome, ${data.name || data.username}! Logged into ${portalName}.`, 'info');

      checkAuth();
      loadDishes();
      loadOrders();
      loadBookings();
      loadBills();
      renderPosDishes();
      renderPosTicket();
    } else {
      showToast(data.error || 'Invalid User ID or Password', 'error');
      if (passwordInput) {
        passwordInput.focus();
        passwordInput.select();
      }
    }
  } catch (err) {
    console.error('Login error:', err);
    // Offline fallback for demo
    const u = username.toLowerCase();
    let role = 'Master Admin';
    let name = 'Head Admin';
    if (u === 'staff') { role = 'Floor Staff (In-House POS)'; name = 'Floor Captain'; }
    if (u === 'kitchen') { role = 'Kitchen Display System (KDS)'; name = 'Chulha Master'; }

    sessionStorage.setItem('mgkr_admin_token', 'mgkr_token_' + Date.now());
    sessionStorage.setItem('mgkr_admin_user', username);
    sessionStorage.setItem('mgkr_user_role', role);
    sessionStorage.setItem('mgkr_user_name', name);
    showToast(`Welcome, ${name}! Logged in as ${role}.`, 'info');
    checkAuth();
    loadDishes();
    loadOrders();
    loadBookings();
    loadBills();
    renderPosDishes();
    renderPosTicket();
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
    }
  }
}

function handleLogout() {
  if (confirm('Log out from Mhare Gaam Ki Rasoi?')) {
    sessionStorage.removeItem('mgkr_admin_token');
    sessionStorage.removeItem('mgkr_admin_user');
    sessionStorage.removeItem('mgkr_user_role');
    sessionStorage.removeItem('mgkr_user_name');
    sessionStorage.removeItem('mgkr_allowed_tabs');
    showToast('Logged out successfully', 'info');
    checkAuth();
  }
}

// Tab Switcher
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(btn.dataset.tab);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

// --- 1. DISHES MANAGEMENT ---

async function loadDishes() {
  try {
    let res;
    if (IS_FILE_PROTOCOL) {
      try {
        res = await fetch('data/menu.json');
      } catch (e) {
        res = await fetch(`${API_BASE}/api/menu`);
      }
    } else {
      res = await fetch(`${API_BASE}/api/menu`);
    }
    if (!res.ok) throw new Error('Failed to fetch dishes');
    ALL_DISHES = await res.json();
    localStorage.setItem('mgkr_cached_dishes', JSON.stringify(ALL_DISHES));
  } catch (err) {
    console.warn('Error loading dishes, using cache/fallback:', err);
    const cached = localStorage.getItem('mgkr_cached_dishes');
    if (cached) {
      try { ALL_DISHES = JSON.parse(cached); } catch (e) {}
    }
  }
  renderDishes();
  renderPosDishes();
  updateStats();
}

function renderDishes() {
  const container = document.getElementById('dishesGridContainer');
  const search = document.getElementById('dishSearchInput').value.trim().toLowerCase();
  const category = document.getElementById('dishCategoryFilter').value;

  let filtered = ALL_DISHES;

  if (category !== 'all') {
    filtered = filtered.filter(d => d.categoryId === category);
  }

  if (search) {
    filtered = filtered.filter(d =>
      (d.name && d.name.toLowerCase().includes(search)) ||
      (d.hindiName && d.hindiName.toLowerCase().includes(search)) ||
      (d.description && d.description.toLowerCase().includes(search))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--surface-warm); border-radius: 16px; border: 1px dashed var(--border-clay);">
        <span style="font-size: 2.5rem;">🌾</span>
        <h4 style="margin: 10px 0 4px; font-family: var(--font-serif);">No dishes match your filter</h4>
        <p style="font-size: 0.8rem; color: var(--text-secondary);">Click "Add New Village Dish" to add one!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(dish => `
    <div class="dish-card" data-dish-id="${dish.id}">
      <div class="dish-card-img-wrapper">
        <img src="${dish.image || 'images/dish_thali.jpg'}" alt="${dish.name}" class="dish-card-img" onerror="this.src='images/dish_thali.jpg'">
        <div class="dish-card-badges">
          ${dish.isVeg ? '<span class="badge-pill veg">🟢 Pure Veg</span>' : ''}
          ${dish.isDesiGheeSpecial ? '<span class="badge-pill ghee">🧈 Desi Ghee</span>' : ''}
          ${dish.isVillageSpecial ? '<span class="badge-pill village">🌾 Gaam Special</span>' : ''}
        </div>
        <span class="dish-stock-status ${dish.isAvailable !== false ? 'in-stock' : 'out-stock'}">
          ${dish.isAvailable !== false ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>

      <div class="dish-card-body">
        <div class="dish-card-header">
          <h4 class="dish-title">${dish.name}</h4>
          <span class="dish-price">₹${dish.price}</span>
        </div>
        <p class="dish-hindi-title">${dish.hindiName || ''}</p>
        <p class="dish-card-desc">${dish.description || 'Authentic traditional recipe'}</p>

        <div class="dish-card-meta">
          <span>⏱️ ${dish.prepTime || 15} mins</span>
          <span>•</span>
          <span>⭐ ${dish.rating || 4.9} (${dish.reviewCount || 10})</span>
          <span>•</span>
          <span style="text-transform: capitalize;">${dish.categoryId}</span>
        </div>

        <div class="dish-card-actions">
          <button class="btn btn-secondary btn-sm" onclick="toggleDishStock('${dish.id}')">
            ${dish.isAvailable !== false ? 'Mark Out of Stock' : 'Mark In Stock'}
          </button>
          <button class="btn btn-primary btn-sm" onclick="openEditDishModal('${dish.id}')">
            ✏️ Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteDish('${dish.id}')">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Toggle In-Stock Status
async function toggleDishStock(dishId) {
  const dish = ALL_DISHES.find(d => d.id === dishId);
  if (!dish) return;

  const newStatus = !(dish.isAvailable !== false);
  try {
    const res = await fetch(`${API_BASE}/api/menu/${dishId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: newStatus })
    });
    if (!res.ok) throw new Error('Failed to update stock');

    dish.isAvailable = newStatus;
    renderDishes();
    showToast(`${dish.name} is now ${newStatus ? 'In Stock' : 'Out of Stock'}`);
  } catch (err) {
    console.error(err);
    showToast('Failed to update stock status', 'error');
  }
}

// Delete Dish
async function deleteDish(dishId) {
  const dish = ALL_DISHES.find(d => d.id === dishId);
  if (!dish) return;

  if (!confirm(`Are you sure you want to remove "${dish.name}" from the menu?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/menu/${dishId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete dish');

    ALL_DISHES = ALL_DISHES.filter(d => d.id !== dishId);
    renderDishes();
    updateStats();
    showToast(`Removed "${dish.name}" from menu!`);
  } catch (err) {
    console.error(err);
    showToast('Failed to delete dish', 'error');
  }
}

// Modal Form (Add or Edit)
function openAddDishModal() {
  document.getElementById('modalTitle').textContent = '➕ Add New Village Dish';
  document.getElementById('dishEditId').value = '';
  document.getElementById('dishForm').reset();
  document.getElementById('dishIsAvailable').checked = true;
  document.querySelector('input[name="imagePreset"][value="images/dish_thali.jpg"]').checked = true;
  clearUploadedProductPicture();
  document.getElementById('dishModal').style.display = 'flex';
}

function openEditDishModal(dishId) {
  const dish = ALL_DISHES.find(d => d.id === dishId);
  if (!dish) return;

  document.getElementById('modalTitle').textContent = `✏️ Edit "${dish.name}"`;
  document.getElementById('dishEditId').value = dish.id;
  document.getElementById('dishName').value = dish.name;
  document.getElementById('dishHindiName').value = dish.hindiName || '';
  document.getElementById('dishCategory').value = dish.categoryId || 'thalis';
  document.getElementById('dishPrice').value = dish.price;
  document.getElementById('dishOrigPrice').value = dish.originalPrice || '';
  document.getElementById('dishDescription').value = dish.description || '';
  document.getElementById('dishPrepTime').value = dish.prepTime || 15;
  document.getElementById('dishRating').value = dish.rating || 4.9;

  document.getElementById('dishIsVeg').checked = dish.isVeg !== false;
  document.getElementById('dishIsDesiGhee').checked = !!dish.isDesiGheeSpecial;
  document.getElementById('dishIsVillageSpecial').checked = !!dish.isVillageSpecial;
  document.getElementById('dishIsAvailable').checked = dish.isAvailable !== false;

  const uploadedUrlInput = document.getElementById('dishUploadedImageUrl');
  const customUrlInput = document.getElementById('dishCustomImage');
  const activeCard = document.getElementById('uploadActiveCard');
  const prompt = document.getElementById('uploadDropzonePrompt');
  const previewImg = document.getElementById('dishUploadPreviewImg');
  const fileNameEl = document.getElementById('uploadFileName');
  const statusEl = document.getElementById('uploadFileStatus');

  // Preset or custom/uploaded image
  const presetRadio = document.querySelector(`input[name="imagePreset"][value="${dish.image}"]`);
  if (presetRadio) {
    presetRadio.checked = true;
    if (uploadedUrlInput) uploadedUrlInput.value = '';
    if (customUrlInput) customUrlInput.value = '';
    if (activeCard) activeCard.style.display = 'none';
    if (prompt) prompt.style.display = 'flex';
  } else if (dish.image) {
    // Custom uploaded picture or external URL
    document.querySelectorAll('input[name="imagePreset"]').forEach(r => r.checked = false);
    if (uploadedUrlInput) uploadedUrlInput.value = dish.image;
    if (customUrlInput) customUrlInput.value = dish.image;
    if (previewImg) previewImg.src = dish.image;
    if (fileNameEl) fileNameEl.textContent = (dish.name || 'Dish') + ' Photo';
    if (statusEl) statusEl.textContent = '✅ Current Product Picture';
    if (activeCard) activeCard.style.display = 'flex';
    if (prompt) prompt.style.display = 'none';
  } else {
    clearUploadedProductPicture();
  }

  document.getElementById('dishModal').style.display = 'flex';
}

function closeDishModal() {
  document.getElementById('dishModal').style.display = 'none';
}

// Save Dish (Add or Edit)
async function handleSaveDish(e) {
  e.preventDefault();
  const editId = document.getElementById('dishEditId').value;
  const uploadedImg = document.getElementById('dishUploadedImageUrl')?.value.trim();
  const customImg = document.getElementById('dishCustomImage')?.value.trim();
  const selectedPreset = document.querySelector('input[name="imagePreset"]:checked')?.value;
  const finalImage = uploadedImg || customImg || selectedPreset || 'images/dish_thali.jpg';

  const dishPayload = {
    name: document.getElementById('dishName').value.trim(),
    hindiName: document.getElementById('dishHindiName').value.trim(),
    categoryId: document.getElementById('dishCategory').value,
    price: Number(document.getElementById('dishPrice').value),
    originalPrice: document.getElementById('dishOrigPrice').value ? Number(document.getElementById('dishOrigPrice').value) : null,
    description: document.getElementById('dishDescription').value.trim(),
    image: finalImage,
    isVeg: document.getElementById('dishIsVeg').checked,
    isDesiGheeSpecial: document.getElementById('dishIsDesiGhee').checked,
    isVillageSpecial: document.getElementById('dishIsVillageSpecial').checked,
    isAvailable: document.getElementById('dishIsAvailable').checked,
    prepTime: Number(document.getElementById('dishPrepTime').value) || 15,
    rating: Number(document.getElementById('dishRating').value) || 4.9
  };

  try {
    if (editId) {
      // Update existing
      const res = await fetch(`${API_BASE}/api/menu/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishPayload)
      });
      if (!res.ok) throw new Error('Failed to update dish');
      const data = await res.json();

      const idx = ALL_DISHES.findIndex(d => d.id === editId);
      if (idx !== -1) ALL_DISHES[idx] = data.dish;
      showToast(`Updated "${dishPayload.name}" successfully! 🎉`);
    } else {
      // Add new
      dishPayload.id = 'dish_' + Date.now();
      dishPayload.reviewCount = 12;
      const res = await fetch(`${API_BASE}/api/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishPayload)
      });
      if (!res.ok) throw new Error('Failed to add dish');
      const data = await res.json();

      ALL_DISHES.unshift(data.dish);
      showToast(`Added "${dishPayload.name}" to menu! 🌾`);
    }

    closeDishModal();
    renderDishes();
    updateStats();
  } catch (err) {
    console.error(err);
    showToast('Failed to save dish to server', 'error');
  }
}

// --- IN-HOUSE POS TABLE MANAGEMENT ENGINE ---
function getDefaultTables() {
  return [
    { id: 'table_1', name: 'Table 1', category: 'Standard Table', capacity: 4, section: 'Main Hall', isDefault: true },
    { id: 'table_2', name: 'Table 2', category: 'Standard Table', capacity: 4, section: 'Main Hall', isDefault: true },
    { id: 'table_3', name: 'Table 3', category: 'Standard Table', capacity: 4, section: 'Main Hall', isDefault: true },
    { id: 'table_4', name: 'Table 4', category: 'Standard Table', capacity: 6, section: 'Main Hall', isDefault: true },
    { id: 'table_5', name: 'Table 5', category: 'Standard Table', capacity: 6, section: 'Main Hall', isDefault: true },
    { id: 'table_07', name: 'Table 07 (Khatiya Baithak)', category: 'Khatiya Baithak', capacity: 6, section: 'Courtyard', isDefault: true },
    { id: 'charpai_1', name: 'Charpai 1 (खाट)', category: 'Charpai', capacity: 4, section: 'Courtyard', isDefault: true },
    { id: 'charpai_2', name: 'Charpai 2 (खाट)', category: 'Charpai', capacity: 4, section: 'Courtyard', isDefault: true },
    { id: 'chowki_1', name: 'Chowki 1 (बैठक)', category: 'Chowki', capacity: 4, section: 'Heritage Corner', isDefault: true },
    { id: 'chowki_2', name: 'Chowki 2 (बैठक)', category: 'Chowki', capacity: 4, section: 'Heritage Corner', isDefault: true },
    { id: 'takeaway', name: 'Takeaway Counter', category: 'Counter', capacity: 1, section: 'Front Desk', isDefault: true }
  ];
}

async function loadTables() {
  try {
    const res = await fetch(`${API_BASE}/api/tables`);
    const data = await res.json();
    if (data.success && Array.isArray(data.tables) && data.tables.length > 0) {
      ALL_TABLES = data.tables;
    } else {
      ALL_TABLES = getDefaultTables();
    }
  } catch (err) {
    console.warn('Failed to load /api/tables, using default fallback:', err);
    if (!ALL_TABLES || ALL_TABLES.length === 0) {
      ALL_TABLES = getDefaultTables();
    }
  }
  renderTableChips();
  updateTableDropdowns();
}
window.loadTables = loadTables;

function renderTableChips() {
  const container = document.getElementById('tableSelectorChips');
  if (!container) return;

  if (!ALL_TABLES || ALL_TABLES.length === 0) {
    ALL_TABLES = getDefaultTables();
  }

  const isAdmin = isCurrentUserAdmin();
  let html = '';

  ALL_TABLES.forEach(t => {
    const isActive = (t.name.toLowerCase() === (POS_TABLE || '').toLowerCase());
    const isCustom = !t.isDefault;

    let deleteBtn = '';
    if (isAdmin && isCustom) {
      deleteBtn = `<span class="delete-table-btn" title="Delete ${t.name}" onclick="event.stopPropagation(); deleteCustomTable('${t.id}', '${t.name}')">✕</span>`;
    }

    html += `
      <button type="button" class="table-chip ${isActive ? 'active' : ''}" data-table="${t.name}">
        <span>${t.name}</span>${deleteBtn}
      </button>
    `;
  });

  // Admin account only: "➕ Add Table" chip
  if (isAdmin) {
    html += `
      <button type="button" class="table-chip add-table-chip admin-only-element" id="btnAddTableChip" title="Admin Account Only: Add new dining table or baithak">
        <span>➕</span> Add Table
      </button>
    `;
  }

  container.innerHTML = html;

  // Add click listeners to table chips
  container.querySelectorAll('.table-chip:not(.add-table-chip)').forEach(chip => {
    chip.addEventListener('click', () => {
      selectPosTable(chip.dataset.table);
    });
  });

  const addChip = document.getElementById('btnAddTableChip');
  if (addChip) {
    addChip.addEventListener('click', openAddTableModal);
  }

  renderCustomTablesManagerList();
}
window.renderTableChips = renderTableChips;

function openAddTableModal() {
  if (!isCurrentUserAdmin()) {
    showToast('Permission Denied: Table creation is restricted to Admin accounts only!', 'error');
    return;
  }
  const modal = document.getElementById('addTableModal');
  if (modal) {
    modal.style.display = 'flex';
    const input = document.getElementById('newTableNameInput');
    if (input) {
      input.value = '';
      input.focus();
    }
    renderCustomTablesManagerList();
  }
}
window.openAddTableModal = openAddTableModal;

function closeAddTableModal() {
  const modal = document.getElementById('addTableModal');
  if (modal) modal.style.display = 'none';
}
window.closeAddTableModal = closeAddTableModal;

async function handleAddTableSubmit(e) {
  if (e) e.preventDefault();

  if (!isCurrentUserAdmin()) {
    showToast('Permission Denied: Only Admin accounts can add new tables!', 'error');
    return;
  }

  const nameInput = document.getElementById('newTableNameInput');
  const catSelect = document.getElementById('newTableCategorySelect');
  const capInput = document.getElementById('newTableCapacityInput');
  const secSelect = document.getElementById('newTableSectionSelect');

  const tableName = (nameInput ? nameInput.value : '').trim();
  if (!tableName) {
    showToast('Please enter a valid table / baithak name', 'warning');
    return;
  }

  if (ALL_TABLES.some(t => t.name.toLowerCase() === tableName.toLowerCase())) {
    showToast(`Table "${tableName}" already exists!`, 'warning');
    return;
  }

  const submitBtn = document.getElementById('submitAddTableBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳ Adding...</span>';
  }

  try {
    const res = await fetch(`${API_BASE}/api/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: tableName,
        category: catSelect ? catSelect.value : 'Standard Table',
        capacity: capInput ? Number(capInput.value) : 4,
        section: secSelect ? secSelect.value : 'Main Dining Hall',
        createdBy: sessionStorage.getItem('mgkr_admin_user') || 'admin'
      })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`🎉 Table "${tableName}" successfully added!`, 'success');
      closeAddTableModal();
      await loadTables();
      selectPosTable(tableName);
    } else {
      showToast(data.error || 'Failed to add table', 'error');
    }
  } catch (err) {
    console.error('Error adding table:', err);
    showToast('Server error while adding table', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>➕ Add Table to POS</span>';
    }
  }
}
window.handleAddTableSubmit = handleAddTableSubmit;

async function deleteCustomTable(tableId, tableName) {
  if (!isCurrentUserAdmin()) {
    showToast('Permission Denied: Only Admin accounts can delete tables!', 'error');
    return;
  }

  if (!confirm(`Are you sure you want to remove "${tableName}" from In-House POS?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/tables/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: tableId,
        name: tableName,
        deletedBy: sessionStorage.getItem('mgkr_admin_user') || 'admin'
      })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Table "${tableName}" removed successfully`, 'info');
      if (POS_TABLE === tableName) {
        POS_TABLE = 'Table 1';
      }
      await loadTables();
    } else {
      showToast(data.error || 'Failed to delete table', 'error');
    }
  } catch (err) {
    console.error('Error deleting table:', err);
    showToast('Server error while deleting table', 'error');
  }
}
window.deleteCustomTable = deleteCustomTable;

function renderCustomTablesManagerList() {
  const sec = document.getElementById('existingCustomTablesSection');
  const list = document.getElementById('customTablesList');
  if (!sec || !list) return;

  const customTables = (ALL_TABLES || []).filter(t => !t.isDefault);
  if (customTables.length === 0) {
    sec.style.display = 'none';
    return;
  }

  sec.style.display = 'block';
  list.innerHTML = customTables.map(t => `
    <div style="display: flex; justify-content: space-between; align-items: center; background: #FFF; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-clay); font-size: 0.8rem;">
      <div>
        <strong>${t.name}</strong>
        <span style="color: var(--text-muted); font-size: 0.72rem; margin-left: 6px;">(${t.category} • ${t.capacity} Guests)</span>
      </div>
      <button type="button" class="btn btn-secondary btn-sm" style="color: #D32F2F; border-color: #FFCDD2; padding: 2px 8px; font-size: 0.72rem;" onclick="deleteCustomTable('${t.id}', '${t.name}')">
        🗑️ Delete
      </button>
    </div>
  `).join('');
}
window.renderCustomTablesManagerList = renderCustomTablesManagerList;

function updateTableDropdowns() {
  const billsSelect = document.getElementById('billsFilterTable');
  if (billsSelect) {
    const curVal = billsSelect.value;
    let html = `<option value="all">All Tables (सभी टेबल)</option>`;
    (ALL_TABLES || []).forEach(t => {
      html += `<option value="${t.name}">${t.name}</option>`;
    });
    billsSelect.innerHTML = html;
    if (curVal) billsSelect.value = curVal;
  }

  const modalBillsSelect = document.getElementById('modalFilterTableSelect');
  if (modalBillsSelect) {
    const curVal = modalBillsSelect.value;
    let html = `<option value="all">All Tables</option>`;
    (ALL_TABLES || []).forEach(t => {
      html += `<option value="${t.name}">${t.name}</option>`;
    });
    modalBillsSelect.innerHTML = html;
    if (curVal) modalBillsSelect.value = curVal;
  }
}
window.updateTableDropdowns = updateTableDropdowns;

function selectPosTable(tableName) {
  if (!tableName) return;
  const chip = Array.from(document.querySelectorAll('.table-chip:not(.add-table-chip)')).find(c => {
    const t = (c.dataset.table || '').toLowerCase().trim();
    const target = tableName.toLowerCase().trim();
    return t === target || target.startsWith(t) || t.startsWith(target) || target.includes(t);
  });
  if (chip) {
    document.querySelectorAll('.table-chip:not(.add-table-chip)').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    POS_TABLE = chip.dataset.table;
  } else {
    POS_TABLE = tableName;
  }
  const label = document.getElementById('currentSelectedTableLabel');
  if (label) label.textContent = `${POS_TABLE} (Dine-In)`;
  const title = document.getElementById('ticketTableTitle');
  if (title) title.textContent = POS_TABLE;
  if (typeof checkActiveTableOrders === 'function') {
    checkActiveTableOrders(POS_TABLE);
  }
}
window.selectPosTable = selectPosTable;

// --- 2. IN-HOUSE STAFF POS SYSTEM ---
function initPosSystem() {
  // Load and render dynamic tables
  loadTables();

  // Admin Add Table Modal event listeners
  const btnOpenAddTable = document.getElementById('btnOpenAddTableModal');
  if (btnOpenAddTable) {
    btnOpenAddTable.addEventListener('click', openAddTableModal);
  }
  const btnCloseAddTable = document.getElementById('closeAddTableModalBtn');
  if (btnCloseAddTable) {
    btnCloseAddTable.addEventListener('click', closeAddTableModal);
  }
  const btnCancelAddTable = document.getElementById('cancelAddTableBtn');
  if (btnCancelAddTable) {
    btnCancelAddTable.addEventListener('click', closeAddTableModal);
  }
  const addTableForm = document.getElementById('addTableForm');
  if (addTableForm) {
    addTableForm.addEventListener('submit', handleAddTableSubmit);
  }

  // Search input
  const searchInput = document.getElementById('posDishSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      POS_SEARCH = e.target.value.trim().toLowerCase();
      renderPosDishes();
    });
  }

  // Category pills
  document.querySelectorAll('.pos-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pos-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      POS_CATEGORY = btn.dataset.cat;
      renderPosDishes();
    });
  });

  // Clear ticket button
  const clearBtn = document.getElementById('clearPosTicketBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (POS_CART.length === 0) return;
      if (confirm(`Clear active ticket for ${POS_TABLE}?`)) {
        POS_CART = [];
        ACTIVE_BILL_ORDER_IDS = [];
        if (document.getElementById('posChefNotes')) document.getElementById('posChefNotes').value = '';
        if (document.getElementById('posCustomerName')) document.getElementById('posCustomerName').value = '';
        if (document.getElementById('posCustomerPhone')) document.getElementById('posCustomerPhone').value = '';
        renderPosTicket();
        showToast('Table ticket cleared', 'info');
      }
    });
  }

  // Punch KOT button
  const punchBtn = document.getElementById('punchKotBtn');
  if (punchBtn) {
    punchBtn.addEventListener('click', handlePunchKot);
  }

  // Active banner action: Load to Bill
  const loadActiveOrderBtn = document.getElementById('btnLoadActiveOrder');
  if (loadActiveOrderBtn) {
    loadActiveOrderBtn.addEventListener('click', () => {
      if (!DETECTED_TABLE_ORDER) return;
      loadOrderIntoPosCart(DETECTED_TABLE_ORDER);
    });
  }

  // Active banner action: Quick Direct Settle
  const directSettleBtn = document.getElementById('btnDirectSettleOrder');
  if (directSettleBtn) {
    directSettleBtn.addEventListener('click', () => {
      if (!DETECTED_TABLE_ORDER) return;
      loadOrderIntoPosCart(DETECTED_TABLE_ORDER);
      openBillingModal();
    });
  }

  // Open Billing Modal button
  const openBillBtn = document.getElementById('openBillingModalBtn');
  if (openBillBtn) {
    openBillBtn.addEventListener('click', () => {
      if (POS_CART.length === 0) {
        if (DETECTED_TABLE_ORDER) {
          loadOrderIntoPosCart(DETECTED_TABLE_ORDER);
          openBillingModal();
          return;
        }
        showToast('Ticket is empty! Add dishes or select a table with active order to settle bill.', 'error');
        return;
      }
      openBillingModal();
    });
  }

  // Open Saved Table Bills Modal button
  const openTableBillsBtn = document.getElementById('openTableBillsBtn');
  if (openTableBillsBtn) {
    openTableBillsBtn.addEventListener('click', openTableBillsModal);
  }

  // Floating Cart Bar Push KOT action
  const btnFloat = document.getElementById('btnPosFloatAction');
  if (btnFloat) {
    btnFloat.addEventListener('click', (e) => {
      e.preventDefault();
      handlePunchKot();
    });
  }

  // Floating Cart Bar click info to scroll to ticket
  const floatInfo = document.getElementById('posFloatInfo');
  if (floatInfo) {
    floatInfo.addEventListener('click', () => {
      const ticketEl = document.getElementById('posTicketCol');
      if (ticketEl) ticketEl.scrollIntoView({ behavior: 'smooth' });
    });
  }

  renderPosDishes();
  renderPosTicket();
  checkActiveTableOrders(POS_TABLE);
}

function renderPosDishes() {
  const container = document.getElementById('posDishesContainer');
  if (!container) return;

  let filtered = ALL_DISHES;
  if (POS_CATEGORY !== 'all') {
    filtered = filtered.filter(d => d.categoryId === POS_CATEGORY);
  }
  if (POS_SEARCH) {
    filtered = filtered.filter(d =>
      (d.name && d.name.toLowerCase().includes(POS_SEARCH)) ||
      (d.hindiName && d.hindiName.toLowerCase().includes(POS_SEARCH))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--text-secondary); background: var(--surface-warm); border-radius: 12px;">
        <span>🔍</span> No dishes match "${POS_SEARCH}"
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(dish => `
    <div class="pos-dish-card" onclick="addToPosCart('${dish.id}')">
      <div class="pos-dish-img-wrap">
        <img src="${dish.image || 'images/dish_thali.jpg'}" alt="${dish.name}" onerror="this.src='images/dish_thali.jpg'">
      </div>
      <div class="pos-dish-body">
        <h4 class="pos-dish-name">${dish.name}</h4>
        <span class="pos-dish-hindi">${dish.hindiName || ''}</span>
        <div class="pos-dish-footer">
          <span class="pos-dish-price">₹${dish.price}</span>
          <button type="button" class="btn-add-pos">+ Add</button>
        </div>
      </div>
    </div>
  `).join('');
}

function addToPosCart(dishId) {
  const dish = ALL_DISHES.find(d => d.id === dishId);
  if (!dish) return;

  const existing = POS_CART.find(item => item.id === dishId);
  if (existing) {
    existing.qty += 1;
  } else {
    POS_CART.push({
      id: dish.id,
      name: dish.name,
      hindiName: dish.hindiName,
      price: dish.price,
      qty: 1
    });
  }

  renderPosTicket();
  playKitchenBell();
}

function updatePosCartQty(dishId, delta) {
  const item = POS_CART.find(i => i.id === dishId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    POS_CART = POS_CART.filter(i => i.id !== dishId);
  }
  renderPosTicket();
}

function renderPosTicket() {
  const container = document.getElementById('ticketItemsList');
  if (!container) return;

  const staffNameEl = document.getElementById('ticketStaffName');
  if (staffNameEl) {
    staffNameEl.textContent = sessionStorage.getItem('mgkr_user_name') || 'Floor Staff';
  }

  if (POS_CART.length === 0) {
    container.innerHTML = `
      <div class="empty-ticket-state">
        <span style="font-size: 2.2rem;">🍽️</span>
        <h4>Ticket is Empty</h4>
        <p>Click any dish on the left to add it to ${POS_TABLE}</p>
      </div>
    `;
    const sub = document.getElementById('posSubtotal');
    if (sub) sub.textContent = '₹0';
    const gstEl = document.getElementById('posGst');
    if (gstEl) gstEl.textContent = '₹0';
    const totalEl = document.getElementById('posGrandTotal');
    if (totalEl) totalEl.textContent = '₹0';
    const posGstLabel = document.getElementById('posGstLabel');
    if (posGstLabel) {
      const rate = getEffectiveGstRate();
      posGstLabel.textContent = rate === 0 ? 'GST (0% - No GST):' : `GST (${rate}%):`;
    }
    return;
  }

  let subtotal = 0;
  container.innerHTML = POS_CART.map(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    return `
      <div class="pos-ticket-item-row">
        <div>
          <div class="ticket-item-name">${item.name}</div>
          <small style="color: var(--terracotta); font-weight:600;">${item.hindiName || ''}</small>
        </div>
        <div class="ticket-item-qty-controls">
          <button type="button" class="btn-qty" onclick="event.stopPropagation(); updatePosCartQty('${item.id}', -1)">-</button>
          <strong>${item.qty}</strong>
          <button type="button" class="btn-qty" onclick="event.stopPropagation(); updatePosCartQty('${item.id}', 1)">+</button>
          <span class="ticket-item-price">₹${itemTotal}</span>
          <button type="button" class="btn-remove-item" onclick="event.stopPropagation(); updatePosCartQty('${item.id}', -999)">✕</button>
        </div>
      </div>
    `;
  }).join('');

  const effectiveGstRate = getEffectiveGstRate();
  const gst = Math.round(subtotal * (effectiveGstRate / 100));
  const grandTotal = subtotal + gst;

  const posGstLabel = document.getElementById('posGstLabel');
  if (posGstLabel) {
    posGstLabel.textContent = effectiveGstRate === 0 ? 'GST (0% - No GST):' : `GST (${effectiveGstRate}%):`;
  }

  const sub = document.getElementById('posSubtotal');
  if (sub) sub.textContent = `₹${subtotal}`;
  const gstEl = document.getElementById('posGst');
  if (gstEl) gstEl.textContent = `₹${gst}`;
  const totalEl = document.getElementById('posGrandTotal');
  if (totalEl) totalEl.textContent = `₹${grandTotal}`;

  // Update Mobile Floating Cart Bar
  const floatBar = document.getElementById('posMobileFloatBar');
  const floatCount = document.getElementById('posFloatCount');
  const floatTotal = document.getElementById('posFloatTotal');
  if (floatBar) {
    if (POS_CART.length === 0) {
      floatBar.style.display = 'none';
    } else {
      floatBar.style.display = 'flex';
      const totalItems = POS_CART.reduce((sum, i) => sum + (i.qty || 1), 0);
      if (floatCount) floatCount.textContent = `${totalItems} ${totalItems === 1 ? 'Dish' : 'Dishes'}`;
      if (floatTotal) floatTotal.textContent = `₹${grandTotal}`;
    }
  }
}

async function handlePunchKot() {
  if (POS_CART.length === 0) {
    showToast('Cannot punch empty KOT! Please add dishes first.', 'error');
    return;
  }

  const staff = sessionStorage.getItem('mgkr_user_name') || 'Staff 1 - Floor Captain';
  const staffUser = (sessionStorage.getItem('mgkr_admin_user') || 'staff1').trim().toLowerCase();
  const chefNotes = document.getElementById('posChefNotes') ? document.getElementById('posChefNotes').value.trim() : '';

  const rawCustName = (document.getElementById('posCustomerName') ? document.getElementById('posCustomerName').value : '').trim();
  const rawCustPhone = (document.getElementById('posCustomerPhone') ? document.getElementById('posCustomerPhone').value : '').trim();
  const customerName = rawCustName || `Guest (${POS_TABLE})`;
  const customerPhone = rawCustPhone || 'In-House';

  let subtotal = 0;
  POS_CART.forEach(i => subtotal += i.price * i.qty);
  const effectiveGstRate = getEffectiveGstRate();
  const gst = Math.round(subtotal * (effectiveGstRate / 100));
  const grandTotal = subtotal + gst;

  const kotId = 'KOT-' + Math.floor(1000 + Math.random() * 9000);

  const orderPayload = {
    id: kotId,
    name: customerName,
    customerName: customerName,
    phone: customerPhone,
    customerPhone: customerPhone,
    orderType: 'dine_in',
    address: POS_TABLE,
    table: POS_TABLE,
    staff: staff,
    staffUser: staffUser,
    receivedBy: staffUser,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    items: POS_CART.map(i => ({
      id: i.id,
      name: i.name,
      hindiName: i.hindiName,
      price: i.price,
      quantity: i.qty
    })),
    notes: chefNotes || 'Standard Gaam Style',
    total: grandTotal,
    status: 'CHULHA_PREP',
    stageIndex: 2
  };

  const punchBtn = document.getElementById('punchKotBtn');
  const floatBtn = document.getElementById('btnPosFloatAction');
  if (punchBtn) {
    punchBtn.disabled = true;
    punchBtn.innerHTML = `<span>⏳ Pushing KOT...</span>`;
  }
  if (floatBtn) {
    floatBtn.disabled = true;
    floatBtn.innerHTML = `<span>⏳ Pushing KOT...</span>`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    if (!res.ok) throw new Error('Failed to record KOT');
    const data = await res.json();

    // Reset ticket & customer fields
    POS_CART = [];
    if (document.getElementById('posChefNotes')) document.getElementById('posChefNotes').value = '';
    if (document.getElementById('posCustomerName')) document.getElementById('posCustomerName').value = '';
    if (document.getElementById('posCustomerPhone')) document.getElementById('posCustomerPhone').value = '';
    renderPosTicket();

    // Audio & Toast
    playKitchenBell();
    showToast(`🎉 Order #${kotId} for ${customerName} (${POS_TABLE}) pushed to Kitchen!`, 'info');

    // Reload orders for KDS
    loadOrders();
  } catch (err) {
    console.error('Error punching KOT:', err);
    showToast('Failed to push KOT to kitchen.', 'error');
  } finally {
    if (punchBtn) {
      punchBtn.disabled = false;
      punchBtn.innerHTML = `<span>🔥 Push KOT</span> <span>→</span>`;
    }
    if (floatBtn) {
      floatBtn.disabled = false;
      floatBtn.innerHTML = `<span>🔥 Push KOT</span> <span>➔</span>`;
    }
  }
}

// Helper: HTML entity escaping
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Helper: Calculate elapsed time string
function formatElapsedSince(timestampStr) {
  if (!timestampStr) return '';
  const now = new Date();
  let orderDate = null;

  if (timestampStr.includes('T') || timestampStr.includes('-')) {
    orderDate = new Date(timestampStr);
  } else {
    const match = timestampStr.match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[4] ? match[4].toUpperCase() : null;
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      orderDate = new Date();
      orderDate.setHours(hours, minutes, 0, 0);
      if (orderDate > now) {
        orderDate.setDate(orderDate.getDate() - 1);
      }
    }
  }

  if (!orderDate || isNaN(orderDate.getTime())) return '';
  const diffMinutes = Math.max(0, Math.floor((now - orderDate) / 60000));
  if (diffMinutes === 0) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const hrs = Math.floor(diffMinutes / 60);
  const remMins = diffMinutes % 60;
  return `${hrs}h ${remMins}m ago`;
}

// KDS View Mode: 'orders' (Full cards with Customer Name - Default) vs 'dishes' (Consolidated Dish Prep)
let KDS_VIEW_MODE = localStorage.getItem('mgkr_kds_view_mode') || 'orders';

function setKdsViewMode(mode) {
  KDS_VIEW_MODE = mode;
  try {
    localStorage.setItem('mgkr_kds_view_mode', mode);
  } catch (e) {}

  const ordersBtn = document.getElementById('kdsModeOrdersBtn');
  const dishesBtn = document.getElementById('kdsModeDishesBtn');
  if (ordersBtn) ordersBtn.classList.toggle('active', mode === 'orders');
  if (dishesBtn) dishesBtn.classList.toggle('active', mode === 'dishes');

  renderOrders();
}
window.setKdsViewMode = setKdsViewMode;

// --- 3. KITCHEN KDS DISPLAY & LIVE ORDERS ---
function initKdsSystem() {
  // Live Kitchen Clock
  setInterval(() => {
    const clockEl = document.getElementById('kdsClockDisplay');
    if (clockEl) {
      clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }, 1000);

  // Sound alert toggle
  const soundBtn = document.getElementById('toggleKdsSoundBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      KDS_SOUND_ENABLED = !KDS_SOUND_ENABLED;
      const statusEl = document.getElementById('kdsSoundStatus');
      if (statusEl) statusEl.textContent = KDS_SOUND_ENABLED ? 'ON' : 'OFF';
      const iconEl = document.getElementById('kdsSoundIcon');
      if (iconEl) iconEl.textContent = KDS_SOUND_ENABLED ? '🔔' : '🔕';
      showToast(`Kitchen audio alerts ${KDS_SOUND_ENABLED ? 'enabled' : 'disabled'}`);
      if (KDS_SOUND_ENABLED) playKitchenBell();
    });
  }

  // Filter chips
  document.querySelectorAll('.kds-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.kds-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      KDS_FILTER = chip.dataset.filter;
      renderOrders();
    });
  });

  // Auto-poll orders every 4.5 seconds so staff punches immediately show in kitchen
  setInterval(() => {
    const ordersTab = document.getElementById('ordersTab');
    const isOrdersActive = ordersTab && ordersTab.classList.contains('active');
    const userRole = (sessionStorage.getItem('mgkr_user_role') || '').toLowerCase();
    if (isOrdersActive || userRole === 'kitchen' || userRole === 'chef' || userRole === 'admin') {
      loadOrders();
    }
  }, 4500);

  // Refresh KOTs button
  const refreshBtn = document.getElementById('refreshOrdersBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadOrders();
      showToast('KOTs refreshed from Kitchen!', 'info');
    });
  }
}

async function loadOrders() {
  try {
    const res = await fetch(`${API_BASE}/api/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    ALL_ORDERS = await res.json();
    renderOrders();
    updateStats();
    checkActiveTableOrders(POS_TABLE);
    renderDeliveryPortal();
  } catch (err) {
    console.error('Error loading orders:', err);
  }
}

let KDS_DISH_STATES = {};
try {
  KDS_DISH_STATES = JSON.parse(localStorage.getItem('mgkr_kds_dish_states') || '{}');
} catch (e) {
  KDS_DISH_STATES = {};
}
window.KDS_DISH_STATES = KDS_DISH_STATES;

function renderOrders() {
  const container = document.getElementById('ordersGridContainer');
  if (!container) return;

  // Live active orders are those not delivered/closed (< stage 5)
  const liveOrders = ALL_ORDERS.filter(o => (o.stageIndex || 1) < 5);

  const countBadge = document.getElementById('ordersCountBadge');
  if (countBadge) countBadge.textContent = liveOrders.length;

  // Update KDS count pills
  const dineInCount = liveOrders.filter(o => o.orderType === 'dine_in').length;
  const deliveryCount = liveOrders.filter(o => o.orderType !== 'dine_in').length;
  const cookingCount = liveOrders.filter(o => (o.stageIndex || 1) >= 2 && (o.stageIndex || 1) <= 3).length;

  const cAll = document.getElementById('kdsCountAll');
  if (cAll) cAll.textContent = liveOrders.length;
  const cDine = document.getElementById('kdsCountDineIn');
  if (cDine) cDine.textContent = dineInCount;
  const cDeliv = document.getElementById('kdsCountDelivery');
  if (cDeliv) cDeliv.textContent = deliveryCount;
  const cCook = document.getElementById('kdsCountCooking');
  if (cCook) cCook.textContent = cookingCount;

  // Update mode toggle active button
  const ordersBtn = document.getElementById('kdsModeOrdersBtn');
  const dishesBtn = document.getElementById('kdsModeDishesBtn');
  if (ordersBtn) ordersBtn.classList.toggle('active', KDS_VIEW_MODE === 'orders');
  if (dishesBtn) dishesBtn.classList.toggle('active', KDS_VIEW_MODE === 'dishes');

  let filtered = liveOrders;
  if (KDS_FILTER === 'dine_in') {
    filtered = filtered.filter(o => o.orderType === 'dine_in');
  } else if (KDS_FILTER === 'delivery') {
    filtered = filtered.filter(o => o.orderType !== 'dine_in');
  } else if (KDS_FILTER === 'cooking') {
    filtered = filtered.filter(o => (o.stageIndex || 1) >= 2 && (o.stageIndex || 1) <= 3);
  }

  if (filtered.length === 0) {
    container.className = 'kds-orders-container';
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; background: var(--surface-warm); border-radius: 16px; width: 100%;">
        <span style="font-size: 2.5rem;">🔥</span>
        <h4 style="margin: 10px 0 4px; font-family: var(--font-serif); font-size: 1.15rem; color: var(--text-dark);">No Active Orders in this View</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">Orders punched from Staff POS or Customer Mobile App will appear here live with full customer details!</p>
      </div>
    `;
    return;
  }

  // Check view mode: Orders vs Dishes
  if (KDS_VIEW_MODE === 'dishes') {
    renderDishesSummaryView(filtered, container);
    return;
  }

  // PRIMARY VIEW: DETAILED ORDER CARDS WITH CUSTOMER NAME AND ALL DETAILS
  container.className = 'kds-orders-cards-container';
  container.innerHTML = filtered.map(order => {
    const isDineIn = order.orderType === 'dine_in';
    const stage = order.stageIndex || 1;
    const isPreparing = stage >= 2 && stage <= 3;
    const isConfirmed = stage === 4;

    // Customer Name extraction
    let custName = (order.customerName || order.name || '').trim();
    if (!custName || custName.startsWith('Dine-In')) {
      custName = `Guest (${order.table || order.address || 'Table'})`;
    }

    const custPhone = (order.customerPhone || (order.phone !== 'In-House Guest' && order.phone !== 'In-House' ? order.phone : '') || '').trim();
    const tableStr = order.table || order.address || (isDineIn ? 'Table 1' : 'Delivery');
    const staffStr = order.staff || order.staffUser || 'Floor Captain';
    const elapsedStr = formatElapsedSince(order.timestamp);

    let stageBadge = '';
    if (stage === 1) {
      stageBadge = `<span class="kds-status-badge badge-new" style="background:#FFF3E0;color:#E65100;font-weight:800;padding:4px 8px;border-radius:6px;font-size:0.75rem;">⏳ New Order Placed</span>`;
    } else if (isPreparing) {
      stageBadge = `<span class="kds-status-badge badge-prep" style="background:#FBE9E7;color:#D84315;font-weight:800;padding:4px 8px;border-radius:6px;font-size:0.75rem;">🔥 Cooking on Chulha</span>`;
    } else if (isConfirmed) {
      stageBadge = `<span class="kds-status-badge badge-ready" style="background:#E8F5E9;color:#2E7D32;font-weight:800;padding:4px 8px;border-radius:6px;font-size:0.75rem;">🛎️ Cooked & Ready</span>`;
    } else {
      stageBadge = `<span class="kds-status-badge badge-out" style="background:#E1F5FE;color:#0277BD;font-weight:800;padding:4px 8px;border-radius:6px;font-size:0.75rem;">🛵 In Dispatch</span>`;
    }

    const itemsHtml = (order.items || []).map(item => {
      const iName = item.name || item.item?.name || 'Village Dish';
      const iHindi = item.hindiName || item.item?.hindiName || '';
      const iQty = item.quantity || item.qty || 1;
      const iPrice = item.price || item.item?.price || 0;
      return `
        <div class="kds-item-card-row">
          <div class="kds-item-main-info">
            <span class="kds-item-qty-tag">x${iQty}</span>
            <div class="kds-item-names">
              <strong class="kds-item-english">${escapeHtml(iName)}</strong>
              ${iHindi ? `<span class="kds-item-hindi">${escapeHtml(iHindi)}</span>` : ''}
            </div>
          </div>
          ${iPrice ? `<span class="kds-item-price-tag">₹${iPrice * iQty}</span>` : ''}
        </div>
      `;
    }).join('');

    const totalQty = (order.items || []).reduce((sum, i) => sum + (i.quantity || i.qty || 1), 0);

    return `
      <div class="kds-kot-card ${isConfirmed ? 'is-kot-ready' : (isPreparing ? 'is-kot-cooking' : 'is-kot-new')}">
        <!-- Top Ribbon: KOT ID, Table Badge, Time -->
        <div class="kds-kot-header">
          <div class="kds-kot-header-left">
            <span class="kds-kot-id-badge">#${order.id}</span>
            <span class="kds-kot-table-tag ${isDineIn ? 'tag-dinein' : 'tag-delivery'}">
              ${isDineIn ? '📍 ' + escapeHtml(tableStr) : '🛵 Delivery'}
            </span>
          </div>
          <div class="kds-kot-header-right">
            <span class="kds-kot-timestamp">⏰ ${order.timestamp || '--:--'}</span>
            ${elapsedStr ? `<span class="kds-kot-elapsed">${elapsedStr}</span>` : ''}
          </div>
        </div>

        <!-- HIGH PROMINENCE CUSTOMER BANNER -->
        <div class="kds-customer-banner">
          <div class="kds-cust-details-box">
            <span class="kds-cust-avatar">👤</span>
            <div>
              <div class="kds-cust-micro-label">CUSTOMER NAME / अतिथि का नाम:</div>
              <div class="kds-cust-highlight-name">${escapeHtml(custName)}</div>
            </div>
          </div>
          ${custPhone ? `
            <a href="tel:${escapeHtml(custPhone)}" class="kds-cust-phone-pill" title="Customer Contact">
              <span>📞</span> <span>${escapeHtml(custPhone)}</span>
            </a>
          ` : ''}
        </div>

        <!-- Server Staff & Items Count Metadata -->
        <div class="kds-kot-meta-row">
          <span class="kds-kot-staff">👨‍🍳 <strong>Server:</strong> ${escapeHtml(staffStr)}</span>
          <span class="kds-kot-count">📦 <strong>${totalQty} Dishes</strong></span>
          <span class="kds-kot-total">₹${order.total || 0}</span>
        </div>

        <!-- Payment Verification Banner (Prepaid UPI / COD) -->
        <div class="kds-payment-badge-row" style="margin: 6px 0 8px; font-size: 0.78rem;">
          ${order.paymentMode === 'UPI' || (order.paymentStatus === 'PAID' && order.upiUtr) ? `
            <div style="background: #E8F5E9; border: 1px solid #A5D6A7; border-radius: 8px; padding: 5px 10px; display: flex; align-items: center; justify-content: space-between; color: #1B5E20;">
              <span>✅ <strong>PAID VIA UPI</strong> • UTR: <strong style="font-family: monospace; background: #fff; padding: 2px 6px; border-radius: 4px; border: 1px solid #C8E6C9; letter-spacing: 0.5px;">${escapeHtml(order.upiUtr || 'VERIFIED')}</strong></span>
              <span style="font-weight: 800; font-size: 0.82rem;">₹${order.total || 0} PAID</span>
            </div>
          ` : (order.paymentMode === 'CASH' || order.paymentMethod === 'COD' ? `
            <div style="background: #FFF8E1; border: 1px solid #FFE082; border-radius: 8px; padding: 5px 10px; display: flex; align-items: center; justify-content: space-between; color: #E65100;">
              <span>💵 <strong>CASH ON DELIVERY (COD)</strong></span>
              <span style="font-weight: 800; font-size: 0.82rem;">COLLECT ₹${order.total || 0}</span>
            </div>
          ` : `
            <div style="background: #F3E5F5; border: 1px solid #CE93D8; border-radius: 8px; padding: 5px 10px; display: flex; align-items: center; justify-content: space-between; color: #4A148C;">
              <span>💳 <strong>CARD PAYMENT (ONLINE)</strong></span>
              <span style="font-weight: 800; font-size: 0.82rem;">₹${order.total || 0} PAID</span>
            </div>
          `)}
        </div>

        <!-- Special Cooking Instructions / Chef Notes -->
        ${order.notes && order.notes !== 'Standard Gaam Style' ? `
          <div class="kds-kot-chef-notes">
            <span class="notes-icon">📝</span>
            <div>
              <strong>Chef Instructions (रसोई निर्देश):</strong>
              <p>${escapeHtml(order.notes)}</p>
            </div>
          </div>
        ` : ''}

        <!-- Ordered Dishes List -->
        <div class="kds-kot-items-list">
          ${itemsHtml}
        </div>

        <!-- Footer: Status & Action Buttons -->
        <div class="kds-kot-footer">
          <div class="kds-kot-status-display">
            ${stageBadge}
          </div>
          <div class="kds-kot-action-buttons">
            <button type="button" class="btn-kot-action btn-kot-prep ${isPreparing ? 'active' : ''}"
              onclick="setOrderStatusFromKds('${order.id}', 2, 'CHULHA_PREP')">
              ${isPreparing ? '🔥 Preparing' : '🔥 Start Prep'}
            </button>
            <button type="button" class="btn-kot-action btn-kot-ready ${isConfirmed ? 'active' : ''}"
              onclick="setOrderStatusFromKds('${order.id}', 4, 'CONFIRMED')">
              ${isConfirmed ? '✓ Food Ready' : '🛎️ Food Ready'}
            </button>
            <button type="button" class="btn-kot-action btn-kot-print"
              onclick="printKotTicket('${order.id}')" title="Print Kitchen Slip">
              🖨️ Slip
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Secondary View: Aggregated Dish Quantities for Bulk Prep
function renderDishesSummaryView(filtered, container) {
  container.className = 'kds-orders-rows-container';

  const dishMap = new Map();
  filtered.forEach(order => {
    let custName = (order.customerName || order.name || '').trim();
    if (!custName || custName.startsWith('Dine-In')) {
      custName = `Guest (${order.table || 'Table'})`;
    }
    const tableStr = order.table || order.address || 'Table';

    (order.items || []).forEach(item => {
      const rawName = (item.name || item.item?.name || 'Village Dish').trim();
      const hindiName = (item.hindiName || item.item?.hindiName || '').trim();
      const qty = Number(item.quantity || item.qty || 1);
      const key = rawName.toLowerCase();

      if (dishMap.has(key)) {
        const existing = dishMap.get(key);
        existing.totalQuantity += qty;
        if (!existing.orderIds.includes(order.id)) {
          existing.orderIds.push(order.id);
        }
        if (!existing.customers.some(c => c.orderId === order.id)) {
          existing.customers.push({ orderId: order.id, customerName: custName, table: tableStr, qty: qty });
        }
        if (!existing.hindiName && hindiName) {
          existing.hindiName = hindiName;
        }
      } else {
        dishMap.set(key, {
          key: key,
          name: rawName,
          hindiName: hindiName,
          totalQuantity: qty,
          orderIds: [order.id],
          customers: [{ orderId: order.id, customerName: custName, table: tableStr, qty: qty }]
        });
      }
    });
  });

  const aggregatedDishes = Array.from(dishMap.values());
  window.CURRENT_AGGREGATED_DISHES = aggregatedDishes;

  if (aggregatedDishes.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; background: var(--surface-warm); border-radius: 16px; width: 100%;">
        <span style="font-size: 2.5rem;">🔥</span>
        <h4 style="margin: 10px 0 4px; font-family: var(--font-serif);">No Active Dishes in this View</h4>
        <p style="font-size: 0.8rem; color: var(--text-secondary);">Dishes from live incoming orders will appear here automatically!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = aggregatedDishes.map((dish, idx) => {
    const savedStatus = (window.KDS_DISH_STATES || {})[dish.key];
    const isConfirmed = savedStatus === 'confirmed';
    const isPreparing = !isConfirmed;

    const customersBreakdown = dish.customers.map(c =>
      `<span class="kds-dish-cust-badge">👤 ${escapeHtml(c.customerName)} (${escapeHtml(c.table)} x${c.qty})</span>`
    ).join(' ');

    return `
      <div class="kds-order-row ${isConfirmed ? 'is-confirmed-dish' : 'is-preparing-dish'}">
        <div class="kds-clean-item-row" style="flex:1;">
          <div class="kds-clean-item-text">
            <span class="kds-clean-dish-name">${escapeHtml(dish.name)}${dish.hindiName ? ` <span class="kds-clean-hindi">(${escapeHtml(dish.hindiName)})</span>` : ''}</span>
            ${dish.totalQuantity > 1 ? ` <span class="kds-clean-qty-multiplier">x${dish.totalQuantity}</span>` : ''}
            <div class="kds-dish-customers-line" style="margin-top: 6px;">
              <small style="color: var(--text-secondary); font-weight: 700;">Guests Waiting: </small>
              ${customersBreakdown}
            </div>
          </div>
        </div>
        <div class="kds-row-actions">
          <button type="button" class="btn-kds-action btn-kds-confirm ${isConfirmed ? 'active' : ''}" onclick="setDishCookingStatus(${idx}, 'confirmed')">${isConfirmed ? '✓ Confirmed' : 'Confirm'}</button>
          <button type="button" class="btn-kds-action btn-kds-preparing ${isPreparing ? 'active' : ''}" onclick="setDishCookingStatus(${idx}, 'preparing')">${isPreparing ? '🔥 Preparing' : 'Preparing'}</button>
        </div>
      </div>
    `;
  }).join('');
}

// Update single order stage from KDS Card
async function setOrderStatusFromKds(orderId, stageIndex, status) {
  const order = ALL_ORDERS.find(o => o.id === orderId);
  if (!order) return;

  try {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stageIndex: stageIndex,
        status: status
      })
    });

    if (!res.ok) throw new Error('Failed to update status');

    order.stageIndex = stageIndex;
    order.status = status;

    playKitchenBell();

    let custName = (order.customerName || order.name || '').trim();
    if (!custName || custName.startsWith('Dine-In')) {
      custName = `Guest (${order.table || 'Table'})`;
    }
    const tableStr = order.table || order.address || 'Table';

    if (stageIndex === 4 || status === 'CONFIRMED') {
      const target = getRespectiveStaffAssignment(order);
      const isDeliv = order.orderType === 'delivery';
      const notifTitle = isDeliv ? '🛵 Your Order is Ready for Delivery!' : '🛎️ Your Order is Ready!';
      const dishSummary = (order.items || []).map(i => `${i.name || i.item?.name} x${i.quantity || i.qty || 1}`).slice(0, 3).join(', ');

      const notifMsg = isDeliv
        ? `Order #${order.id} for ${custName} (${dishSummary}) is prepared & packed for pickup!`
        : `${tableStr}: Order for ${custName} (${dishSummary}) is cooked & ready to serve! (Order #${order.id})`;

      fetch(`${API_BASE}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: target.user,
          recipientName: target.name,
          recipientRole: target.role,
          title: notifTitle,
          message: notifMsg,
          orderId: order.id,
          orderType: order.orderType,
          table: tableStr,
          customerName: custName,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      }).catch(e => console.error('Failed to dispatch notification:', e));

      showToast(`✓ Order #${order.id} for ${custName} (${tableStr}) is Cooked & Ready!`, 'success');
    } else {
      showToast(`🔥 Order #${order.id} for ${custName} is Cooking on Chulha!`, 'info');
    }

    renderOrders();
  } catch (err) {
    console.error('Failed to update order status:', err);
    showToast('Failed to update order status', 'error');
  }
}
window.setOrderStatusFromKds = setOrderStatusFromKds;

// Thermal Print KOT Slip
function printKotTicket(orderId) {
  const order = ALL_ORDERS.find(o => o.id === orderId);
  if (!order) {
    showToast('Order not found for printing', 'error');
    return;
  }

  let custName = (order.customerName || order.name || '').trim();
  if (!custName || custName.startsWith('Dine-In')) {
    custName = `Guest (${order.table || 'Table'})`;
  }
  const custPhone = order.customerPhone || (order.phone !== 'In-House Guest' ? order.phone : '');
  const tableStr = order.table || order.address || 'Table 1';
  const staffStr = order.staff || order.staffUser || 'Staff';

  const printWindow = window.open('', '_blank', 'width=380,height=550');
  if (!printWindow) {
    showToast('Please allow popups to print KOT slip', 'error');
    return;
  }

  const itemsHtml = (order.items || []).map(i => `
    <tr>
      <td style="padding: 4px 0; font-size: 13px;"><strong>${escapeHtml(i.name || i.item?.name)}</strong>${i.hindiName ? `<br><small style="color: #666;">${escapeHtml(i.hindiName)}</small>` : ''}</td>
      <td style="padding: 4px 0; text-align: center; font-size: 14px; font-weight: bold;">x${i.quantity || i.qty || 1}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>KOT #${order.id}</title>
      <style>
        body { font-family: monospace, sans-serif; width: 300px; margin: 0 auto; padding: 15px; color: #000; }
        .kot-header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
        .kot-title { font-size: 18px; font-weight: bold; margin: 0; }
        .kot-subtitle { font-size: 11px; margin: 2px 0 0; }
        .kot-meta-table { width: 100%; font-size: 12px; margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 6px; }
        .kot-cust-box { background: #eee; padding: 6px; border-radius: 4px; margin-bottom: 8px; font-size: 13px; font-weight: bold; }
        .kot-items-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 6px; }
        .kot-notes { font-size: 12px; font-style: italic; background: #fafafa; border: 1px solid #ccc; padding: 6px; margin-bottom: 8px; }
        .kot-footer { text-align: center; font-size: 11px; }
        @media print { body { width: 100%; margin: 0; padding: 0; } }
      </style>
    </head>
    <body>
      <div class="kot-header">
        <div class="kot-title">🔥 KITCHEN ORDER TICKET (KOT)</div>
        <div class="kot-subtitle">Mhare Gaam Ki Rasoi • Chulha Rasoi</div>
      </div>
      <table class="kot-meta-table">
        <tr>
          <td><strong>KOT #:</strong> #${order.id}</td>
          <td style="text-align: right;"><strong>Time:</strong> ${order.timestamp || ''}</td>
        </tr>
        <tr>
          <td><strong>Table:</strong> ${escapeHtml(tableStr)}</td>
          <td style="text-align: right;"><strong>Server:</strong> ${escapeHtml(staffStr)}</td>
        </tr>
      </table>
      <div class="kot-cust-box">
        👤 CUSTOMER: ${escapeHtml(custName)}
        ${custPhone ? `<br><small style="font-weight: normal;">📞 Phone: ${escapeHtml(custPhone)}</small>` : ''}
      </div>
      ${order.notes && order.notes !== 'Standard Gaam Style' ? `
        <div class="kot-notes">
          📝 <strong>Chef Instructions:</strong> ${escapeHtml(order.notes)}
        </div>
      ` : ''}
      <table class="kot-items-table">
        <thead>
          <tr style="border-bottom: 1px solid #000;">
            <th style="text-align: left; padding-bottom: 4px;">Item Description</th>
            <th style="text-align: center; padding-bottom: 4px;">Qty</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div class="kot-footer">
        --- FIREWOOD CHULHA PREPARATION ---
      </div>
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
window.printKotTicket = printKotTicket;

async function setDishCookingStatus(dishIdx, newStatus) {
  const dish = (window.CURRENT_AGGREGATED_DISHES || [])[dishIdx];
  if (!dish) return;

  if (!window.KDS_DISH_STATES) window.KDS_DISH_STATES = {};
  window.KDS_DISH_STATES[dish.key] = newStatus;
  try {
    localStorage.setItem('mgkr_kds_dish_states', JSON.stringify(window.KDS_DISH_STATES));
  } catch (e) {}

  const isConfirmed = newStatus === 'confirmed';
  const targetStage = isConfirmed ? 4 : 2;
  const targetStatus = isConfirmed ? 'CONFIRMED' : 'CHULHA_PREP';

  // Update all orders that contain this dish
  const notifiedStaffList = [];
  for (const orderId of dish.orderIds) {
    try {
      await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageIndex: targetStage,
          status: targetStatus
        })
      });

      const order = ALL_ORDERS.find(o => o.id === orderId);
      if (order) {
        order.stageIndex = targetStage;
        order.status = targetStatus;

        if (isConfirmed) {
          const target = getRespectiveStaffAssignment(order);
          const isDeliv = order.orderType === 'delivery';
          const notifTitle = isDeliv ? '🛵 Your Order is Ready for Delivery!' : '🛎️ Your Order is Ready!';
          const custName = order.customerName || (order.name && !order.name.startsWith('Dine-In') ? order.name : 'Guest');
          const notifMsg = isDeliv
            ? `Order #${order.id} for ${custName} (${dish.name}${dish.totalQuantity > 1 ? ' x' + dish.totalQuantity : ''}) is prepared & packed for pickup!`
            : `${order.table || order.address || 'Table'}: Order for ${custName} (${dish.name}${dish.totalQuantity > 1 ? ' x' + dish.totalQuantity : ''}) is cooked & ready to serve! (Order #${order.id})`;

          fetch(`${API_BASE}/api/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipient: target.user,
              recipientName: target.name,
              recipientRole: target.role,
              title: notifTitle,
              message: notifMsg,
              orderId: order.id,
              orderType: order.orderType,
              table: order.table || order.address || 'Dine-In',
              customerName: custName,
              dishName: dish.name,
              quantity: dish.totalQuantity,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
          }).catch(e => console.error('Failed to dispatch notification:', e));

          if (!notifiedStaffList.includes(target.name)) {
            notifiedStaffList.push(target.name);
          }
        }
      }
    } catch (err) {
      console.error(`Failed to update order ${orderId}:`, err);
    }
  }

  playKitchenBell();
  if (isConfirmed) {
    const notifyStr = notifiedStaffList.length > 0 ? ` (Notified: ${notifiedStaffList.join(', ')})` : '';
    showToast(`✓ ${dish.name} (${dish.totalQuantity > 1 ? 'x' + dish.totalQuantity : '1'}) Prepared & Confirmed! "Your Order is Ready" sent${notifyStr}`, 'success');
  } else {
    showToast(`🔥 ${dish.name} (${dish.totalQuantity > 1 ? 'x' + dish.totalQuantity : '1'}) set to Preparing!`);
  }
  renderOrders();
}
window.setDishCookingStatus = setDishCookingStatus;

// Alias for backwards compatibility
window.setDishGroupStage = function(dishIdx, targetStage) {
  setDishCookingStatus(dishIdx, targetStage === 1 ? 'confirmed' : 'preparing');
};

function resetAllDishesPreparing() {
  window.KDS_DISH_STATES = {};
  try {
    localStorage.removeItem('mgkr_kds_dish_states');
  } catch (e) {}
  playKitchenBell();
  showToast('🔥 All live dishes set to Preparing first!');
  renderOrders();
}
window.resetAllDishesPreparing = resetAllDishesPreparing;

// ==========================================================================
// ORDER READY NOTIFICATION & SERVICE BELL SYSTEM (STAFF & DELIVERY)
// ==========================================================================

function getRespectiveStaffAssignment(order) {
  if (order.orderType === 'delivery') {
    return {
      user: 'delivery',
      name: 'Rider 1 - Gaam Delivery Partner',
      role: 'Delivery'
    };
  }

  // If order has explicit staffUser
  if (order.staffUser) {
    const u = order.staffUser.toLowerCase();
    const staffLookup = {
      staff: { user: 'staff1', name: 'Staff 1 - Floor Captain' },
      staff1: { user: 'staff1', name: 'Staff 1 - Floor Captain' },
      staff2: { user: 'staff2', name: 'Staff 2 - Table Attendant' },
      staff3: { user: 'staff3', name: 'Staff 3 - Chowki Server' },
      staff4: { user: 'staff4', name: 'Staff 4 - Charpai Captain' },
      staff5: { user: 'staff5', name: 'Staff 5 - Billing Counter' },
      staff6: { user: 'staff6', name: 'Staff 6 - Order Runner' }
    };
    if (staffLookup[u]) return { ...staffLookup[u], role: 'Floor Staff' };
  }

  // Check staff name string
  const staffStr = (order.staff || '').toLowerCase();
  if (staffStr.includes('staff 1') || staffStr.includes('captain') || staffStr.includes('floor captain')) {
    return { user: 'staff1', name: 'Staff 1 - Floor Captain', role: 'Floor Staff' };
  }
  if (staffStr.includes('staff 2') || staffStr.includes('attendant') || staffStr.includes('table attendant')) {
    return { user: 'staff2', name: 'Staff 2 - Table Attendant', role: 'Floor Staff' };
  }
  if (staffStr.includes('staff 3') || staffStr.includes('chowki')) {
    return { user: 'staff3', name: 'Staff 3 - Chowki Server', role: 'Floor Staff' };
  }
  if (staffStr.includes('staff 4') || staffStr.includes('charpai')) {
    return { user: 'staff4', name: 'Staff 4 - Charpai Captain', role: 'Floor Staff' };
  }
  if (staffStr.includes('staff 5') || staffStr.includes('billing')) {
    return { user: 'staff5', name: 'Staff 5 - Billing Counter', role: 'Floor Staff' };
  }
  if (staffStr.includes('staff 6') || staffStr.includes('runner')) {
    return { user: 'staff6', name: 'Staff 6 - Order Runner', role: 'Floor Staff' };
  }

  // Check table / baithak where order was received first
  const tbl = ((order.table || '') + ' ' + (order.address || '')).toLowerCase();
  if (tbl.includes('table 1') || tbl.includes('table 2')) {
    return { user: 'staff1', name: 'Staff 1 - Floor Captain', role: 'Floor Staff' };
  }
  if (tbl.includes('table 3') || tbl.includes('table 4') || tbl.includes('table 04')) {
    return { user: 'staff2', name: 'Staff 2 - Table Attendant', role: 'Floor Staff' };
  }
  if (tbl.includes('chowki') || tbl.includes('बैठक')) {
    return { user: 'staff3', name: 'Staff 3 - Chowki Server', role: 'Floor Staff' };
  }
  if (tbl.includes('charpai') || tbl.includes('khatiya') || tbl.includes('table 07') || tbl.includes('table 7') || tbl.includes('खाट')) {
    return { user: 'staff4', name: 'Staff 4 - Charpai Captain', role: 'Floor Staff' };
  }
  if (tbl.includes('table 5') || tbl.includes('takeaway') || tbl.includes('counter')) {
    return { user: 'staff5', name: 'Staff 5 - Billing Counter', role: 'Floor Staff' };
  }

  return { user: 'staff1', name: 'Staff 1 - Floor Captain', role: 'Floor Staff' };
}

function playOrderReadyChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic 1: E5 (659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.65);

    // Harmonic 2: G#5 (830.61Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(830.61, now + 0.16);
    gain2.gain.setValueAtTime(0.45, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.16);
    osc2.stop(now + 0.85);

    // Harmonic 3: B5 (987.77Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(987.77, now + 0.32);
    gain3.gain.setValueAtTime(0.4, now + 0.32);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.15);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.32);
    osc3.stop(now + 1.15);
  } catch (e) {
    if (typeof playKitchenBell === 'function') playKitchenBell();
  }
}

let NOTIF_POLLER_INTERVAL = null;
let SEEN_NOTIF_IDS = new Set();
let CURRENT_NOTIFICATIONS = [];

function initNotificationSystem() {
  const user = (sessionStorage.getItem('mgkr_admin_user') || '').trim().toLowerCase();
  const role = sessionStorage.getItem('mgkr_user_role') || 'Master Admin';
  const name = sessionStorage.getItem('mgkr_user_name') || user;

  const notifUserTag = document.getElementById('notifUserTag');
  if (notifUserTag) {
    notifUserTag.textContent = name;
  }

  const btnHeaderNotif = document.getElementById('btnHeaderNotif');
  const notifDropdown = document.getElementById('notifDropdownPanel');
  const btnClearNotifs = document.getElementById('btnClearNotifs');
  const btnDismissReady = document.getElementById('btnDismissReadyAlert');

  if (btnHeaderNotif && notifDropdown) {
    btnHeaderNotif.onclick = (e) => {
      e.stopPropagation();
      const isVisible = notifDropdown.style.display !== 'none';
      notifDropdown.style.display = isVisible ? 'none' : 'block';
    };

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#headerNotifWrapper')) {
        if (notifDropdown) notifDropdown.style.display = 'none';
      }
    });

    const btnCloseNotifDropdown = document.getElementById('btnCloseNotifDropdown');
    if (btnCloseNotifDropdown) {
      btnCloseNotifDropdown.onclick = (e) => {
        e.stopPropagation();
        notifDropdown.style.display = 'none';
      };
    }
  }

  if (btnClearNotifs) {
    btnClearNotifs.onclick = async () => {
      try {
        await fetch(`${API_BASE}/api/notifications/clear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user })
        });
        showToast('All notifications marked as read', 'info');
        loadNotifications(true);
      } catch (e) {
        console.error('Error clearing notifications:', e);
      }
    };
  }

  if (btnDismissReady) {
    btnDismissReady.onclick = (e) => {
      e.stopPropagation();
      const popup = document.getElementById('orderReadyAlertPopup');
      if (popup) popup.style.display = 'none';
    };
  }

  const closeOrderReadyBtn = document.getElementById('closeOrderReadyModalBtn');
  const dismissOrderReadyBtn = document.getElementById('btnDismissOrderReadyModal');
  const orderReadyModal = document.getElementById('orderReadyDetailModal');

  if (closeOrderReadyBtn && orderReadyModal) {
    closeOrderReadyBtn.onclick = () => { orderReadyModal.style.display = 'none'; };
  }
  if (dismissOrderReadyBtn && orderReadyModal) {
    dismissOrderReadyBtn.onclick = () => { orderReadyModal.style.display = 'none'; };
  }
  if (orderReadyModal) {
    orderReadyModal.onclick = (e) => {
      if (e.target === orderReadyModal) orderReadyModal.style.display = 'none';
    };
  }

  // Click on floating popup opens order details directly
  const alertCard = document.querySelector('#orderReadyAlertPopup .order-ready-alert-card');
  if (alertCard) {
    alertCard.style.cursor = 'pointer';
    alertCard.onclick = (e) => {
      if (e.target.id === 'btnDismissReadyAlert' || e.target.closest('#btnDismissReadyAlert')) return;
      const popup = document.getElementById('orderReadyAlertPopup');
      if (popup) popup.style.display = 'none';
      if (window.LATEST_READY_NOTIF) {
        onNotificationClick(window.LATEST_READY_NOTIF.id);
      }
    };
  }

  // Request browser Notification permission if supported
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      Notification.requestPermission();
    } catch (e) {}
  }

  // Initial load
  loadNotifications(false);

  // Poll notifications every 3.5 seconds
  if (NOTIF_POLLER_INTERVAL) clearInterval(NOTIF_POLLER_INTERVAL);
  NOTIF_POLLER_INTERVAL = setInterval(() => {
    loadNotifications(false);
  }, 3500);
}

async function loadNotifications(forceRenderList = false) {
  const user = (sessionStorage.getItem('mgkr_admin_user') || '').trim().toLowerCase();
  const role = (sessionStorage.getItem('mgkr_user_role') || '').trim().toLowerCase();
  if (!user) return;

  try {
    const res = await fetch(`${API_BASE}/api/notifications?user=${encodeURIComponent(user)}&role=${encodeURIComponent(role)}`);
    if (!res.ok) return;
    const data = await res.json();
    const notifs = data.notifications || [];
    const unreadCount = data.unreadCount || 0;
    CURRENT_NOTIFICATIONS = notifs;

    // Update Header Bell Badge
    const badge = document.getElementById('notifBadge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }

    // Check for newly arrived unread notifications targeting this user
    notifs.forEach(n => {
      if (!n.read && !SEEN_NOTIF_IDS.has(n.id)) {
        SEEN_NOTIF_IDS.add(n.id);

        // Alert this user!
        triggerOrderReadyAlert(n);
      }
    });

    renderNotificationsList(notifs);
  } catch (err) {
    // offline or connection issue
  }
}

function triggerOrderReadyAlert(notif) {
  window.LATEST_READY_NOTIF = notif;
  // Audio chime
  playOrderReadyChime();

  // Desktop notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(notif.title || 'Your Order is Ready!', {
        body: notif.message,
        icon: 'images/restaurant_logo.jpg'
      });
    } catch (e) {}
  }

  // Show floating alert card
  const popup = document.getElementById('orderReadyAlertPopup');
  const tag = document.getElementById('readyAlertTag');
  const title = document.getElementById('readyAlertTitle');
  const msg = document.getElementById('readyAlertMsg');
  const staff = document.getElementById('readyAlertStaffName');
  const time = document.getElementById('readyAlertTime');

  if (popup && title && msg) {
    if (tag) tag.textContent = notif.orderType === 'delivery' ? '🛵 RIDER ALERT • ORDER READY' : '🛎️ STAFF ALERT • ORDER READY';
    title.textContent = notif.title || 'Your Order is Ready!';
    msg.textContent = notif.message || 'The kitchen has prepared your order.';
    if (staff) staff.textContent = notif.recipientName || 'Assigned Staff';
    if (time) time.textContent = notif.timestamp || 'Just now';

    popup.style.display = 'block';

    // Auto dismiss after 9 seconds
    setTimeout(() => {
      if (popup) popup.style.display = 'none';
    }, 9000);
  }

  // Also trigger a toast
  showToast(`🛎️ ${notif.title}: ${notif.message}`, 'success');
}

function renderNotificationsList(notifs) {
  const container = document.getElementById('notifDropdownList');
  if (!container) return;

  if (!notifs || notifs.length === 0) {
    container.innerHTML = `<div class="notif-empty-state">No notifications yet</div>`;
    return;
  }

  container.innerHTML = notifs.slice(0, 20).map(n => {
    const icon = n.orderType === 'delivery' ? '🛵' : '🛎️';
    return `
      <div class="notif-item ${!n.read ? 'unread' : ''}" onclick="onNotificationClick('${n.id}')" title="Click to view full order details on screen">
        <div class="notif-item-icon">${icon}</div>
        <div class="notif-item-body">
          <div class="notif-item-title">${n.title || 'Your Order is Ready!'}</div>
          <div class="notif-item-msg">${n.message}</div>
          <div class="notif-item-meta">
            <span class="notif-item-target">${n.recipientName || 'Staff'}</span>
            <span>${n.timestamp}</span>
          </div>
          <div class="notif-item-action-hint">🔍 Click to view details on screen</div>
        </div>
      </div>
    `;
  }).join('');
}

async function markNotificationRead(notifId) {
  try {
    await fetch(`${API_BASE}/api/notifications/${notifId}/read`, { method: 'PUT' });
    const item = CURRENT_NOTIFICATIONS.find(n => n.id === notifId);
    if (item) item.read = true;
    loadNotifications(true);
  } catch (e) {}
}
window.markNotificationRead = markNotificationRead;

async function onNotificationClick(notifId) {
  markNotificationRead(notifId);

  const dropdown = document.getElementById('notifDropdownPanel');
  if (dropdown) dropdown.style.display = 'none';

  let notif = CURRENT_NOTIFICATIONS.find(n => n.id === notifId);
  if (!notif) {
    try {
      const res = await fetch(`${API_BASE}/api/notifications`);
      const data = await res.json();
      const all = data.notifications || data;
      notif = all.find(n => n.id === notifId);
    } catch (e) {}
  }

  if (!notif) {
    showToast('Notification details not found.', 'error');
    return;
  }

  displayOrderNotificationDetails(notif);
}
window.onNotificationClick = onNotificationClick;

async function displayOrderNotificationDetails(notif) {
  const modal = document.getElementById('orderReadyDetailModal');
  if (!modal) return;

  if (!ALL_ORDERS || ALL_ORDERS.length === 0) {
    await loadOrders();
  }

  let targetOrderId = notif.orderId;
  if (!targetOrderId && notif.message) {
    const match = notif.message.match(/#([A-Z0-9-]+)/);
    if (match) targetOrderId = match[1];
  }

  let order = ALL_ORDERS.find(o => o.id === targetOrderId);
  if (!order && targetOrderId) {
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      ALL_ORDERS = await res.json();
      order = ALL_ORDERS.find(o => o.id === targetOrderId);
    } catch (e) {}
  }

  const tableName = (order && (order.table || order.address)) || notif.table || '';
  const isDineIn = (order && order.orderType === 'dine_in') || notif.orderType === 'dine_in' || (tableName && (tableName.toLowerCase().includes('table') || tableName.toLowerCase().includes('charpai') || tableName.toLowerCase().includes('chowki')));

  if (isDineIn && tableName) {
    selectPosTable(tableName);
  }

  const modalIcon = document.getElementById('modalNotifIcon');
  const modalTitle = document.getElementById('modalNotifTitle');
  const modalBadge = document.getElementById('modalNotifOrderIdBadge');
  const modalSubtitle = document.getElementById('modalNotifSubtitle');

  const orderIdDisplay = order ? order.id : (targetOrderId || 'KOT');
  if (modalIcon) modalIcon.textContent = isDineIn ? '🛎️' : '🛵';
  if (modalTitle) modalTitle.textContent = isDineIn ? 'Order Ready to Serve!' : 'Order Ready for Delivery!';
  if (modalBadge) modalBadge.textContent = `#${orderIdDisplay}`;
  if (modalSubtitle) modalSubtitle.textContent = isDineIn ? 'Piping hot from Rasoi Chulha • Ready for Baithak' : 'Packed and ready for pickup & dispatch';

  const banner = document.getElementById('modalNotifBanner');
  if (banner) {
    if (isDineIn) {
      banner.innerHTML = `
        <div class="ready-banner-grid">
          <div class="ready-banner-item">
            <span class="ready-banner-label">📍 Destination Baithak / Table:</span>
            <strong class="ready-banner-val highlight-table">${tableName || 'Floor Table'}</strong>
          </div>
          <div class="ready-banner-item">
            <span class="ready-banner-label">👤 Assigned Floor Staff:</span>
            <strong class="ready-banner-val">${(order && order.staff) || notif.recipientName || 'Floor Captain'}</strong>
          </div>
          <div class="ready-banner-item">
            <span class="ready-banner-label">⏰ Ready Timestamp:</span>
            <strong class="ready-banner-val">${notif.timestamp || (order && order.timestamp) || 'Just now'}</strong>
          </div>
          <div class="ready-banner-item">
            <span class="ready-banner-label">🔥 Status:</span>
            <strong class="ready-banner-val status-hot">Freshly Cooked & Ready to Serve!</strong>
          </div>
        </div>
      `;
    } else {
      const custName = (order && order.name) || 'Customer';
      const custPhone = (order && order.phone) || '';
      const custAddress = (order && order.address) || tableName || 'Home Address';
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(custAddress)}`;

      banner.innerHTML = `
        <div class="ready-banner-grid">
          <div class="ready-banner-item" style="grid-column: 1 / -1;">
            <span class="ready-banner-label">📍 Delivery Address:</span>
            <strong class="ready-banner-val">${custAddress}</strong>
            <div style="margin-top: 4px;">
              <a href="${mapsUrl}" target="_blank" class="btn-quick-map" style="display: inline-flex;">🗺️ Open Google Maps</a>
            </div>
          </div>
          <div class="ready-banner-item">
            <span class="ready-banner-label">👤 Customer:</span>
            <strong class="ready-banner-val">${custName} ${custPhone ? `<a href="tel:${custPhone}" class="btn-quick-call">📞 ${custPhone}</a>` : ''}</strong>
          </div>
          <div class="ready-banner-item">
            <span class="ready-banner-label">🛵 Assigned Rider:</span>
            <strong class="ready-banner-val">${(order && order.staff) || notif.recipientName || 'Delivery Partner'}</strong>
          </div>
        </div>
      `;
    }
  }

  const itemsContainer = document.getElementById('modalNotifItemsList');
  const countBadge = document.getElementById('modalNotifItemCount');

  let items = (order && Array.isArray(order.items)) ? order.items : [];
  if (items.length === 0 && notif.dishName) {
    items = [{
      name: notif.dishName,
      quantity: notif.quantity || 1,
      price: 0
    }];
  }

  if (countBadge) {
    countBadge.textContent = `${items.length} ${items.length === 1 ? 'Dish' : 'Dishes'}`;
  }

  if (itemsContainer) {
    if (items.length === 0) {
      itemsContainer.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 10px;">${notif.message}</div>`;
    } else {
      itemsContainer.innerHTML = items.map(itmObj => {
        const itm = itmObj.item || itmObj;
        const name = itm.name || 'Village Dish';
        const hindi = itm.hindiName ? `<span style="color: var(--text-muted); font-size: 0.8rem; font-weight: normal;"> • ${itm.hindiName}</span>` : '';
        const qty = itmObj.quantity || itm.quantity || 1;
        const price = itm.price || 0;
        let addonsHtml = '';
        if (itmObj.addons) {
          const addonTxt = Array.isArray(itmObj.addons) ? itmObj.addons.map(a => a.name || a).join(', ') : itmObj.addons;
          if (addonTxt) addonsHtml = `<div style="font-size: 0.74rem; color: var(--terracotta); font-weight: 600; margin-top: 2px;">+ ${addonTxt}</div>`;
        }
        let spiceHtml = '';
        if (itmObj.spice) {
          spiceHtml = `<span style="font-size: 0.74rem; color: var(--text-secondary); margin-left: 6px;">(${itmObj.spice})</span>`;
        }

        return `
          <div class="ready-item-card">
            <div class="ready-item-info">
              <span class="ready-item-bullet">🍲</span>
              <div>
                <div class="ready-item-title-line">
                  <strong class="ready-item-name">${name}</strong>
                  ${hindi}
                  <span class="ready-item-qty-tag">x${qty}</span>
                  ${spiceHtml}
                </div>
                ${addonsHtml}
              </div>
            </div>
            <div class="ready-item-price">${price > 0 ? `₹${price * qty}` : ''}</div>
          </div>
        `;
      }).join('');
    }
  }

  const notesContainer = document.getElementById('modalNotifNotesContainer');
  const cookingNotes = (order && order.notes) || (items[0] && items[0].instructions) || '';
  if (notesContainer) {
    if (cookingNotes) {
      notesContainer.style.display = 'block';
      notesContainer.innerHTML = `
        <div class="ready-notes-box">
          <span style="font-size: 1.1rem;">📝</span>
          <div>
            <strong style="color: #C62828; font-size: 0.8rem; text-transform: uppercase; display: block;">Special Cooking / Guest Note:</strong>
            <span style="font-size: 0.86rem; color: #37474F; font-weight: 600;">"${cookingNotes}"</span>
          </div>
        </div>
      `;
    } else {
      notesContainer.style.display = 'none';
    }
  }

  const paymentBox = document.getElementById('modalNotifPaymentBox');
  if (paymentBox) {
    const totalVal = order ? order.total : 0;
    const isCod = order ? isOrderCod(order) : true;
    let payHtml = '';
    if (isDineIn) {
      const isSettled = order && (order.settledWithBillId || order.status === 'DELIVERED');
      payHtml = `
        <div class="ready-pay-summary">
          <div>
            <small style="color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase;">Order Total / बिल राशि:</small>
            <strong class="ready-total-amount">₹${totalVal}</strong>
          </div>
          <div style="text-align: right;">
            <span class="pay-chip-pill ${isSettled ? 'pill-prepaid' : 'pill-cod'}">${isSettled ? '✅ Settled with Bill' : '🍽️ In-House Dine-In Tab'}</span>
            <small style="display: block; font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Floor Staff Tab</small>
          </div>
        </div>
      `;
    } else {
      payHtml = `
        <div class="ready-pay-summary">
          <div>
            <small style="color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase;">Amount:</small>
            <strong class="ready-total-amount">₹${totalVal}</strong>
          </div>
          <div style="text-align: right;">
            <span class="pay-chip-pill ${isCod ? 'pill-cod' : 'pill-prepaid'}">${isCod ? '💵 Cash on Delivery (COD)' : '✅ Payment Done (Prepaid)'}</span>
            <small style="display: block; font-size: 0.72rem; color: ${isCod ? '#B71C1C' : '#2E7D32'}; font-weight: 600; margin-top: 2px;">
              ${isCod ? `⚠️ Collect ₹${totalVal} Cash` : '🟢 Fully Paid Online'}
            </small>
          </div>
        </div>
      `;
    }
    paymentBox.innerHTML = payHtml;
  }

  const actionsContainer = document.getElementById('modalNotifActionButtons');
  if (actionsContainer) {
    if (isDineIn) {
      actionsContainer.innerHTML = `
        <button type="button" class="btn btn-primary btn-sm btn-serve-action" onclick="handleNotifMarkServed('${orderIdDisplay}', '${tableName}')">
          ✅ Mark Food as Served to ${tableName || 'Table'}
        </button>
        <button type="button" class="btn btn-secondary btn-sm btn-pos-action" onclick="handleNotifOpenTable('${tableName}')">
          🍽️ Open & Work on ${tableName || 'Table'} in POS
        </button>
      `;
    } else {
      actionsContainer.innerHTML = `
        <button type="button" class="btn btn-primary btn-sm btn-serve-action" onclick="handleNotifMarkDelivered('${orderIdDisplay}')">
          ✅ Mark as Delivered
        </button>
        <button type="button" class="btn btn-secondary btn-sm btn-pos-action" onclick="handleNotifOpenDelivery()">
          🛵 View in Delivery Portal
        </button>
      `;
    }
  }

  modal.style.display = 'flex';
}
window.displayOrderNotificationDetails = displayOrderNotificationDetails;

function handleNotifOpenTable(tableName) {
  const modal = document.getElementById('orderReadyDetailModal');
  if (modal) modal.style.display = 'none';

  const tabPos = document.getElementById('tabBtnPos');
  if (tabPos) tabPos.click();

  if (tableName) {
    selectPosTable(tableName);
    showToast(`Switched to ${tableName} in In-House POS!`, 'info');
  }
}
window.handleNotifOpenTable = handleNotifOpenTable;

async function handleNotifMarkServed(orderId, tableName) {
  const modal = document.getElementById('orderReadyDetailModal');
  if (modal) modal.style.display = 'none';

  try {
    await updateOrderStatus(orderId, 5);
    playKitchenBell();
    showToast(`🎉 Order #${orderId} marked as SERVED to ${tableName || 'Table'}!`, 'success');
  } catch (e) {
    showToast(`Failed to update status for #${orderId}`, 'error');
  }
}
window.handleNotifMarkServed = handleNotifMarkServed;

function handleNotifOpenDelivery() {
  const modal = document.getElementById('orderReadyDetailModal');
  if (modal) modal.style.display = 'none';

  const tabDelivery = document.getElementById('tabBtnDelivery');
  if (tabDelivery) tabDelivery.click();
}
window.handleNotifOpenDelivery = handleNotifOpenDelivery;

async function handleNotifMarkDelivered(orderId) {
  const modal = document.getElementById('orderReadyDetailModal');
  if (modal) modal.style.display = 'none';

  if (typeof markOrderDelivered === 'function') {
    markOrderDelivered(orderId);
  } else {
    updateOrderStatus(orderId, 5);
  }
}
window.handleNotifMarkDelivered = handleNotifMarkDelivered;

async function updateOrderStatus(orderId, stageIndex) {
  stageIndex = Number(stageIndex);
  const statusMap = {
    1: 'CONFIRMED',
    2: 'CHULHA_PREP',
    3: 'HANDI_SIMMER',
    4: 'PACKED_READY',
    5: 'DELIVERED'
  };

  try {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stageIndex: stageIndex,
        status: statusMap[stageIndex]
      })
    });
    if (!res.ok) throw new Error('Failed to update stage');

    const order = ALL_ORDERS.find(o => o.id === orderId);
    if (order) {
      order.stageIndex = stageIndex;
      order.status = statusMap[stageIndex];
    }
    playKitchenBell();
    showToast(`Order #${orderId} moved to Stage ${stageIndex}! 🚀`);
    renderOrders();
  } catch (err) {
    console.error(err);
    showToast('Failed to update order status', 'error');
  }
}

// --- 3. BAITHAK RESERVATIONS ---

async function loadBookings() {
  try {
    const res = await fetch(`${API_BASE}/api/bookings`);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    ALL_BOOKINGS = await res.json();
    renderBookings();
    updateStats();
  } catch (err) {
    console.error('Error loading bookings:', err);
  }
}

function renderBookings() {
  const tbody = document.getElementById('bookingsTableBody');
  document.getElementById('bookingsCountBadge').textContent = ALL_BOOKINGS.length;

  if (ALL_BOOKINGS.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 30px; color: var(--text-secondary);">
          No table reservations yet. Bookings from customer app will appear here!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = ALL_BOOKINGS.map(b => `
    <tr>
      <td><strong>${b.id}</strong></td>
      <td>${b.name || b.customerName}</td>
      <td>${b.phone || b.phoneNumber}</td>
      <td><strong>${b.guests || b.guestsCount} Guests</strong></td>
      <td>${b.date || b.bookingDate} at ${b.time || b.timeSlot}</td>
      <td>${b.seating || b.seatingPreference?.title || 'Village Charpai'}</td>
      <td><small>${b.notes || b.specialNotes || 'None'}</small></td>
      <td><span class="status-badge confirmed">Confirmed</span></td>
    </tr>
  `).join('');
}

// --- 4. STATS RECALCULATION ---
function updateStats() {
  document.getElementById('statTotalDishes').textContent = ALL_DISHES.length;
  document.getElementById('statActiveOrders').textContent = ALL_ORDERS.filter(o => o.stageIndex < 5).length;
  document.getElementById('statBookings').textContent = ALL_BOOKINGS.length;
  document.getElementById('statDesiGhee').textContent = ALL_DISHES.filter(d => d.isDesiGheeSpecial).length;
}

// --- 5. EVENT LISTENERS ---
function setupEventListeners() {
  document.getElementById('openAddDishModalBtn').addEventListener('click', openAddDishModal);
  document.getElementById('closeDishModalBtn').addEventListener('click', closeDishModal);
  document.getElementById('cancelDishModalBtn').addEventListener('click', closeDishModal);
  document.getElementById('dishForm').addEventListener('submit', handleSaveDish);

  document.getElementById('dishSearchInput').addEventListener('input', renderDishes);
  document.getElementById('dishCategoryFilter').addEventListener('change', renderDishes);

  document.getElementById('refreshOrdersBtn').addEventListener('click', () => {
    loadOrders();
    showToast('Orders refreshed!');
  });

  document.getElementById('refreshBookingsBtn').addEventListener('click', () => {
    loadBookings();
    showToast('Bookings refreshed!');
  });

  // Initialize Product Picture Upload Engine
  initProductPictureUpload();
}

// --- PRODUCT PICTURE UPLOAD ENGINE ---
function initProductPictureUpload() {
  const fileInput = document.getElementById('dishImageFileInput');
  const triggerBtn = document.getElementById('btnTriggerImageUpload');
  const dropzonePrompt = document.getElementById('uploadDropzonePrompt');
  const dropzoneBox = document.getElementById('dishUploadBox');
  const replaceBtn = document.getElementById('btnReplaceUploadedImage');
  const removeBtn = document.getElementById('btnRemoveUploadedImage');

  if (triggerBtn && fileInput) {
    triggerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
    });
  }

  if (dropzonePrompt && fileInput) {
    dropzonePrompt.addEventListener('click', (e) => {
      if (e.target !== triggerBtn) {
        fileInput.click();
      }
    });
  }

  if (replaceBtn && fileInput) {
    replaceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearUploadedProductPicture();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        processAndUploadProductPicture(file);
      }
    });
  }

  // Drag & drop support
  if (dropzoneBox) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzoneBox.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneBox.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzoneBox.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneBox.classList.remove('drag-over');
      }, false);
    });

    dropzoneBox.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt && dt.files;
      if (files && files.length > 0) {
        processAndUploadProductPicture(files[0]);
      }
    });
  }

  // When clicking any preset option, reset custom upload state
  document.querySelectorAll('input[name="imagePreset"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        const uploadedUrlInput = document.getElementById('dishUploadedImageUrl');
        const customUrlInput = document.getElementById('dishCustomImage');
        if (uploadedUrlInput) uploadedUrlInput.value = '';
        if (customUrlInput) customUrlInput.value = '';
        const activeCard = document.getElementById('uploadActiveCard');
        const prompt = document.getElementById('uploadDropzonePrompt');
        if (activeCard) activeCard.style.display = 'none';
        if (prompt) prompt.style.display = 'flex';
      }
    });
  });

  // When typing custom URL, uncheck presets
  const customUrlInput = document.getElementById('dishCustomImage');
  if (customUrlInput) {
    customUrlInput.addEventListener('input', () => {
      if (customUrlInput.value.trim()) {
        document.querySelectorAll('input[name="imagePreset"]').forEach(r => r.checked = false);
      }
    });
  }
}

function clearUploadedProductPicture() {
  const fileInput = document.getElementById('dishImageFileInput');
  const uploadedUrlInput = document.getElementById('dishUploadedImageUrl');
  const customUrlInput = document.getElementById('dishCustomImage');
  const activeCard = document.getElementById('uploadActiveCard');
  const prompt = document.getElementById('uploadDropzonePrompt');
  const defaultRadio = document.querySelector('input[name="imagePreset"][value="images/dish_thali.jpg"]');

  if (fileInput) fileInput.value = '';
  if (uploadedUrlInput) uploadedUrlInput.value = '';
  if (customUrlInput) customUrlInput.value = '';
  if (activeCard) activeCard.style.display = 'none';
  if (prompt) prompt.style.display = 'flex';
  if (defaultRadio) defaultRadio.checked = true;
}

async function processAndUploadProductPicture(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showToast('File size exceeds 10MB limit. Please choose a smaller photo.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    const rawDataUrl = event.target.result;

    // Show immediate preview
    const previewImg = document.getElementById('dishUploadPreviewImg');
    const fileNameEl = document.getElementById('uploadFileName');
    const statusEl = document.getElementById('uploadFileStatus');
    const activeCard = document.getElementById('uploadActiveCard');
    const prompt = document.getElementById('uploadDropzonePrompt');

    if (previewImg) previewImg.src = rawDataUrl;
    if (fileNameEl) fileNameEl.textContent = file.name;
    if (statusEl) statusEl.textContent = '⏳ Uploading to server...';
    if (activeCard) activeCard.style.display = 'flex';
    if (prompt) prompt.style.display = 'none';

    // Deselect radio presets
    document.querySelectorAll('input[name="imagePreset"]').forEach(r => r.checked = false);

    try {
      const res = await fetch(`${API_BASE}/api/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, data: rawDataUrl })
      });
      const data = await res.json();

      if (res.ok && data.success && data.imageUrl) {
        const uploadedUrlInput = document.getElementById('dishUploadedImageUrl');
        const customUrlInput = document.getElementById('dishCustomImage');
        if (uploadedUrlInput) uploadedUrlInput.value = data.imageUrl;
        if (customUrlInput) customUrlInput.value = data.imageUrl;

        const sizeKb = file.size ? Math.round(file.size / 1024) + ' KB' : '';
        if (statusEl) statusEl.textContent = `✅ Ready to save with dish (${sizeKb})`;
        showToast('Product picture uploaded successfully! 📸', 'info');
      } else {
        // Fallback to base64 data url directly
        const uploadedUrlInput = document.getElementById('dishUploadedImageUrl');
        if (uploadedUrlInput) uploadedUrlInput.value = rawDataUrl;
        if (statusEl) statusEl.textContent = '✅ Photo attached (ready to save)';
      }
    } catch (err) {
      console.warn('Upload endpoint error, using base64 fallback:', err);
      const uploadedUrlInput = document.getElementById('dishUploadedImageUrl');
      if (uploadedUrlInput) uploadedUrlInput.value = rawDataUrl;
      if (statusEl) statusEl.textContent = '✅ Photo attached (local preview)';
    }
  };
  reader.readAsDataURL(file);
}

// Toast
function showToast(message, type = 'info') {
  const container = document.getElementById('adminToastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'error') toast.style.borderLeftColor = '#C62828';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}


// --- STAFF CREDENTIALS & PASSWORD MANAGEMENT TAB (ADMIN ONLY) ---
async function renderStaffAccountsTab() {
  const grid = document.getElementById('staffAccountsGrid');
  if (!grid) return;

  grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">Loading accounts...</div>';

  try {
    const res = await fetch(`${API_BASE}/api/admin/users`);
    const users = await res.json();

    const staffAccountsList = [
      { id: 'admin', defaultName: 'Head Admin', defaultRole: 'Master Admin', icon: '👑', color: '#D4881A', badge: 'Admin Portal Access' },
      { id: 'staff1', defaultName: 'Staff 1 - Floor Captain', defaultRole: 'Floor Staff (In-House POS)', icon: '🍽️', color: '#3F6338', badge: 'Table 1-2 Service' },
      { id: 'staff2', defaultName: 'Staff 2 - Table Attendant', defaultRole: 'Floor Staff (In-House POS)', icon: '🍽️', color: '#3F6338', badge: 'Table 3-5 Service' },
      { id: 'staff3', defaultName: 'Staff 3 - Chowki Server', defaultRole: 'Floor Staff (In-House POS)', icon: '🍽️', color: '#3F6338', badge: 'Floor Chowki Area' },
      { id: 'staff4', defaultName: 'Staff 4 - Charpai Captain', defaultRole: 'Floor Staff (In-House POS)', icon: '🍽️', color: '#3F6338', badge: 'Outdoor Khatiya Area' },
      { id: 'staff5', defaultName: 'Staff 5 - Billing Counter', defaultRole: 'Floor Staff (In-House POS)', icon: '🍽️', color: '#3F6338', badge: 'Counter & Takeaway' },
      { id: 'staff6', defaultName: 'Staff 6 - Order Runner', defaultRole: 'Floor Staff (In-House POS)', icon: '🍽️', color: '#3F6338', badge: 'Chulha to Table Runner' },
      { id: 'kitchen', defaultName: 'Chulha Master', defaultRole: 'Kitchen Display System (KDS)', icon: '🔥', color: '#C62828', badge: 'Woodfire Chulha Station' },
      { id: 'delivery', defaultName: 'Rider 1 - Gaam Delivery Partner', defaultRole: 'Delivery Partner (Gaam Rider)', icon: '🛵', color: '#8C3B1E', badge: 'Order Dispatch & Delivery' }
    ];

    const usersMap = {};
    users.forEach(u => { usersMap[u.username] = u; });

    grid.innerHTML = staffAccountsList.map(item => {
      const u = usersMap[item.id] || { username: item.id, name: item.defaultName, currentPassword: '••••••' };
      const currentPass = u.currentPassword || 'staff@1234';

      return `
        <div class="staff-account-card">
          <div class="staff-account-header">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 1.8rem; background: var(--bg-cream); width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--border-clay);">
                ${item.icon}
              </span>
              <div>
                <strong style="font-size: 1rem; color: var(--text-dark); display: block;">${u.name || item.defaultName}</strong>
                <span style="font-size: 0.74rem; color: ${item.color}; font-weight: 700;">${item.defaultRole}</span>
              </div>
            </div>
            <span class="staff-user-badge">ID: <code>${item.id}</code></span>
          </div>

          <div style="font-size: 0.76rem; color: var(--text-secondary); background: rgba(0,0,0,0.02); padding: 4px 8px; border-radius: 6px;">
            📍 Assigned Role: <strong>${item.badge}</strong>
          </div>

          <div class="staff-pwd-row">
            <span>Password:</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="staff-pwd-code" id="passDisplay_${item.id}">••••••••</span>
              <button type="button" class="btn btn-secondary btn-sm" onclick="togglePassVisibility('${item.id}', '${currentPass}')" style="padding: 2px 8px; font-size: 0.72rem;">
                👁️ View
              </button>
            </div>
          </div>

          <div class="staff-pwd-actions">
            <label style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-dark);">Update Password</label>
            <div class="staff-input-group">
              <input type="text" id="inputNewPass_${item.id}" placeholder="Enter new password (min 4 chars)">
              <button type="button" class="btn btn-primary btn-sm" onclick="handleUpdateStaffPassword('${item.id}')" style="padding: 8px 12px; white-space: nowrap;">
                💾 Save
              </button>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="handleResetStaffDefault('${item.id}')" style="margin-top: 4px; font-size: 0.74rem; justify-content: flex-start; background: none; border: 1px dashed var(--border-clay); color: var(--text-secondary);">
              ⚡ Reset to Default (${item.id === 'admin' ? 'admin@1234' : (item.id === 'kitchen' ? 'kitchen123' : 'staff@1234')})
            </button>
          </div>
        </div>
      `;
    }).join('');

    const countBadge = document.getElementById('staffAccountsBadge');
    if (countBadge) countBadge.textContent = '6 Staff Active';

  } catch (err) {
    console.error('Error loading staff accounts:', err);
    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: #C62828;">Failed to load staff accounts from server.</div>';
  }
}

window.togglePassVisibility = function(id, actualPass) {
  const el = document.getElementById(`passDisplay_${id}`);
  if (!el) return;
  if (el.textContent === '••••••••') {
    el.textContent = actualPass;
    el.style.color = '#3F6338';
  } else {
    el.textContent = '••••••••';
    el.style.color = '';
  }
};

window.handleUpdateStaffPassword = async function(username) {
  const input = document.getElementById(`inputNewPass_${username}`);
  const newPassword = input ? input.value.trim() : '';

  if (!newPassword || newPassword.length < 4) {
    showToast('Please enter a password with at least 4 characters.', 'error');
    if (input) input.focus();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/update-user-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUsername: username, newPassword })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast(`Password for '${username}' updated to '${newPassword}' successfully!`, 'info');
      if (input) input.value = '';
      renderStaffAccountsTab();
    } else {
      showToast(data.error || 'Failed to update password', 'error');
    }
  } catch (err) {
    console.error('Update password error:', err);
    showToast('Failed to update password. Check connection.', 'error');
  }
};

window.handleResetStaffDefault = async function(username) {
  let defaultPass = 'staff@1234';
  if (username === 'admin') defaultPass = 'admin@1234';
  if (username === 'kitchen') defaultPass = 'Kitchen@1234';
  if (username.startsWith('delivery')) defaultPass = 'Delivery@1234';
  if (!confirm(`Reset password for '${username}' to default (${defaultPass})?`)) return;

  try {
    const res = await fetch(`${API_BASE}/api/admin/reset-user-default`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUsername: username })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast(`Password for '${username}' reset to '${defaultPass}'!`, 'info');
      renderStaffAccountsTab();
    } else {
      showToast(data.error || 'Failed to reset password', 'error');
    }
  } catch (err) {
    console.error('Reset default error:', err);
    showToast('Server error resetting password', 'error');
  }
};

// ========================================================
// 7. BILLING ENGINE & TABLE BILLS MANAGEMENT
// ========================================================

function checkActiveTableOrders(table) {
  const banner = document.getElementById('activeTableOrdersBanner');
  if (!banner) return;

  const targetTable = (table || POS_TABLE || '').trim().toLowerCase();

  // Find active order matching this table (not delivered/settled stageIndex < 5)
  const activeOrder = ALL_ORDERS.find(o => {
    if (o.stageIndex >= 5 || o.status === 'DELIVERED') return false;
    const oTable = (o.table || o.address || o.name || '').toLowerCase();
    return oTable.includes(targetTable) || targetTable.includes(oTable);
  });

  DETECTED_TABLE_ORDER = activeOrder || null;

  if (activeOrder) {
    banner.style.display = 'flex';
    const titleEl = document.getElementById('activeBannerTitle');
    const detailsEl = document.getElementById('activeBannerDetails');
    const itemCount = (activeOrder.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);
    const stageDesc = activeOrder.status === 'CHULHA_PREP' ? '🔥 Cooking on Chulha' : '🛎️ Cooked & Ready';

    const custStr = (activeOrder.customerName || (activeOrder.name && !activeOrder.name.startsWith('Dine-In') ? activeOrder.name : '')).trim();
    if (titleEl) titleEl.textContent = `Order #${activeOrder.id} (${stageDesc})${custStr ? ` • Guest: ${custStr}` : ''}`;
    if (detailsEl) detailsEl.textContent = `${itemCount} items • ₹${activeOrder.total} • Server: ${activeOrder.staff || 'Staff'}`;
  } else {
    banner.style.display = 'none';
  }
}

function loadOrderIntoPosCart(order) {
  if (!order || !order.items) return;
  POS_CART = [];
  order.items.forEach(item => {
    POS_CART.push({
      id: item.id || 'dish-' + Math.floor(Math.random() * 1000),
      name: item.name || item.item?.name || 'Village Dish',
      hindiName: item.hindiName || item.item?.hindiName || '',
      price: item.price || item.item?.price || 0,
      qty: item.quantity || item.qty || 1
    });
  });
  ACTIVE_BILL_ORDER_IDS = [order.id];

  const custName = (order.customerName || (order.name && !order.name.startsWith('Dine-In') ? order.name : '')).trim();
  const custPhone = (order.customerPhone || (order.phone !== 'In-House Guest' && order.phone !== 'In-House' ? order.phone : '')).trim();
  const nameInput = document.getElementById('posCustomerName');
  const phoneInput = document.getElementById('posCustomerPhone');
  const notesInput = document.getElementById('posChefNotes');
  if (nameInput && custName) nameInput.value = custName;
  if (phoneInput && custPhone) phoneInput.value = custPhone;
  if (notesInput && order.notes && order.notes !== 'Standard Gaam Style') notesInput.value = order.notes;

  renderPosTicket();
  showToast(`Loaded ${order.items.length} dishes from Order #${order.id} for ${custName || 'Table'}!`, 'info');
}

function initBillingSystem() {
  // Billing Tab button
  const tabBillsBtn = document.getElementById('tabBtnBills');
  if (tabBillsBtn) {
    tabBillsBtn.addEventListener('click', () => {
      renderBillsTab();
    });
  }

  // Refresh bills button
  const refreshBtn = document.getElementById('refreshBillsBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadBills();
      showToast('Bills refreshed!', 'info');
    });
  }

  // New Table Bill button in billsTab -> switch to POS
  const newBillFromTabBtn = document.getElementById('btnQuickNewBillFromTab');
  if (newBillFromTabBtn) {
    newBillFromTabBtn.addEventListener('click', () => {
      const posTabBtn = document.getElementById('tabBtnPos');
      if (posTabBtn) posTabBtn.click();
    });
  }

  // Filter Table in Tab
  const filterTable = document.getElementById('billsFilterTable');
  if (filterTable) {
    filterTable.addEventListener('change', (e) => {
      BILLS_FILTER_TABLE = e.target.value;
      renderBillsTab();
    });
  }

  // Filter Staff in Tab
  const filterStaff = document.getElementById('billsFilterStaff');
  if (filterStaff) {
    filterStaff.addEventListener('change', (e) => {
      BILLS_FILTER_STAFF = e.target.value;
      renderBillsTab();
    });
  }

  // Search input in Tab
  const searchInput = document.getElementById('billsSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderBillsTab();
    });
  }

  // Payment mode radio tiles inside Billing Modal
  document.querySelectorAll('.pay-mode-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.pay-mode-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      const mode = card.dataset.mode;
      const cashBox = document.getElementById('cashCalcBox');
      const upiBox = document.getElementById('upiQrBox');

      if (cashBox) cashBox.style.display = (mode === 'CASH') ? 'block' : 'none';
      if (upiBox) upiBox.style.display = (mode === 'UPI') ? 'block' : 'none';
    });
  });

  // Cash received input change
  const cashInput = document.getElementById('cashReceivedInput');
  if (cashInput) {
    cashInput.addEventListener('input', calculateCashChange);
  }

  // Discount input change
  const discountInput = document.getElementById('billModalDiscount');
  if (discountInput) {
    discountInput.addEventListener('input', recalculateBillModalTotal);
  }

  // Modal Close buttons
  const closeBillModalBtn = document.getElementById('closeBillingModalBtn');
  const cancelBillModalBtn = document.getElementById('cancelBillingModalBtn');
  if (closeBillModalBtn) closeBillModalBtn.addEventListener('click', closeBillingModal);
  if (cancelBillModalBtn) cancelBillModalBtn.addEventListener('click', closeBillingModal);

  // Save Bill Only Button
  const saveOnlyBtn = document.getElementById('saveBillOnlyBtn');
  if (saveOnlyBtn) {
    saveOnlyBtn.addEventListener('click', () => handleSaveBill(false));
  }

  // Admin QR Zoom Lightbox for Billing Modal
  const qrFrame = document.getElementById('adminQrFrame');
  const qrModal = document.getElementById('adminQrModal');
  const closeQrModalBtn = document.getElementById('closeAdminQrModalBtn');
  const dismissQrModalBtn = document.getElementById('dismissAdminQrModalBtn');
  if (qrFrame && qrModal) {
    qrFrame.addEventListener('click', () => { qrModal.style.display = 'flex'; });
  }
  if (closeQrModalBtn && qrModal) {
    closeQrModalBtn.addEventListener('click', () => { qrModal.style.display = 'none'; });
  }
  if (dismissQrModalBtn && qrModal) {
    dismissQrModalBtn.addEventListener('click', () => { qrModal.style.display = 'none'; });
  }

  // Copy UPI ID button in billing modal
  const btnCopyUpi = document.getElementById('btnCopyAdminBillUpi');
  if (btnCopyUpi) {
    btnCopyUpi.addEventListener('click', (e) => {
      e.stopPropagation();
      const upiText = document.getElementById('adminBillUpiIdText')?.textContent.trim() || '7819952799@ybl';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(upiText).then(() => {
          btnCopyUpi.textContent = '✓ Copied!';
          btnCopyUpi.style.background = '#2E7D32';
          setTimeout(() => {
            btnCopyUpi.textContent = '📋 Copy';
            btnCopyUpi.style.background = '#5f259f';
          }, 2000);
        }).catch(() => {
          showToast('UPI ID: ' + upiText, 'info');
        });
      } else {
        showToast('UPI ID: ' + upiText, 'info');
      }
    });
  }

  // Save & Print Bill Button
  const saveAndPrintBtn = document.getElementById('saveAndPrintBillBtn');
  if (saveAndPrintBtn) {
    saveAndPrintBtn.addEventListener('click', () => handleSaveBill(true));
  }

  // Quick Table Bills Modal Close
  const closeQuickBillsBtn = document.getElementById('closeTableBillsModalBtn');
  if (closeQuickBillsBtn) {
    closeQuickBillsBtn.addEventListener('click', () => {
      document.getElementById('tableBillsModal').style.display = 'none';
    });
  }

  // Filter in Quick Table Bills Modal
  const modalFilterTable = document.getElementById('modalFilterTableSelect');
  if (modalFilterTable) {
    modalFilterTable.addEventListener('change', renderQuickTableBillsModal);
  }

  // Toggle "My Staff Bills" in quick modal
  const btnToggleMyBills = document.getElementById('btnToggleMyStaffBillsOnly');
  if (btnToggleMyBills) {
    btnToggleMyBills.addEventListener('click', () => {
      btnToggleMyBills.classList.toggle('active');
      renderQuickTableBillsModal();
    });
  }

  // Printable Bill Modal Close
  const closePrintSlipBtn = document.getElementById('closePrintableBillBtn');
  if (closePrintSlipBtn) {
    closePrintSlipBtn.addEventListener('click', () => {
      document.getElementById('printableBillModal').style.display = 'none';
    });
  }
}

async function loadBills() {
  try {
    const res = await fetch(`${API_BASE}/api/bills`);
    if (!res.ok) throw new Error('Failed to fetch bills');
    const data = await res.json();
    ALL_BILLS = data.bills || [];
    updateBillsBadges();
    renderBillsTab();
  } catch (err) {
    console.error('Error loading bills:', err);
  }
}

function updateBillsBadges() {
  const countBadge = document.getElementById('billsCountBadge');
  if (countBadge) countBadge.textContent = ALL_BILLS.length;
  const savedPosBadge = document.getElementById('savedBillsCountBadge');
  if (savedPosBadge) savedPosBadge.textContent = ALL_BILLS.length;
}

function openBillingModal() {
  const modal = document.getElementById('billingModal');
  if (!modal) return;

  if (POS_CART.length === 0) {
    showToast('Please add items to ticket or select table with active order to settle bill.', 'error');
    return;
  }

  const staffName = sessionStorage.getItem('mgkr_user_name') || 'Floor Staff';
  const staffUser = (sessionStorage.getItem('mgkr_admin_user') || 'staff1').trim().toLowerCase();

  const tableLabel = document.getElementById('billModalTableLabel');
  const staffLabel = document.getElementById('billModalStaffLabel');
  const auditTable = document.getElementById('billAuditTable');
  const auditStaff = document.getElementById('billAuditStaff');

  if (tableLabel) tableLabel.textContent = POS_TABLE;
  if (staffLabel) staffLabel.textContent = `${staffName} (${staffUser})`;
  if (auditTable) auditTable.textContent = POS_TABLE;
  if (auditStaff) auditStaff.textContent = `${staffName} (${staffUser})`;

  // Render items body
  const tbody = document.getElementById('billModalItemsBody');
  if (tbody) {
    tbody.innerHTML = POS_CART.map(item => {
      const itemTotal = item.price * item.qty;
      return `
        <tr>
          <td>
            <strong>${item.name}</strong>
            ${item.hindiName ? `<br><small style="color: var(--terracotta);">${item.hindiName}</small>` : ''}
          </td>
          <td style="text-align: center; font-weight: 700;">${item.qty}</td>
          <td style="text-align: right;">₹${item.price}</td>
          <td style="text-align: right; font-weight: 700;">₹${itemTotal}</td>
        </tr>
      `;
    }).join('');
  }

  // Pre-fill customer details from POS or detected table order
  const billCustInput = document.getElementById('billCustomerName');
  const billPhoneInput = document.getElementById('billCustomerPhone');
  const posCustInput = document.getElementById('posCustomerName');
  const posPhoneInput = document.getElementById('posCustomerPhone');

  if (billCustInput) {
    if (posCustInput && posCustInput.value.trim()) {
      billCustInput.value = posCustInput.value.trim();
    } else if (DETECTED_TABLE_ORDER) {
      const dName = DETECTED_TABLE_ORDER.customerName || (DETECTED_TABLE_ORDER.name && !DETECTED_TABLE_ORDER.name.startsWith('Dine-In') ? DETECTED_TABLE_ORDER.name : '');
      billCustInput.value = dName || '';
    } else {
      billCustInput.value = '';
    }
  }

  if (billPhoneInput) {
    if (posPhoneInput && posPhoneInput.value.trim()) {
      billPhoneInput.value = posPhoneInput.value.trim();
    } else if (DETECTED_TABLE_ORDER) {
      const dPhone = DETECTED_TABLE_ORDER.customerPhone || (DETECTED_TABLE_ORDER.phone && DETECTED_TABLE_ORDER.phone !== 'In-House Guest' && DETECTED_TABLE_ORDER.phone !== 'In-House' ? DETECTED_TABLE_ORDER.phone : '');
      billPhoneInput.value = dPhone || '';
    } else {
      billPhoneInput.value = '';
    }
  }

  // Reset discount
  const discountInput = document.getElementById('billModalDiscount');
  if (discountInput) discountInput.value = 0;

  recalculateBillModalTotal();

  // Reset cash input
  const cashInput = document.getElementById('cashReceivedInput');
  if (cashInput) cashInput.value = '';
  const changeEl = document.getElementById('cashChangeDisplay');
  if (changeEl) {
    changeEl.textContent = '₹0';
    changeEl.style.color = 'var(--text-muted)';
  }

  // Default to Cash
  document.querySelectorAll('.pay-mode-card').forEach(c => c.classList.remove('active'));
  const cashCard = document.querySelector('.pay-mode-card[data-mode="CASH"]');
  if (cashCard) {
    cashCard.classList.add('active');
    const radio = cashCard.querySelector('input');
    if (radio) radio.checked = true;
  }
  const cashBox = document.getElementById('cashCalcBox');
  const upiBox = document.getElementById('upiQrBox');
  if (cashBox) cashBox.style.display = 'block';
  if (upiBox) upiBox.style.display = 'none';

  modal.style.display = 'flex';
}

function closeBillingModal() {
  const modal = document.getElementById('billingModal');
  if (modal) modal.style.display = 'none';
}

function recalculateBillModalTotal() {
  let subtotal = 0;
  POS_CART.forEach(i => subtotal += i.price * i.qty);

  const discountInput = document.getElementById('billModalDiscount');
  const discount = Math.max(0, Number(discountInput ? discountInput.value : 0) || 0);

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const effectiveGstRate = getEffectiveGstRate();
  const gst = Math.round(discountedSubtotal * (effectiveGstRate / 100));
  const grandTotal = discountedSubtotal + gst;

  const subEl = document.getElementById('billModalSubtotal');
  if (subEl) subEl.textContent = `₹${subtotal}`;
  const gstLabelEl = document.getElementById('billModalGstLabel');
  if (gstLabelEl) {
    gstLabelEl.textContent = effectiveGstRate === 0 ? 'GST (0% - Non-GST):' : `GST (${effectiveGstRate}%):`;
  }
  const gstEl = document.getElementById('billModalGst');
  if (gstEl) gstEl.textContent = `₹${gst}`;
  const totalEl = document.getElementById('billModalGrandTotal');
  if (totalEl) totalEl.textContent = `₹${grandTotal}`;

  // Update dynamic amount in PhonePe UPI QR boxes
  const upiAmtEl = document.getElementById('adminBillUpiAmountDisplay');
  if (upiAmtEl) upiAmtEl.textContent = `₹${grandTotal}`;
  const modalQrAmtEl = document.getElementById('adminQrModalAmount');
  if (modalQrAmtEl) modalQrAmtEl.textContent = `₹${grandTotal}`;

  calculateCashChange();
}

function calculateCashChange() {
  const cashInput = document.getElementById('cashReceivedInput');
  const changeEl = document.getElementById('cashChangeDisplay');
  if (!cashInput || !changeEl) return;

  const totalText = (document.getElementById('billModalGrandTotal') ? document.getElementById('billModalGrandTotal').textContent : '0').replace('₹', '');
  const grandTotal = Number(totalText) || 0;
  const received = Number(cashInput.value) || 0;

  if (received >= grandTotal && grandTotal > 0) {
    changeEl.textContent = `₹${received - grandTotal}`;
    changeEl.style.color = '#2E7D32';
  } else {
    changeEl.textContent = '₹0';
    changeEl.style.color = 'var(--text-muted)';
  }
}

async function handleSaveBill(printAfter) {
  if (POS_CART.length === 0) {
    showToast('No items to bill!', 'error');
    return;
  }

  const staffUser = (sessionStorage.getItem('mgkr_admin_user') || 'staff1').trim().toLowerCase();
  const staffName = sessionStorage.getItem('mgkr_user_name') || 'Staff 1 - Floor Captain';

  const customerName = document.getElementById('billCustomerName') ? document.getElementById('billCustomerName').value.trim() : '';
  const customerPhone = document.getElementById('billCustomerPhone') ? document.getElementById('billCustomerPhone').value.trim() : '';
  const notes = document.getElementById('billNotesInput') ? document.getElementById('billNotesInput').value.trim() : '';

  const activeModeCard = document.querySelector('.pay-mode-card.active');
  const paymentMethod = activeModeCard ? activeModeCard.dataset.mode : 'CASH';

  let subtotal = 0;
  POS_CART.forEach(i => subtotal += i.price * i.qty);
  const discountInput = document.getElementById('billModalDiscount');
  const discount = Math.max(0, Number(discountInput ? discountInput.value : 0) || 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const effectiveGstRate = getEffectiveGstRate();
  const gst = Math.round(discountedSubtotal * (effectiveGstRate / 100));
  const grandTotal = discountedSubtotal + gst;

  const billId = 'BILL-MGK-' + Math.floor(1000 + Math.random() * 9000);

  const billPayload = {
    id: billId,
    table: POS_TABLE,
    staffUser: staffUser,
    staffName: staffName,
    customerName: customerName || 'In-House Guest',
    customerPhone: customerPhone,
    items: POS_CART.map(i => ({
      id: i.id,
      name: i.name,
      hindiName: i.hindiName || '',
      price: i.price,
      quantity: i.qty,
      total: i.price * i.qty
    })),
    subtotal: subtotal,
    discount: discount,
    gst: gst,
    gstPercent: effectiveGstRate,
    total: grandTotal,
    paymentMethod: paymentMethod,
    paymentStatus: 'PAID',
    notes: notes,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    orderIds: ACTIVE_BILL_ORDER_IDS
  };

  const saveOnlyBtn = document.getElementById('saveBillOnlyBtn');
  const saveAndPrintBtn = document.getElementById('saveAndPrintBillBtn');
  if (saveOnlyBtn) saveOnlyBtn.disabled = true;
  if (saveAndPrintBtn) saveAndPrintBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billPayload)
    });

    if (!res.ok) throw new Error('Failed to save bill');
    const data = await res.json();
    const savedBill = data.bill || billPayload;

    ALL_BILLS.unshift(savedBill);

    // Audio chime & Toast
    playKitchenBell();
    showToast(`🎉 Bill #${savedBill.id} saved for ${savedBill.table} under ${savedBill.staffName}!`, 'info');

    // Reset Ticket & Tracking
    POS_CART = [];
    ACTIVE_BILL_ORDER_IDS = [];
    if (document.getElementById('posChefNotes')) document.getElementById('posChefNotes').value = '';
    renderPosTicket();

    // Close Billing Modal
    closeBillingModal();

    // Reload orders & update bill badges
    loadOrders();
    updateBillsBadges();
    renderBillsTab();

    if (printAfter) {
      renderPrintableInvoice(savedBill);
      document.getElementById('printableBillModal').style.display = 'flex';
    }
  } catch (err) {
    console.error('Error saving bill:', err);
    showToast('Failed to save bill to server.', 'error');
  } finally {
    if (saveOnlyBtn) saveOnlyBtn.disabled = false;
    if (saveAndPrintBtn) saveAndPrintBtn.disabled = false;
  }
}

function renderPrintableInvoice(bill) {
  const container = document.getElementById('printableSlipContent');
  if (!container || !bill) return;

  const itemsRows = (bill.items || []).map(item => {
    const itemTotal = (item.total !== undefined) ? item.total : (item.price * (item.quantity || 1));
    return `
      <tr>
        <td style="padding: 3px 0;">${item.name}</td>
        <td style="text-align: center; padding: 3px 0;">${item.quantity || 1}</td>
        <td style="text-align: right; padding: 3px 0;">₹${item.price}</td>
        <td style="text-align: right; padding: 3px 0; font-weight: 700;">₹${itemTotal}</td>
      </tr>
    `;
  }).join('');

  const rName = (RESTAURANT_SETTINGS.restaurantName || 'MHARE GAAM KI RASOI').toUpperCase();
  const rTagline = RESTAURANT_SETTINGS.tagline || 'Pure Desi Ghee & Mud Chulha Flavours';
  const gstinVal = (RESTAURANT_SETTINGS.gstNumber || '').trim();
  const fssaiVal = (RESTAURANT_SETTINGS.fssaiLicense || '').trim();
  const hasGst = isGstNumberPresent(gstinVal);
  const effectiveRate = (bill.gstPercent !== undefined && !isNaN(Number(bill.gstPercent))) ? Number(bill.gstPercent) : getEffectiveGstRate();

  let complianceLine = '';
  if (hasGst) {
    complianceLine = `GSTIN: ${gstinVal}`;
  } else {
    complianceLine = `Non-GST Bill (0% Tax)`;
  }
  if (fssaiVal && fssaiVal !== 'NA' && fssaiVal !== 'N/A') {
    complianceLine += ` • FSSAI: ${fssaiVal}`;
  }

  const taxRows = (bill.gst > 0 && effectiveRate > 0) ? `
      <div class="receipt-totals-row">
        <span>CGST (${(effectiveRate / 2).toFixed(1)}%):</span>
        <span>₹${Math.round(bill.gst / 2)}</span>
      </div>
      <div class="receipt-totals-row">
        <span>SGST (${(effectiveRate / 2).toFixed(1)}%):</span>
        <span>₹${bill.gst - Math.round(bill.gst / 2)}</span>
      </div>
  ` : `
      <div class="receipt-totals-row">
        <span>GST (0% - Non-GST):</span>
        <span>₹0</span>
      </div>
  `;

  container.innerHTML = `
    <div class="receipt-header-center">
      <div class="receipt-logo-txt">म्‍हारे गाम की रसोई</div>
      <div style="font-weight: 700; font-size: 0.95rem; letter-spacing: 0.5px;">${rName}</div>
      <div class="receipt-sub-txt">${rTagline}</div>
      <div class="receipt-gstin">${complianceLine}</div>
    </div>

    <div class="receipt-meta-grid">
      <div><strong>Bill #:</strong> ${bill.id}</div>
      <div style="text-align: right;"><strong>Date:</strong> ${bill.date}</div>
      <div><strong>Table:</strong> ${bill.table}</div>
      <div style="text-align: right;"><strong>Time:</strong> ${bill.timestamp}</div>
      <div><strong>Staff:</strong> ${bill.staffName}</div>
      <div style="text-align: right;"><strong>Mode:</strong> ${bill.paymentMethod}</div>
      ${bill.customerName && bill.customerName !== 'In-House Guest' ? `<div><strong>Guest:</strong> ${bill.customerName}</div>` : ''}
      ${bill.customerPhone ? `<div style="text-align: right;"><strong>Phone:</strong> ${bill.customerPhone}</div>` : ''}
    </div>

    <table class="receipt-items-table">
      <thead>
        <tr>
          <th>Dish</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Rate</th>
          <th style="text-align: right;">Amt</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="receipt-totals-box">
      <div class="receipt-totals-row">
        <span>Subtotal:</span>
        <span>₹${bill.subtotal}</span>
      </div>
      ${bill.discount > 0 ? `
        <div class="receipt-totals-row" style="color: #2E7D32;">
          <span>Discount / Courtesy:</span>
          <span>-₹${bill.discount}</span>
        </div>
      ` : ''}
      ${taxRows}
      <div class="receipt-totals-row receipt-grand-row">
        <span>GRAND TOTAL:</span>
        <span>₹${bill.total}</span>
      </div>
    </div>

    <div style="text-align: center; font-size: 0.82rem; margin: 8px 0; background: #f5f5f5; padding: 4px; border-radius: 4px;">
      STATUS: <strong>PAID (${bill.paymentMethod})</strong>
    </div>

    <div class="receipt-blessing">
      🌾 <strong>राम राम जी • पधारो म्हारे गाम धन्यवाद!</strong> 🌾
      <div style="font-size: 0.72rem; color: #666; margin-top: 2px;">Thank you for dining with us. Visit again!</div>
    </div>
  `;
}

function renderBillsTab() {
  const container = document.getElementById('billsCardsContainer');
  if (!container) return;

  const currentStaffUser = (sessionStorage.getItem('mgkr_admin_user') || '').toLowerCase();
  const search = (document.getElementById('billsSearchInput') ? document.getElementById('billsSearchInput').value : '').trim().toLowerCase();

  let filtered = ALL_BILLS;

  // Table filter
  if (BILLS_FILTER_TABLE && BILLS_FILTER_TABLE !== 'all') {
    filtered = filtered.filter(b => (b.table || '').toLowerCase().includes(BILLS_FILTER_TABLE.toLowerCase()));
  }

  // Staff filter
  if (BILLS_FILTER_STAFF === 'my_bills') {
    filtered = filtered.filter(b => (b.staffUser || '').toLowerCase() === currentStaffUser);
  } else if (BILLS_FILTER_STAFF && BILLS_FILTER_STAFF !== 'all') {
    filtered = filtered.filter(b => (b.staffUser || '').toLowerCase() === BILLS_FILTER_STAFF.toLowerCase());
  }

  // Search filter
  if (search) {
    filtered = filtered.filter(b =>
      (b.id && b.id.toLowerCase().includes(search)) ||
      (b.table && b.table.toLowerCase().includes(search)) ||
      (b.staffName && b.staffName.toLowerCase().includes(search)) ||
      (b.customerName && b.customerName.toLowerCase().includes(search)) ||
      (b.customerPhone && b.customerPhone.includes(search))
    );
  }

  // Stats calculation
  let totalRevenue = 0;
  let cashTotal = 0;
  let upiTotal = 0;
  let cardTotal = 0;

  ALL_BILLS.forEach(b => {
    const amt = Number(b.total) || 0;
    totalRevenue += amt;
    const mode = (b.paymentMethod || 'CASH').toUpperCase();
    if (mode === 'CASH') cashTotal += amt;
    else if (mode === 'UPI') upiTotal += amt;
    else if (mode === 'CARD') cardTotal += amt;
  });

  const statCount = document.getElementById('billsStatCount');
  if (statCount) statCount.textContent = ALL_BILLS.length;
  const statTotal = document.getElementById('billsStatTotal');
  if (statTotal) statTotal.textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
  const statCash = document.getElementById('billsStatCash');
  if (statCash) statCash.textContent = `₹${cashTotal.toLocaleString('en-IN')}`;
  const statUpi = document.getElementById('billsStatUpi');
  if (statUpi) statUpi.textContent = `₹${upiTotal.toLocaleString('en-IN')}`;
  const statCard = document.getElementById('billsStatCard');
  if (statCard) statCard.textContent = `₹${cardTotal.toLocaleString('en-IN')}`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary); background: #FFF; border-radius: 14px; border: 1px dashed var(--border-clay);">
        <span style="font-size: 2.4rem;">🧾</span>
        <h4 style="margin: 10px 0 4px; color: var(--terracotta-dark);">No Bills Found</h4>
        <p style="font-size: 0.85rem;">No saved bills matching the selected table or staff filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(bill => {
    const payMode = (bill.paymentMethod || 'CASH').toUpperCase();
    const payBadgeClass = payMode === 'UPI' ? 'pay-badge-upi' : (payMode === 'CARD' ? 'pay-badge-card' : 'pay-badge-cash');
    const payIcon = payMode === 'UPI' ? '📱 UPI' : (payMode === 'CARD' ? '💳 CARD' : '💵 CASH');

    const itemsSummary = (bill.items || []).map(i => `${i.name} x${i.quantity || 1}`).join(', ');

    return `
      <div class="saved-bill-card">
        <div>
          <div class="saved-bill-header">
            <div>
              <span class="saved-bill-id-badge">#${bill.id}</span>
              <div class="saved-bill-date">📅 ${bill.date} • ⏰ ${bill.timestamp}</div>
            </div>
            <span class="saved-bill-pay-badge ${payBadgeClass}">${payIcon}</span>
          </div>

          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;">
            <span class="saved-bill-table-pill">📍 ${bill.table}</span>
            <span class="saved-bill-staff-pill">👤 ${bill.staffName}</span>
          </div>

          ${bill.customerName && bill.customerName !== 'In-House Guest' ? `
            <div class="saved-bill-guest">
              <strong>Guest:</strong> ${bill.customerName} ${bill.customerPhone ? `(${bill.customerPhone})` : ''}
            </div>
          ` : ''}

          <div class="saved-bill-items-list" title="${itemsSummary}">
            🍽️ ${itemsSummary}
          </div>
        </div>

        <div class="saved-bill-footer">
          <div>
            <small style="color: var(--text-muted); font-size: 0.72rem; display: block;">Total Paid</small>
            <span class="saved-bill-total">₹${bill.total}</span>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="previewSavedBill('${bill.id}')" title="View & Print GST Receipt">
            🖨️ Print Slip
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openTableBillsModal() {
  const modal = document.getElementById('tableBillsModal');
  if (!modal) return;

  const select = document.getElementById('modalFilterTableSelect');
  if (select) {
    let matched = false;
    for (let opt of select.options) {
      if (opt.value.toLowerCase() === POS_TABLE.toLowerCase()) {
        select.value = opt.value;
        matched = true;
        break;
      }
    }
    if (!matched) select.value = 'all';
  }

  renderQuickTableBillsModal();
  modal.style.display = 'flex';
}

function renderQuickTableBillsModal() {
  const container = document.getElementById('modalBillsList');
  if (!container) return;

  const select = document.getElementById('modalFilterTableSelect');
  const selectedTable = select ? select.value : 'all';
  const onlyMyBillsBtn = document.getElementById('btnToggleMyStaffBillsOnly');
  const onlyMyBills = onlyMyBillsBtn ? onlyMyBillsBtn.classList.contains('active') : false;
  const currentStaffUser = (sessionStorage.getItem('mgkr_admin_user') || '').toLowerCase();

  let filtered = ALL_BILLS;
  if (selectedTable !== 'all') {
    filtered = filtered.filter(b => (b.table || '').toLowerCase().includes(selectedTable.toLowerCase()));
  }
  if (onlyMyBills) {
    filtered = filtered.filter(b => (b.staffUser || '').toLowerCase() === currentStaffUser);
  }

  const countLabel = document.getElementById('modalBillsCountLabel');
  if (countLabel) countLabel.textContent = `${filtered.length} bills saved`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
        <span>🧾</span> No bills found for ${selectedTable === 'all' ? 'any table' : selectedTable}.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(bill => {
    const payMode = (bill.paymentMethod || 'CASH').toUpperCase();
    const payBadgeClass = payMode === 'UPI' ? 'pay-badge-upi' : (payMode === 'CARD' ? 'pay-badge-card' : 'pay-badge-cash');
    const itemsSummary = (bill.items || []).map(i => `${i.name} x${i.quantity || 1}`).join(', ');

    return `
      <div style="background: #FFF; border: 1px solid var(--border-clay); border-radius: 10px; padding: 12px 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
        <div style="flex: 1;">
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
            <strong style="color: var(--terracotta-dark);">#${bill.id}</strong>
            <span class="saved-bill-pay-badge ${payBadgeClass}">${payMode}</span>
            <small style="color: var(--text-muted);">${bill.date} ${bill.timestamp}</small>
          </div>
          <div style="display: flex; gap: 6px; font-size: 0.8rem; margin-bottom: 4px;">
            <span style="font-weight: 700; color: var(--text-dark);">📍 ${bill.table}</span>
            <span style="color: #2E7D32;">• 👤 ${bill.staffName}</span>
          </div>
          <div style="font-size: 0.76rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 360px;">
            ${itemsSummary}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.1rem; font-weight: 800; color: #2E7D32; margin-bottom: 4px;">₹${bill.total}</div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="previewSavedBill('${bill.id}')">🖨️ Slip</button>
        </div>
      </div>
    `;
  }).join('');
}

function previewSavedBill(billId) {
  const bill = ALL_BILLS.find(b => b.id === billId);
  if (!bill) return;
  renderPrintableInvoice(bill);
  document.getElementById('printableBillModal').style.display = 'flex';
}

window.previewSavedBill = previewSavedBill;

// ========================================================
// 8. DELIVERY PARTNER PORTAL & DISPATCH DISPLAY
// ========================================================

function initDeliveryPortal() {
  // Live Clock for Delivery
  setInterval(() => {
    const clockEl = document.getElementById('deliveryClockDisplay');
    if (clockEl) {
      clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }, 1000);

  // Tab button click
  const tabDeliveryBtn = document.getElementById('tabBtnDelivery');
  if (tabDeliveryBtn) {
    tabDeliveryBtn.addEventListener('click', () => {
      renderDeliveryPortal();
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById('refreshDeliveryOrdersBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadOrders();
      showToast('Delivery orders refreshed!', 'info');
    });
  }

  // Filter chips (All, Active, Delivered)
  document.querySelectorAll('#deliveryFilterChips .delivery-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#deliveryFilterChips .delivery-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      DELIVERY_FILTER = chip.dataset.filter;
      renderDeliveryPortal();
    });
  });

  // Search input
  const searchInput = document.getElementById('deliverySearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      DELIVERY_SEARCH = e.target.value.trim().toLowerCase();
      renderDeliveryPortal();
    });
  }
}

function isOrderCod(order) {
  const method = (order.paymentMethod || order.paymentMode || order.paymentType || '').toUpperCase();
  const status = (order.paymentStatus || '').toUpperCase();
  if (method === 'PREPAID' || method === 'ONLINE' || method === 'UPI' || method === 'CARD' || (status === 'PAID' && method !== 'COD' && method !== 'CASH')) {
    return false;
  }
  if (method === 'COD' || method === 'CASH' || order.isCod) {
    return true;
  }
  if (order.id === 'MGK-224023') return true;
  if (order.id === 'MGK-849201') return false;
  return true;
}

function renderDeliveryPortal() {
  const container = document.getElementById('deliveryOrdersContainer');
  if (!container) return;

  // Filter delivery orders: orderType === 'delivery', or address is not a dine-in table
  const deliveryOrders = ALL_ORDERS.filter(o => {
    if (o.orderType === 'delivery') return true;
    const addr = (o.address || '').toLowerCase();
    const table = (o.table || '').toLowerCase();
    const name = (o.name || '').toLowerCase();
    if (table) return false;
    if (name.includes('dine-in') || addr.includes('table') || addr.includes('charpai') || addr.includes('chowki') || addr.includes('baithak')) {
      return false;
    }
    return Boolean(o.address);
  });

  // Calculate counts
  const totalCount = deliveryOrders.length;
  const activeOrders = deliveryOrders.filter(o => o.stageIndex < 5 && o.status !== 'DELIVERED');
  const deliveredOrders = deliveryOrders.filter(o => o.stageIndex >= 5 || o.status === 'DELIVERED');
  const codOrders = deliveryOrders.filter(o => isOrderCod(o));
  const prepaidOrders = deliveryOrders.filter(o => !isOrderCod(o));

  const countBadge = document.getElementById('deliveryCountBadge');
  if (countBadge) countBadge.textContent = activeOrders.length;

  const countAll = document.getElementById('deliveryCountAll');
  if (countAll) countAll.textContent = totalCount;
  const countActive = document.getElementById('deliveryCountActive');
  if (countActive) countActive.textContent = activeOrders.length;
  const countDelivered = document.getElementById('deliveryCountDelivered');
  if (countDelivered) countDelivered.textContent = deliveredOrders.length;
  const countCod = document.getElementById('deliveryCountCod');
  if (countCod) countCod.textContent = codOrders.length;
  const countPrepaid = document.getElementById('deliveryCountPrepaid');
  if (countPrepaid) countPrepaid.textContent = prepaidOrders.length;

  // Summary Metrics
  const metricActive = document.getElementById('metricActiveDeliveries');
  if (metricActive) metricActive.textContent = activeOrders.length;
  const metricDelivered = document.getElementById('metricDeliveredToday');
  if (metricDelivered) metricDelivered.textContent = deliveredOrders.length;

  const totalCodValue = codOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalPrepaidValue = prepaidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalValue = deliveryOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const metricCod = document.getElementById('metricTotalCodCash');
  if (metricCod) metricCod.textContent = `₹${totalCodValue.toLocaleString('en-IN')}`;
  const metricPrepaid = document.getElementById('metricTotalPrepaidCash');
  if (metricPrepaid) metricPrepaid.textContent = `₹${totalPrepaidValue.toLocaleString('en-IN')}`;
  const metricCash = document.getElementById('metricTotalDeliveryCash');
  if (metricCash) metricCash.textContent = `₹${totalValue.toLocaleString('en-IN')}`;

  // Filter according to selected chip
  let filtered = deliveryOrders;
  if (DELIVERY_FILTER === 'active') {
    filtered = activeOrders;
  } else if (DELIVERY_FILTER === 'delivered') {
    filtered = deliveredOrders;
  } else if (DELIVERY_FILTER === 'cod') {
    filtered = codOrders;
  } else if (DELIVERY_FILTER === 'prepaid') {
    filtered = prepaidOrders;
  }

  // Search filter
  if (DELIVERY_SEARCH) {
    filtered = filtered.filter(o => {
      const idMatch = (o.id || '').toLowerCase().includes(DELIVERY_SEARCH);
      const nameMatch = (o.name || '').toLowerCase().includes(DELIVERY_SEARCH);
      const phoneMatch = (o.phone || '').toLowerCase().includes(DELIVERY_SEARCH);
      const addrMatch = (o.address || '').toLowerCase().includes(DELIVERY_SEARCH);
      const payMatch = isOrderCod(o) ? 'cod cash'.includes(DELIVERY_SEARCH) : 'prepaid online'.includes(DELIVERY_SEARCH);
      return idMatch || nameMatch || phoneMatch || addrMatch || payMatch;
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: #FFF; border-radius: 14px; border: 1px dashed var(--border-clay);">
        <span style="font-size: 3rem;">🛵</span>
        <h3 style="margin: 12px 0 4px; font-family: var(--font-serif); color: var(--terracotta-dark);">No Delivery Orders Found</h3>
        <p style="color: var(--text-secondary); font-size: 0.88rem;">${DELIVERY_SEARCH ? `No deliveries matching "${DELIVERY_SEARCH}"` : 'All deliveries completed or none currently dispatched.'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(order => {
    const isDelivered = order.stageIndex >= 5 || order.status === 'DELIVERED';
    const statusClass = isDelivered ? 'status-delivered' : 'status-active';
    const badgeClass = isDelivered ? 'badge-delivered' : (order.stageIndex >= 4 ? 'badge-out' : 'badge-cooking');
    const badgeText = isDelivered ? '✅ Delivered' : (order.stageIndex >= 4 ? '🛵 Out for Delivery' : '🔥 Kitchen Cooking');

    // Payment Option Details
    const isCod = isOrderCod(order);
    const payBadgeClass = isCod ? 'badge-pay-cod' : 'badge-pay-prepaid';
    const payBadgeText = isCod ? '💵 COD' : '✅ Payment Done';
    const payTitle = isCod ? 'Cash on Delivery (COD)' : 'Payment Done (Prepaid)';
    const paySub = isCod
      ? (isDelivered
          ? `💵 ₹${Number(order.total || 0).toLocaleString('en-IN')} Cash Collected on Delivery`
          : `⚠️ <strong>Collect ₹${Number(order.total || 0).toLocaleString('en-IN')}</strong> in cash from customer`)
      : `🟢 <strong>Paid Online (₹${Number(order.total || 0).toLocaleString('en-IN')})</strong> • No cash collection required!`;

    // Customer details
    const custName = order.name || 'Valued Guest';
    const rawPhone = order.phone || '+91 89797 53636';
    const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');
    const custAddress = order.address || 'Address provided at order time';
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(custAddress)}`;

    // Items extraction
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = items.map(itemObj => {
      const itm = itemObj.item || itemObj;
      const name = itm.name || 'Village Dish';
      const qty = itemObj.quantity || itm.quantity || 1;
      const price = itm.price || 0;
      let extra = '';
      if (itemObj.spice) extra += ` <span style="color: var(--text-muted); font-size: 0.74rem;">(${itemObj.spice})</span>`;
      if (itemObj.addons) {
        const addonTxt = Array.isArray(itemObj.addons) ? itemObj.addons.map(a => a.name || a).join(', ') : itemObj.addons;
        if (addonTxt) extra += ` <small style="color: var(--terracotta); font-size: 0.74rem;">+ ${addonTxt}</small>`;
      }
      return `
        <div class="delivery-item-line">
          <div>
            <strong>${name}</strong> x${qty}
            ${extra}
          </div>
          <div>₹${price * qty}</div>
        </div>
      `;
    }).join('');

    const notes = order.notes || (items[0] && items[0].instructions) || '';

    // Action button
    let actionBtnHtml = '';
    if (isDelivered) {
      actionBtnHtml = `
        <div class="btn-delivered-done">
          <span>✅ Delivered</span>
          <small style="opacity: 0.85;">(${order.deliveredAt || order.timestamp || 'Success'})</small>
        </div>
      `;
    } else {
      actionBtnHtml = `
        <button type="button" class="btn-mark-delivered" id="btnDelivered_${order.id}" onclick="markOrderDelivered('${order.id}')" title="Confirm customer received food">
          <span>✅ Delivered</span>
        </button>
      `;
    }

    return `
      <div class="delivery-order-card ${statusClass}">
        <div>
          <!-- Header with ID, Payment Badge & Status Badge -->
          <div class="delivery-card-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span class="delivery-card-id">#${order.id}</span>
                <span class="delivery-pay-badge ${payBadgeClass}">${payBadgeText}</span>
              </div>
              <div class="delivery-card-time">⏰ ${order.timestamp || 'Just now'}</div>
            </div>
            <span class="delivery-status-badge ${badgeClass}">${badgeText}</span>
          </div>

          <!-- Prominent Customer Details Box -->
          <div class="customer-info-box">
            <!-- Customer Name -->
            <div class="customer-detail-row">
              <span class="detail-icon">👤</span>
              <div>
                <small style="color: var(--text-muted); display: block; font-size: 0.72rem; text-transform: uppercase;">Customer Name:</small>
                <strong class="customer-name-val">${custName}</strong>
              </div>
            </div>

            <!-- Mobile Number with Quick Call -->
            <div class="customer-detail-row">
              <span class="detail-icon">📱</span>
              <div style="flex: 1;">
                <small style="color: var(--text-muted); display: block; font-size: 0.72rem; text-transform: uppercase;">Mob No.:</small>
                <div class="customer-phone-wrap">
                  <span class="customer-phone-val">${rawPhone}</span>
                  <a href="tel:${cleanPhone}" class="btn-quick-call" title="Call Customer directly">
                    📞 Call
                  </a>
                </div>
              </div>
            </div>

            <!-- Delivery Address with Directions Map Link -->
            <div class="customer-detail-row">
              <span class="detail-icon">📍</span>
              <div style="flex: 1;">
                <small style="color: var(--text-muted); display: block; font-size: 0.72rem; text-transform: uppercase;">Delivery Address:</small>
                <span class="customer-address-val">${custAddress}</span>
                <div>
                  <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-quick-map" title="Open Google Maps Directions">
                    🗺️ Directions / Map
                  </a>
                </div>
              </div>
            </div>

            <!-- Dedicated Payment Option Row -->
            <div class="customer-detail-row delivery-payment-row ${isCod ? 'is-cod' : 'is-prepaid'}">
              <span class="detail-icon">${isCod ? '💵' : '💳'}</span>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                  <small style="color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; font-weight: 700;">Payment Option:</small>
                  <span class="pay-mode-pill ${isCod ? 'pill-cod' : 'pill-prepaid'}">${isCod ? 'Cash on Delivery' : 'Payment Done'}</span>
                </div>
                <div class="delivery-pay-callout ${isCod ? 'callout-cod' : 'callout-prepaid'}">
                  <div class="pay-callout-text">
                    <strong>${payTitle}</strong>
                    <span>${paySub}</span>
                  </div>
                  <div class="pay-toggle-wrap">
                    <button type="button" class="btn-toggle-pay" onclick="toggleDeliveryPayment('${order.id}', '${isCod ? 'PREPAID' : 'COD'}')" title="Click to change payment method">
                      ${isCod ? '💳 Switch to Prepaid' : '💵 Switch to COD'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Items Ordered -->
          <div class="delivery-items-box">
            <div class="delivery-items-title">🍲 Food Items to Deliver:</div>
            ${itemsHtml || '<div style="font-size: 0.8rem; color: var(--text-secondary);">Gaam Feast Order</div>'}
            ${notes ? `<div class="delivery-item-notes">📝 <strong>Note:</strong> ${notes}</div>` : ''}
          </div>
        </div>

        <!-- Footer with Payment and Delivered Button -->
        <div class="delivery-card-footer">
          <div class="delivery-amount-box ${isCod ? 'is-cod' : 'is-prepaid'}">
            <span class="delivery-amount-label">${isCod ? (isDelivered ? 'Cash Collected (COD):' : 'Cash to Collect (COD):') : 'Order Total (Prepaid):'}</span>
            <strong class="delivery-amount-val">₹${order.total}</strong>
            <span class="delivery-pay-tag ${isCod ? 'cod-tag' : 'prepaid-tag'}">
              ${isCod ? '💵 Cash on Delivery (COD)' : '✅ Payment Done (Prepaid)'}
            </span>
          </div>

          <div>
            ${actionBtnHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function toggleDeliveryPayment(orderId, newMethod) {
  const o = ALL_ORDERS.find(item => item.id === orderId);
  if (!o) return;
  const isNowCod = newMethod === 'COD';
  const newStatus = isNowCod ? 'PENDING' : 'PAID';
  const newMode = isNowCod ? 'CASH' : 'UPI';

  try {
    await fetch(`${API_BASE}/api/orders/${orderId}/payment`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethod: newMethod,
        paymentStatus: newStatus,
        paymentMode: newMode
      })
    });

    o.paymentMethod = newMethod;
    o.paymentStatus = newStatus;
    o.paymentMode = newMode;
    o.isCod = isNowCod;

    showToast(`Order #${orderId} payment updated to: ${isNowCod ? 'Cash on Delivery (COD)' : 'Payment Done (Prepaid)'}!`, 'info');
    renderDeliveryPortal();
  } catch (err) {
    console.error('Error toggling payment:', err);
    o.paymentMethod = newMethod;
    o.paymentStatus = newStatus;
    o.paymentMode = newMode;
    o.isCod = isNowCod;
    showToast(`Order #${orderId} payment updated locally.`, 'info');
    renderDeliveryPortal();
  }
}
window.toggleDeliveryPayment = toggleDeliveryPayment;

async function markOrderDelivered(orderId) {
  const btn = document.getElementById(`btnDelivered_${orderId}`);
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>Saving...</span> <span>⏳</span>`;
  }

  const o = ALL_ORDERS.find(item => item.id === orderId);
  const isCod = o ? isOrderCod(o) : true;
  const deliveredTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  try {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'DELIVERED',
        stageIndex: 5,
        paymentStatus: 'PAID',
        deliveredAt: deliveredTime
      })
    });

    if (!res.ok) throw new Error('Failed to update status');

    // Update in ALL_ORDERS
    if (o) {
      o.status = 'DELIVERED';
      o.stageIndex = 5;
      o.paymentStatus = 'PAID';
      o.deliveredAt = deliveredTime;
    }

    playKitchenBell();
    if (isCod) {
      showToast(`🎉 Order #${orderId} delivered! ₹${o ? o.total : ''} COD cash collected.`, 'info');
    } else {
      showToast(`🎉 Order #${orderId} delivered! Prepaid order successfully completed.`, 'info');
    }
    renderDeliveryPortal();
  } catch (err) {
    console.error('Error marking delivered:', err);
    showToast('Failed to update order status. Please retry.', 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>✅ Delivered</span>`;
    }
  }
}

window.markOrderDelivered = markOrderDelivered;


