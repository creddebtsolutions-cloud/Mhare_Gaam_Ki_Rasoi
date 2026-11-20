/**
 * Mhare Gaam Ki Rasoi - Main Application Orchestrator
 * Controls role switching, device frame emulation, and initial boot.
 */

const MainApp = {
  currentRole: 'CUSTOMER', // CUSTOMER, ADMIN, CHEF, BILL_COUNTER
  isFramed: true,

  init() {
    this.detectRouteRole();
    this.bindRoleSwitcher();
    this.bootActiveRole();
  },

  detectRouteRole() {
    const path = window.location.pathname.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const isStandaloneApp = urlParams.get('app') === '1' || 
                            urlParams.get('standalone') === '1' || 
                            window.matchMedia('(display-mode: standalone)').matches;

    if (isStandaloneApp) {
      // Production Google Play Store / PWA App mode: hide demo role switcher
      const toolbar = document.getElementById('globalRoleToolbar');
      if (toolbar) toolbar.style.display = 'none';
      this.currentRole = 'CUSTOMER';
      this.isFramed = false;
      return;
    }

    if (path.includes('/admin')) {
      this.currentRole = 'ADMIN';
      this.isFramed = false;
    } else if (path.includes('/chef')) {
      this.currentRole = 'CHEF';
      this.isFramed = false;
    } else if (path.includes('/pos')) {
      this.currentRole = 'BILL_COUNTER';
      this.isFramed = false;
    } else if (path.includes('/delivery')) {
      this.currentRole = 'DELIVERY_AGENT';
      this.isFramed = false;
    } else {
      this.currentRole = 'CUSTOMER';
      // Default to mobile framed view for desktop testing of mobile customer app
      this.isFramed = window.innerWidth > 768;
    }
  },

  bindRoleSwitcher() {
    const roleSelect = document.getElementById('globalRoleSelect');
    const frameBtn = document.getElementById('globalFrameToggleBtn');
    const wrapper = document.getElementById('deviceFrameWrapper');

    if (roleSelect) {
      roleSelect.value = this.currentRole;
      roleSelect.addEventListener('change', (e) => {
        this.switchRole(e.target.value);
      });
    }

    if (frameBtn && wrapper) {
      frameBtn.addEventListener('click', () => {
        this.isFramed = !this.isFramed;
        wrapper.classList.toggle('full-screen', !this.isFramed);
        frameBtn.innerText = this.isFramed ? '📱 Fullscreen' : '📱 Mobile Frame';
      });

      wrapper.classList.toggle('full-screen', !this.isFramed);
      frameBtn.innerText = this.isFramed ? '📱 Fullscreen' : '📱 Mobile Frame';
    }
  },

  switchRole(role) {
    this.currentRole = role;
    const wrapper = document.getElementById('deviceFrameWrapper');
    const frameBtn = document.getElementById('globalFrameToggleBtn');

    // Admin, Chef, and POS look best fullscreen; Customer looks great framed or fullscreen
    if (role !== 'CUSTOMER') {
      this.isFramed = false;
      if (wrapper) wrapper.classList.add('full-screen');
      if (frameBtn) frameBtn.style.display = 'none';
    } else {
      this.isFramed = window.innerWidth > 768;
      if (wrapper) wrapper.classList.toggle('full-screen', !this.isFramed);
      if (frameBtn) frameBtn.style.display = 'block';
    }

    this.bootActiveRole();
  },

  bootActiveRole() {
    // Hide all main portal views
    const customerView = document.getElementById('portalCustomer');
    const adminView = document.getElementById('portalAdmin');
    const chefView = document.getElementById('portalChef');
    const posView = document.getElementById('portalPos');
    const deliveryView = document.getElementById('portalDelivery');

    if (customerView) customerView.style.display = 'none';
    if (adminView) adminView.style.display = 'none';
    if (chefView) chefView.style.display = 'none';
    if (posView) posView.style.display = 'none';
    if (deliveryView) deliveryView.style.display = 'none';

    if (this.currentRole === 'CUSTOMER') {
      if (customerView) customerView.style.display = 'block';
      CustomerApp.init();
      RasoiSaathi.init();
    } else if (this.currentRole === 'ADMIN') {
      if (adminView) adminView.style.display = 'block';
      AdminApp.init();
    } else if (this.currentRole === 'CHEF') {
      if (chefView) chefView.style.display = 'block';
      KdsApp.init();
    } else if (this.currentRole === 'BILL_COUNTER') {
      if (posView) posView.style.display = 'block';
      PosApp.init();
    } else if (this.currentRole === 'DELIVERY_AGENT') {
      if (deliveryView) deliveryView.style.display = 'block';
      DeliveryApp.init();
    }
  },

  // Auth quick modal login helper
  openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('active');
  },

  async handleQuickLogin(role) {
    let username = '';
    let password = '';

    if (role === 'ADMIN') {
      username = 'Admin';
      password = 'Admin@1234';
    } else if (role === 'CHEF') {
      username = 'Chef';
      password = 'Chef@1234';
    } else if (role === 'BILL_COUNTER') {
      username = 'Bill';
      password = 'Bill@1234';
    } else if (role === 'DELIVERY_ADMIN') {
      username = 'delivery';
      password = 'Delivery@1234';
    } else if (role === 'DELIVERY_AGENT') {
      username = '9876500001';
      password = 'Agent@1234';
    } else if (role === 'CUSTOMER') {
      username = 'Gaurav';
      password = 'Customer@1234';
    }

    try {
      const res = await RasoiAPI.login(username, password);
      if (res.success) {
        RasoiAPI.setToken(res.token);
        RasoiAPI.setCurrentUser(res.user);
        RasoiAPI.showToast(res.message);
        document.getElementById('authModal').classList.remove('active');

        // Update greeting
        const gName = document.getElementById('customerGreetingName');
        if (gName) gName.innerText = res.user.name.split(' ')[0];

        // If admin/chef/bill/delivery logged in, switch to their portal
        if (res.user.role === 'SUPER_ADMIN') this.switchRole('ADMIN');
        else if (res.user.role === 'CHEF') this.switchRole('CHEF');
        else if (res.user.role === 'BILL_COUNTER') this.switchRole('BILL_COUNTER');
        else if (res.user.role === 'DELIVERY_ADMIN' || res.user.role === 'DELIVERY_AGENT') this.switchRole('DELIVERY_AGENT');
        else CustomerApp.renderHome();
      }
    } catch (err) {
      RasoiAPI.showToast(err.message || 'Login failed');
    }
  },

  async handleManualLogin() {
    const identEl = document.getElementById('manualAuthIdentifier');
    const pwdEl = document.getElementById('manualAuthPassword');
    const username = identEl ? identEl.value.trim() : '';
    const password = pwdEl ? pwdEl.value.trim() : '';

    if (!username || !password) {
      RasoiAPI.showToast('Kripya Login ID aur Password darj karein');
      return;
    }

    try {
      const res = await RasoiAPI.login(username, password);
      if (res.success) {
        RasoiAPI.setToken(res.token);
        RasoiAPI.setCurrentUser(res.user);
        RasoiAPI.showToast(res.message);
        const modal = document.getElementById('authModal');
        if (modal) modal.classList.remove('active');

        // Update greeting
        const gName = document.getElementById('customerGreetingName');
        if (gName) gName.innerText = res.user.name.split(' ')[0];

        // If admin/chef/bill/delivery logged in, switch to their portal
        if (res.user.role === 'SUPER_ADMIN') this.switchRole('ADMIN');
        else if (res.user.role === 'CHEF') this.switchRole('CHEF');
        else if (res.user.role === 'BILL_COUNTER') this.switchRole('BILL_COUNTER');
        else if (res.user.role === 'DELIVERY_ADMIN' || res.user.role === 'DELIVERY_AGENT') this.switchRole('DELIVERY_AGENT');
        else CustomerApp.renderHome();
      }
    } catch (err) {
      RasoiAPI.showToast(err.message || 'Login asafal raha');
    }
  },

  async handleCustomerOtpSubmit() {
    const phone = document.getElementById('authPhoneInput').value.trim();
    const name = document.getElementById('authNameInput').value.trim() || 'Valued Guest';

    if (!phone || phone.length < 10) {
      RasoiAPI.showToast('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const res = await RasoiAPI.customerOtpLogin(phone, name);
      if (res.success) {
        RasoiAPI.setToken(res.token);
        RasoiAPI.setCurrentUser(res.user);
        RasoiAPI.showToast(res.message);
        document.getElementById('authModal').classList.remove('active');
        const gName = document.getElementById('customerGreetingName');
        if (gName) gName.innerText = res.user.name.split(' ')[0];
        CustomerApp.renderHome();
      }
    } catch (err) {
      RasoiAPI.showToast(err.message || 'OTP verification failed');
    }
  },

  handleLogout() {
    RasoiAPI.setToken(null);
    RasoiAPI.setCurrentUser(null);
    RasoiAPI.showToast('Aap safalta-purvak logout ho gaye hain. Ram Ram! 🙏');
    const gName = document.getElementById('customerGreetingName');
    if (gName) gName.innerText = 'Guest';
    this.switchRole('CUSTOMER');
  }
};

window.addEventListener('DOMContentLoaded', () => {
  MainApp.init();
});
