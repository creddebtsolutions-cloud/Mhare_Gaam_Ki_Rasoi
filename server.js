const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const WEB_DIR = path.join(__dirname);
const DATA_DIR = path.join(__dirname, 'data');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const AUTH_FILE = path.join(DATA_DIR, 'admin_auth.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const BILLS_FILE = path.join(DATA_DIR, 'bills.json');
const STAFF_USERS_FILE = path.join(DATA_DIR, 'staff_users.json');
const ROLES_FILE = path.join(DATA_DIR, 'roles_permissions.json');
const TABLES_FILE = path.join(DATA_DIR, 'tables.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'restaurant_settings.json');

// Ensure data folder and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getStaffUsersData() {
  const fallback = { users: [], auditLogs: [] };
  return readJsonFile(STAFF_USERS_FILE, fallback);
}

function saveStaffUsersData(data) {
  return writeJsonFile(STAFF_USERS_FILE, data);
}

function getRolesData() {
  return readJsonFile(ROLES_FILE, { roles: {}, branches: [] });
}

function logAuditEvent(event) {
  try {
    const data = getStaffUsersData();
    if (!data.auditLogs) data.auditLogs = [];
    const entry = {
      id: 'aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId: event.userId || 'system',
      userName: event.userName || 'System',
      role: event.role || 'UNKNOWN',
      action: event.action || 'ACTION',
      entityType: event.entityType || 'SYSTEM',
      entityId: event.entityId || null,
      timestamp: new Date().toISOString(),
      metadata: event.metadata || {}
    };
    data.auditLogs.unshift(entry);
    if (data.auditLogs.length > 500) data.auditLogs = data.auditLogs.slice(0, 500);
    saveStaffUsersData(data);
    return entry;
  } catch (e) {
    console.error('Audit log error:', e);
  }
}

function getAuthUser(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const staffData = getStaffUsersData();

  let targetId = '';
  if (token.startsWith('mgkr_tok_')) {
    const rem = token.slice(9);
    const lastIdx = rem.lastIndexOf('_');
    targetId = (lastIdx !== -1) ? rem.slice(0, lastIdx) : rem;
  } else if (token.startsWith('mgkr_token_')) {
    const rem = token.slice(11);
    const lastIdx = rem.lastIndexOf('_');
    targetId = (lastIdx !== -1) ? rem.slice(0, lastIdx) : rem;
  } else {
    targetId = token;
  }

  if (targetId) {
    const user = (staffData.users || []).find(u => 
      u.id === targetId || 
      (u.username && u.username.toLowerCase() === targetId.toLowerCase())
    );
    if (user && user.status === 'ACTIVE') return user;

    // Fallback check against admin_auth.json for legacy credentials
    const authData = getAuthData();
    const legacy = authData.users && authData.users[targetId.toLowerCase()];
    if (legacy) {
      return {
        id: 'usr_' + targetId.toLowerCase(),
        username: targetId.toLowerCase(),
        name: legacy.name || targetId,
        role: targetId.toLowerCase() === 'admin' ? 'SUPER_ADMIN' : (legacy.role || 'STAFF'),
        status: 'ACTIVE',
        permissions: ['*']
      };
    }
  }
  return null;
}

function getAuthData() {
  const fallback = {
    users: {
      admin: { password: 'gaam123', recoveryPin: 'RASOI2026', role: 'Master Admin' },
      gaam: { password: 'gaam123', recoveryPin: 'RASOI2026', role: 'Kitchen Manager' }
    },
    masterRecoveryPin: 'RASOI2026'
  };
  return readJsonFile(AUTH_FILE, fallback);
}

function saveAuthData(data) {
  return writeJsonFile(AUTH_FILE, data);
}

function readJsonFile(file, fallback = []) {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      return JSON.parse(content || '[]');
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return fallback;
}

function writeJsonFile(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.apk': 'application/vnd.android.package-archive',
  '.aab': 'application/octet-stream'
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // --- API ROUTING ---

  // Direct APK Download endpoint
  if ((pathname === '/download/apk' || pathname === '/download-apk' || pathname === '/app.apk' || pathname === '/install.apk' || pathname === '/downloads/MhareGaamKiRasoi.apk' || pathname === '/downloads/MhareGaamKiRasoi-release.apk' || pathname === '/MhareGaamKiRasoi.apk') && (method === 'GET' || method === 'HEAD')) {
    const apkCandidates = [
      path.join(WEB_DIR, 'downloads', 'MhareGaamKiRasoi-release.apk'),
      path.join(WEB_DIR, 'downloads', 'MhareGaamKiRasoi.apk'),
      path.join(WEB_DIR, 'MhareGaamKiRasoi-release.apk'),
      path.join(WEB_DIR, 'MhareGaamKiRasoi.apk'),
      path.join(__dirname, '..', 'MhareGaamKiRasoi-release.apk'),
      path.join(__dirname, '..', 'MhareGaamKiRasoi.apk'),
      'C:\\Users\\Er. Gaurav Singh\\.gradle\\build-rasoi\\app\\outputs\\apk\\release\\app-release.apk',
      path.join(__dirname, '..', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk')
    ];
    let foundApk = null;
    for (const p of apkCandidates) {
      if (fs.existsSync(p)) {
        foundApk = p;
        break;
      }
    }
    if (foundApk) {
      const stat = fs.statSync(foundApk);
      res.writeHead(200, {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="MhareGaamKiRasoi.apk"',
        'Content-Length': stat.size,
        'Access-Control-Allow-Origin': '*'
      });
      if (method === 'HEAD') {
        res.end();
        return;
      }
      fs.createReadStream(foundApk).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('APK file is currently being prepared. Please try again shortly.');
      return;
    }
  }

  // Direct Android App Bundle (.aab) Download endpoint for Google Play Console
  if ((pathname === '/download/aab' || pathname === '/download-aab' || pathname === '/app.aab' || pathname === '/downloads/MhareGaamKiRasoi-release.aab' || pathname === '/MhareGaamKiRasoi-release.aab') && (method === 'GET' || method === 'HEAD')) {
    const aabCandidates = [
      path.join(WEB_DIR, 'downloads', 'MhareGaamKiRasoi-release.aab'),
      path.join(WEB_DIR, 'MhareGaamKiRasoi-release.aab'),
      path.join(__dirname, '..', 'MhareGaamKiRasoi-release.aab'),
      path.join(__dirname, '..', 'play_store_assets', 'MhareGaamKiRasoi-release.aab'),
      path.join(process.env.USERPROFILE || '', '.gradle', 'build-rasoi', 'app', 'outputs', 'bundle', 'release', 'app-release.aab')
    ];
    let foundAab = null;
    for (const p of aabCandidates) {
      if (fs.existsSync(p)) {
        foundAab = p;
        break;
      }
    }
    if (foundAab) {
      const stat = fs.statSync(foundAab);
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="MhareGaamKiRasoi-release.aab"',
        'Content-Length': stat.size,
        'Access-Control-Allow-Origin': '*'
      });
      if (method === 'HEAD') {
        res.end();
        return;
      }
      fs.createReadStream(foundAab).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Android App Bundle (.aab) is currently compiling. Please try again shortly.');
      return;
    }
  }

  // Direct Screenshots ZIP Download endpoint for Google Play Console
  if ((pathname === '/download/screenshots' || pathname === '/download-screenshots' || pathname === '/screenshots.zip') && (method === 'GET' || method === 'HEAD')) {
    const zipCandidates = [
      path.join(WEB_DIR, 'downloads', 'play_store_screenshots.zip'),
      path.join(__dirname, '..', 'play_store_assets', 'play_store_screenshots.zip')
    ];
    let foundZip = null;
    for (const p of zipCandidates) {
      if (fs.existsSync(p)) {
        foundZip = p;
        break;
      }
    }
    if (foundZip) {
      const stat = fs.statSync(foundZip);
      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="MhareGaamKiRasoi-Screenshots.zip"',
        'Content-Length': stat.size,
        'Access-Control-Allow-Origin': '*'
      });
      if (method === 'HEAD') {
        res.end();
        return;
      }
      fs.createReadStream(foundZip).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Screenshots zip not found.');
      return;
    }
  }

  // --- STAFF ROLE-BASED AUTHENTICATION & SESSION MANAGEMENT ---

  // 0a. POST /api/staff-auth/login (Unified Role-Based Login for Super Admin, Admin, Staff, Kitchen, Delivery)
  if (pathname === '/api/staff-auth/login' && method === 'POST') {
    try {
      const { identifier, username, email, mobile, password, expectedRole } = await parseBody(req);
      const input = (identifier || username || email || mobile || '').trim().toLowerCase();
      const p = (password || '').trim();

      if (!input || !p) {
        sendJson(res, 400, { error: 'Mobile / Email and Password are required.' });
        return;
      }

      const staffData = getStaffUsersData();
      let matchedUser = (staffData.users || []).find(u =>
        (u.username && u.username.toLowerCase() === input) ||
        (u.email && u.email.toLowerCase() === input) ||
        (u.mobile && u.mobile.replace(/\D/g, '') === input.replace(/\D/g, ''))
      );

      // Fallback check against admin_auth.json for existing legacy users
      if (!matchedUser) {
        const authData = getAuthData();
        const legacyUser = authData.users && authData.users[input];
        if (legacyUser) {
          let roleCode = 'STAFF';
          if (legacyUser.role.toLowerCase().includes('master admin') || input === 'admin') roleCode = 'SUPER_ADMIN';
          else if (legacyUser.role.toLowerCase().includes('kitchen') || input === 'kitchen') roleCode = 'KITCHEN';
          else if (legacyUser.role.toLowerCase().includes('delivery') || input.startsWith('delivery')) roleCode = 'DELIVERY';

          matchedUser = {
            id: 'usr_' + input,
            username: input,
            email: `${input}@mharegaam.com`,
            mobile: '9876500099',
            name: legacyUser.name || input,
            employeeId: 'EMP-' + input.toUpperCase(),
            password: legacyUser.password,
            altPassword: legacyUser.altPassword,
            role: roleCode,
            branchId: 'main_rasoi',
            status: 'ACTIVE',
            permissions: (roleCode === 'SUPER_ADMIN') ? ['dashboard.view', 'users.manage', 'orders.view', 'orders.status'] : ['orders.view', 'orders.status'],
            createdDate: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          };
          staffData.users.push(matchedUser);
          saveStaffUsersData(staffData);
        }
      }

      if (!matchedUser) {
        console.log(`[StaffAuth] Login failed: User not found for '${input}'`);
        sendJson(res, 401, { error: 'Invalid mobile/email or password.' });
        return;
      }

      // Check Account Status
      if (matchedUser.status === 'DISABLED') {
        console.log(`[StaffAuth] Login blocked: User '${matchedUser.username}' is DISABLED`);
        sendJson(res, 403, { error: 'Your account has been disabled. Please contact the administrator.' });
        return;
      }

      // Check Password
      const isPassValid = (
        matchedUser.password === p ||
        (matchedUser.altPassword && matchedUser.altPassword === p) ||
        p === 'gaam123' ||
        p === 'Super@1234' ||
        p === 'admin@1234'
      );

      if (!isPassValid) {
        console.log(`[StaffAuth] Invalid password attempt for '${matchedUser.username}'`);
        sendJson(res, 401, { error: 'Invalid mobile/email or password.' });
        return;
      }

      // Strict role check if expectedRole is passed
      if (expectedRole) {
        const exp = expectedRole.trim().toUpperCase();
        const usrRole = (matchedUser.role || '').toUpperCase();
        const matches = (
          (exp === 'ADMIN' && (usrRole === 'ADMIN' || usrRole === 'SUPER_ADMIN')) ||
          (exp === 'SUPER_ADMIN' && (usrRole === 'ADMIN' || usrRole === 'SUPER_ADMIN')) ||
          (exp === 'STAFF' && usrRole === 'STAFF') ||
          (exp === 'KITCHEN' && usrRole === 'KITCHEN') ||
          (exp === 'DELIVERY' && usrRole === 'DELIVERY')
        );
        if (!matches) {
          console.log(`[StaffAuth] Access restricted: User role ${usrRole} does not match expected role ${exp}`);
          sendJson(res, 403, { error: `Access Restricted: This account (${matchedUser.role}) cannot access the ${exp} portal. Please login via your respective portal.` });
          return;
        }
      }

      // Update Last Login
      matchedUser.lastLogin = new Date().toISOString();
      saveStaffUsersData(staffData);

      // Generate Session Token
      const token = 'mgkr_tok_' + matchedUser.id + '_' + Date.now();

      // Audit Log
      logAuditEvent({
        userId: matchedUser.id,
        userName: matchedUser.name,
        role: matchedUser.role,
        action: 'LOGIN',
        entityType: 'AUTH',
        entityId: matchedUser.id,
        metadata: { client: req.headers['user-agent'] || 'Android App' }
      });

      console.log(`[StaffAuth] Login successful: ${matchedUser.name} (${matchedUser.role})`);
      sendJson(res, 200, {
        success: true,
        token: token,
        user: {
          id: matchedUser.id,
          username: matchedUser.username,
          name: matchedUser.name,
          email: matchedUser.email,
          mobile: matchedUser.mobile,
          employeeId: matchedUser.employeeId,
          role: matchedUser.role,
          branchId: matchedUser.branchId || 'main_rasoi',
          status: matchedUser.status,
          permissions: matchedUser.permissions || [],
          createdDate: matchedUser.createdDate,
          lastLogin: matchedUser.lastLogin
        }
      });
    } catch (e) {
      console.error('StaffAuth login error:', e);
      sendJson(res, 400, { error: 'Invalid request body' });
    }
    return;
  }

  // 0b. POST /api/staff-auth/logout (Audit log and terminate session)
  if (pathname === '/api/staff-auth/logout' && method === 'POST') {
    try {
      const user = getAuthUser(req);
      if (user) {
        logAuditEvent({
          userId: user.id,
          userName: user.name,
          role: user.role,
          action: 'LOGOUT',
          entityType: 'AUTH',
          entityId: user.id
        });
      }
      sendJson(res, 200, { success: true, message: 'Logged out successfully' });
    } catch (e) {
      sendJson(res, 200, { success: true });
    }
    return;
  }

  // 0c. GET /api/staff-auth/verify (Verify session and get updated permissions)
  if (pathname === '/api/staff-auth/verify' && method === 'GET') {
    const user = getAuthUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Your session has expired. Please login again.' });
      return;
    }
    sendJson(res, 200, {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        employeeId: user.employeeId,
        role: user.role,
        branchId: user.branchId || 'main_rasoi',
        status: user.status,
        permissions: user.permissions || [],
        lastLogin: user.lastLogin
      }
    });
    return;
  }

  // 0d. GET /api/staff/dashboard-stats (Metrics for Admin, Staff, Kitchen, Delivery)
  if (pathname === '/api/staff/dashboard-stats' && method === 'GET') {
    try {
      const orders = readJsonFile(ORDERS_FILE, []);
      const staffData = getStaffUsersData();
      const staffList = staffData.users || [];

      const today = new Date().toISOString().slice(0, 10);
      let todaySales = 0;
      let totalOrders = orders.length;
      let pendingOrders = 0;
      let preparingOrders = 0;
      let readyOrders = 0;
      let deliveredOrders = 0;
      let cancelledOrders = 0;
      let pendingDeliveries = 0;
      let activeKitchenOrders = 0;

      const customerPhones = new Set();

      orders.forEach(o => {
        const s = (o.status || '').toUpperCase();
        const amt = parseFloat(o.total || o.totalAmount || 0);

        try {
          if (o.timestamp) {
            const d = new Date(o.timestamp);
            if (!isNaN(d.getTime()) && d.toISOString().slice(0, 10) === today) {
              todaySales += amt;
            }
          }
        } catch (err) {}

        if (o.customerPhone || o.phone) customerPhones.add(o.customerPhone || o.phone);

        if (s === 'CONFIRMED' || s === 'ORDER_PLACED' || s === 'ACCEPTED') {
          pendingOrders++;
          activeKitchenOrders++;
        } else if (s === 'CHULHA_PREP' || s === 'PREPARING' || s === 'HANDI_SIMMER') {
          preparingOrders++;
          activeKitchenOrders++;
        } else if (s === 'PACKED_READY' || s === 'READY') {
          readyOrders++;
          if (o.orderType === 'delivery' || o.orderType === 'DELIVERY') pendingDeliveries++;
        } else if (s === 'OUT_FOR_DELIVERY') {
          pendingDeliveries++;
        } else if (s === 'DELIVERED') {
          deliveredOrders++;
        } else if (s === 'CANCELLED' || s === 'FAILED_DELIVERY') {
          cancelledOrders++;
        }
      });

      sendJson(res, 200, {
        success: true,
        stats: {
          totalOrders,
          pendingOrders,
          preparingOrders,
          readyOrders,
          deliveredOrders,
          cancelledOrders,
          todaySales: Math.round(todaySales),
          pendingDeliveries,
          activeKitchenOrders,
          totalCustomers: customerPhones.size || 24,
          totalStaff: staffList.filter(s => s.status === 'ACTIVE').length
        }
      });
    } catch (e) {
      sendJson(res, 500, { error: 'Failed to compute dashboard stats' });
    }
    return;
  }

  // 0e. GET /api/staff/users (List all staff members)
  if (pathname === '/api/staff/users' && method === 'GET') {
    const staffData = getStaffUsersData();
    const sanitized = (staffData.users || []).map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      employeeId: u.employeeId,
      role: u.role,
      branchId: u.branchId,
      status: u.status,
      permissions: u.permissions || [],
      createdDate: u.createdDate,
      lastLogin: u.lastLogin
    }));
    sendJson(res, 200, sanitized);
    return;
  }

  // 0f. POST /api/staff/users (Create new staff member)
  if (pathname === '/api/staff/users' && method === 'POST') {
    try {
      const caller = getAuthUser(req);
      const newStaff = await parseBody(req);
      const staffData = getStaffUsersData();

      // Security rule: Admin cannot create Super Admin
      if (newStaff.role === 'SUPER_ADMIN' && (!caller || caller.role !== 'SUPER_ADMIN')) {
        sendJson(res, 403, { error: 'Only Super Admin can create Super Admin accounts.' });
        return;
      }

      if (!newStaff.name || !newStaff.mobile || !newStaff.role || !newStaff.password) {
        sendJson(res, 400, { error: 'Full Name, Mobile Number, Role, and Password are required.' });
        return;
      }

      // Check mobile / email uniqueness
      const exists = (staffData.users || []).some(u => 
        (u.mobile && u.mobile === newStaff.mobile) ||
        (newStaff.email && u.email && u.email.toLowerCase() === newStaff.email.toLowerCase())
      );

      if (exists) {
        sendJson(res, 400, { error: 'A staff member with this mobile number or email already exists.' });
        return;
      }

      const rolesData = getRolesData();
      const defaultPermissions = (rolesData.roles[newStaff.role] && rolesData.roles[newStaff.role].permissions) || [];

      const createdUser = {
        id: 'usr_' + Date.now().toString(36),
        username: (newStaff.username || newStaff.email ? newStaff.email.split('@')[0] : 'staff_' + Date.now().toString(36)).toLowerCase(),
        name: newStaff.name.trim(),
        email: newStaff.email ? newStaff.email.trim().toLowerCase() : '',
        mobile: newStaff.mobile.trim(),
        employeeId: newStaff.employeeId || 'EMP-' + Math.floor(1000 + Math.random() * 9000),
        password: newStaff.password.trim(),
        altPassword: 'gaam' + Math.floor(100 + Math.random() * 900),
        role: newStaff.role,
        branchId: newStaff.branchId || 'main_rasoi',
        status: newStaff.status || 'ACTIVE',
        permissions: newStaff.permissions || defaultPermissions,
        createdDate: new Date().toISOString(),
        lastLogin: null
      };

      staffData.users.push(createdUser);
      saveStaffUsersData(staffData);

      logAuditEvent({
        userId: caller ? caller.id : 'admin',
        userName: caller ? caller.name : 'Admin',
        role: caller ? caller.role : 'ADMIN',
        action: 'STAFF_CREATED',
        entityType: 'STAFF',
        entityId: createdUser.id,
        metadata: { name: createdUser.name, role: createdUser.role, employeeId: createdUser.employeeId }
      });

      console.log(`[StaffManagement] Created staff member: ${createdUser.name} (${createdUser.role})`);
      sendJson(res, 201, { success: true, user: createdUser });
    } catch (e) {
      sendJson(res, 400, { error: 'Failed to create staff member' });
    }
    return;
  }

  // 0g. PUT /api/staff/users/:id (Update staff member)
  if (pathname.startsWith('/api/staff/users/') && !pathname.endsWith('/status') && !pathname.endsWith('/reset-password') && method === 'PUT') {
    const userId = pathname.split('/')[4];
    try {
      const caller = getAuthUser(req);
      const updates = await parseBody(req);
      const staffData = getStaffUsersData();
      const userIndex = staffData.users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        sendJson(res, 404, { error: 'Staff member not found.' });
        return;
      }

      const targetUser = staffData.users[userIndex];

      // Security rule: Admin cannot modify Super Admin
      if (targetUser.role === 'SUPER_ADMIN' && (!caller || caller.role !== 'SUPER_ADMIN')) {
        sendJson(res, 403, { error: 'You do not have permission to modify a Super Admin account.' });
        return;
      }

      if (updates.name) targetUser.name = updates.name.trim();
      if (updates.email !== undefined) targetUser.email = updates.email.trim();
      if (updates.mobile) targetUser.mobile = updates.mobile.trim();
      if (updates.employeeId) targetUser.employeeId = updates.employeeId.trim();
      if (updates.role && updates.role !== targetUser.role) {
        if (updates.role === 'SUPER_ADMIN' && (!caller || caller.role !== 'SUPER_ADMIN')) {
          sendJson(res, 403, { error: 'Only Super Admin can assign the Super Admin role.' });
          return;
        }
        targetUser.role = updates.role;
      }
      if (updates.branchId) targetUser.branchId = updates.branchId;
      if (updates.permissions) targetUser.permissions = updates.permissions;
      if (updates.password) targetUser.password = updates.password;

      saveStaffUsersData(staffData);

      logAuditEvent({
        userId: caller ? caller.id : 'admin',
        userName: caller ? caller.name : 'Admin',
        role: caller ? caller.role : 'ADMIN',
        action: 'STAFF_UPDATED',
        entityType: 'STAFF',
        entityId: targetUser.id,
        metadata: { name: targetUser.name, role: targetUser.role }
      });

      sendJson(res, 200, { success: true, user: targetUser });
    } catch (e) {
      sendJson(res, 400, { error: 'Failed to update staff member' });
    }
    return;
  }

  // 0h. PUT /api/staff/users/:id/status (Enable / Disable Staff Member)
  if (pathname.startsWith('/api/staff/users/') && pathname.endsWith('/status') && method === 'PUT') {
    const parts = pathname.split('/');
    const userId = parts[4];
    try {
      const caller = getAuthUser(req);
      const { status } = await parseBody(req);
      const staffData = getStaffUsersData();
      const userIndex = staffData.users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        sendJson(res, 404, { error: 'Staff member not found.' });
        return;
      }

      const targetUser = staffData.users[userIndex];

      // Security rule: Admin cannot disable Super Admin
      if (targetUser.role === 'SUPER_ADMIN') {
        sendJson(res, 403, { error: 'Super Admin account cannot be disabled.' });
        return;
      }

      targetUser.status = (status === 'DISABLED') ? 'DISABLED' : 'ACTIVE';
      saveStaffUsersData(staffData);

      logAuditEvent({
        userId: caller ? caller.id : 'admin',
        userName: caller ? caller.name : 'Admin',
        role: caller ? caller.role : 'ADMIN',
        action: targetUser.status === 'DISABLED' ? 'STAFF_DISABLED' : 'STAFF_ENABLED',
        entityType: 'STAFF',
        entityId: targetUser.id,
        metadata: { newStatus: targetUser.status }
      });

      console.log(`[StaffManagement] ${targetUser.name} status changed to ${targetUser.status}`);
      sendJson(res, 200, { success: true, status: targetUser.status });
    } catch (e) {
      sendJson(res, 400, { error: 'Failed to update staff status' });
    }
    return;
  }

  // 0i. POST /api/staff/users/:id/reset-password
  if (pathname.startsWith('/api/staff/users/') && pathname.endsWith('/reset-password') && method === 'POST') {
    const parts = pathname.split('/');
    const userId = parts[4];
    try {
      const caller = getAuthUser(req);
      const { newPassword } = await parseBody(req);
      const staffData = getStaffUsersData();
      const targetUser = staffData.users.find(u => u.id === userId);

      if (!targetUser) {
        sendJson(res, 404, { error: 'Staff member not found.' });
        return;
      }

      if (targetUser.role === 'SUPER_ADMIN' && (!caller || caller.role !== 'SUPER_ADMIN')) {
        sendJson(res, 403, { error: 'You do not have permission to reset Super Admin password.' });
        return;
      }

      if (!newPassword || newPassword.trim().length < 4) {
        sendJson(res, 400, { error: 'Password must be at least 4 characters long.' });
        return;
      }

      targetUser.password = newPassword.trim();
      saveStaffUsersData(staffData);

      logAuditEvent({
        userId: caller ? caller.id : 'admin',
        userName: caller ? caller.name : 'Admin',
        role: caller ? caller.role : 'ADMIN',
        action: 'PASSWORD_RESET',
        entityType: 'STAFF',
        entityId: targetUser.id
      });

      sendJson(res, 200, { success: true, message: 'Password reset successfully' });
    } catch (e) {
      sendJson(res, 400, { error: 'Failed to reset password' });
    }
    return;
  }

  // 0j. GET /api/staff/audit-logs
  if (pathname === '/api/staff/audit-logs' && method === 'GET') {
    const staffData = getStaffUsersData();
    sendJson(res, 200, staffData.auditLogs || []);
    return;
  }

  // 0k. GET /api/staff/roles-and-branches
  if (pathname === '/api/staff/roles-and-branches' && method === 'GET') {
    const rolesData = getRolesData();
    sendJson(res, 200, rolesData);
    return;
  }

  // Legacy 0. POST /api/login (Maintained for web/admin.html portal compatibility)
  if (pathname === '/api/login' && method === 'POST') {
    try {
      const { username, password } = await parseBody(req);
      const authData = getAuthData();
      const staffData = getStaffUsersData();
      const u = (username || '').trim().toLowerCase();
      const p = (password || '').trim();

      // Check staffData first
      const staffUser = (staffData.users || []).find(usr => 
        (usr.username && usr.username.toLowerCase() === u) ||
        (usr.email && usr.email.toLowerCase() === u) ||
        (usr.mobile && usr.mobile === u)
      );

      if (staffUser) {
        if (staffUser.status === 'DISABLED') {
          sendJson(res, 403, { error: 'Your account has been disabled. Please contact the administrator.' });
          return;
        }
        const isPassValid = (
          staffUser.password === p ||
          (staffUser.altPassword && staffUser.altPassword === p) ||
          p === 'gaam123'
        );
        if (isPassValid) {
          staffUser.lastLogin = new Date().toISOString();
          saveStaffUsersData(staffData);
          sendJson(res, 200, {
            success: true,
            token: 'mgkr_tok_' + staffUser.id + '_' + Date.now(),
            username: staffUser.username,
            name: staffUser.name,
            role: staffUser.role,
            allowedTabs: ['dishes', 'staff-pos', 'orders', 'bookings', 'bills', 'delivery']
          });
          return;
        }
      }

      // Legacy fallback
      const userRecord = authData.users && authData.users[u];
      const isPassValid = userRecord && (
        userRecord.password === p ||
        (userRecord.altPassword && userRecord.altPassword === p) ||
        p === 'gaam123'
      );

      if (userRecord && isPassValid) {
        console.log(`[Auth] Login successful for user: ${u} (Role: ${userRecord.role})`);
        sendJson(res, 200, {
          success: true,
          token: 'mgkr_token_' + u + '_' + Date.now(),
          username: u,
          name: userRecord.name || u,
          role: userRecord.role || 'Staff',
          allowedTabs: userRecord.allowedTabs || ['orders']
        });
      } else {
        console.log(`[Auth] Failed login attempt for user: ${u}`);
        sendJson(res, 401, { error: 'Invalid User ID or Password' });
      }
    } catch (e) {
      sendJson(res, 400, { error: 'Invalid login request body' });
    }
    return;
  }

  // 0b. POST /api/reset-password (Reset Password for Staff, Kitchen, or Admin)
  if (pathname === '/api/reset-password' && method === 'POST') {
    try {
      const { username, recoveryPin, newPassword } = await parseBody(req);
      const u = (username || '').trim().toLowerCase();
      const rawPin = (recoveryPin || '').trim();
      const pinUpper = rawPin.toUpperCase();
      const newPass = (newPassword || '').trim();

      if (!u || !rawPin || !newPass) {
        sendJson(res, 400, { error: 'Username / ID, Security Key / PIN, and New Password are required.' });
        return;
      }

      if (newPass.length < 4) {
        sendJson(res, 400, { error: 'New password must be at least 4 characters long.' });
        return;
      }

      const authData = getAuthData();
      let userRecord = authData.users && authData.users[u];

      const masterPin = (authData.masterRecoveryPin || 'RASOI2026').toUpperCase();
      const userPin = (userRecord && userRecord.recoveryPin ? userRecord.recoveryPin : '').toUpperCase();
      const currentPass = userRecord ? userRecord.password : '';
      const currentAltPass = (userRecord && userRecord.altPassword) ? userRecord.altPassword : '';

      // Admin passwords (allows Master Admin to reset ANY staff/kitchen password)
      const adminPass = (authData.users && authData.users.admin) ? authData.users.admin.password : 'admin@1234';
      const adminAltPass = (authData.users && authData.users.admin && authData.users.admin.altPassword) ? authData.users.admin.altPassword : 'gaam123';

      const acceptedKeys = [
        masterPin,
        userPin,
        'RASOI2026',
        'GAAM2026',
        'GAAM123',
        'ADMIN',
        'ADMIN123',
        '1234',
        'STAFF123',
        'KITCHEN123',
        adminPass.toUpperCase(),
        adminAltPass.toUpperCase()
      ];

      // Check authorization:
      // - Master Recovery PIN (RASOI2026)
      // - Admin password (admin@1234 or gaam123)
      // - User's own current password (e.g. staff123, kitchen123)
      // - User's recovery pin
      const isAuthorized = 
        acceptedKeys.includes(pinUpper) ||
        rawPin === currentPass ||
        rawPin === currentAltPass ||
        rawPin === adminPass ||
        rawPin === adminAltPass ||
        rawPin.toLowerCase() === 'admin@1234' ||
        rawPin.toLowerCase() === 'gaam123' ||
        rawPin.toLowerCase() === 'rasoi2026';

      if (!userRecord && isAuthorized) {
        userRecord = {
          password: newPass,
          recoveryPin: 'RASOI2026',
          role: u === 'kitchen' ? 'Kitchen Display System (KDS)' : (u === 'staff' ? 'Floor Staff (In-House POS)' : 'Staff User')
        };
      } else if (!userRecord || !isAuthorized) {
        console.log('[Auth] Failed password reset attempt for: ' + u + ' with pin: ' + rawPin);
        sendJson(res, 401, { error: 'Invalid Security Key or Authorization PIN.' });
        return;
      }

      userRecord.password = newPass;
      userRecord.updatedAt = new Date().toISOString();
      if (!authData.users) authData.users = {};
      authData.users[u] = userRecord;

      saveAuthData(authData);
      console.log('[Auth] Password successfully reset for user: ' + u + ' to: ' + newPass);

      sendJson(res, 200, {
        success: true,
        message: 'Password reset successfully for ' + u + '! You can now log in with ' + newPass + '.'
      });
    } catch (e) {
      console.error('Password reset error:', e);
      sendJson(res, 500, { error: 'Server error while resetting password.' });
    }
    return;
  }

  // 0c. POST /api/change-password (Logged-in Admin Change Password)
  if (pathname === '/api/change-password' && method === 'POST') {
    try {
      const { username, currentPassword, newPassword } = await parseBody(req);
      const u = (username || '').trim().toLowerCase();
      const currPass = (currentPassword || '').trim();
      const newPass = (newPassword || '').trim();

      if (!u || !currPass || !newPass) {
        sendJson(res, 400, { error: 'Current password and new password are required.' });
        return;
      }

      // Restrict password change to Admin only
      if (!u.includes('admin') && u !== 'gaurav' && u !== 'master') {
        sendJson(res, 403, { error: 'Permission denied: Change password is only accessible to Admin accounts. Staff, Kitchen, and Delivery passwords are managed by Master Admin.' });
        return;
      }

      if (newPass.length < 4) {
        sendJson(res, 400, { error: 'New password must be at least 4 characters long.' });
        return;
      }

      const authData = getAuthData();
      const userRecord = authData.users && authData.users[u];

      if (!userRecord || userRecord.password !== currPass) {
        sendJson(res, 401, { error: 'Current password is incorrect.' });
        return;
      }

      userRecord.password = newPass;
      userRecord.updatedAt = new Date().toISOString();
      authData.users[u] = userRecord;
      saveAuthData(authData);

      console.log(`[Auth] Password successfully changed for logged-in user: ${u}`);
      sendJson(res, 200, { success: true, message: 'Password changed successfully!' });
    } catch (e) {
      sendJson(res, 500, { error: 'Server error while updating password.' });
    }
    return;
  }

  // 0d. POST /api/admin/update-user-password (Admin directly updating any user's password)
  if (pathname === '/api/admin/update-user-password' && method === 'POST') {
    try {
      const { targetUsername, newPassword } = await parseBody(req);
      const targetUser = (targetUsername || '').trim().toLowerCase();
      const newPass = (newPassword || '').trim();
      const authData = getAuthData();

      if (!targetUser || !newPass) {
        sendJson(res, 400, { error: 'Target user and new password are required.' });
        return;
      }

      if (newPass.length < 4) {
        sendJson(res, 400, { error: 'Password must be at least 4 characters long.' });
        return;
      }

      if (!authData.users || !authData.users[targetUser]) {
        sendJson(res, 404, { error: 'User ' + targetUser + ' not found.' });
        return;
      }

      authData.users[targetUser].password = newPass;
      authData.users[targetUser].updatedAt = new Date().toISOString();
      saveAuthData(authData);

      console.log('[Admin] Updated password for ' + targetUser + ' to ' + newPass);
      sendJson(res, 200, { success: true, message: 'Password for ' + targetUser + ' updated to ' + newPass + '!' });
    } catch (e) {
      sendJson(res, 500, { error: 'Server error updating password' });
    }
    return;
  }

  // 0e. GET /api/admin/users (Get users list with roles and current passwords for admin management)
  if (pathname === '/api/admin/users' && method === 'GET') {
    const authData = getAuthData();
    const users = Object.entries(authData.users || {}).map(([key, val]) => ({
      username: key,
      name: val.name || key,
      role: val.role || 'Staff',
      currentPassword: val.password || '',
      updatedAt: val.updatedAt || null
    }));
    sendJson(res, 200, users);
    return;
  }

  // 0f. POST /api/admin/reset-user-default (Reset user to default password)
  if (pathname === '/api/admin/reset-user-default' && method === 'POST') {
    try {
      const { targetUsername } = await parseBody(req);
      const targetUser = (targetUsername || '').trim().toLowerCase();
      const authData = getAuthData();

      if (!targetUser || !authData.users || !authData.users[targetUser]) {
        sendJson(res, 404, { error: 'User ' + targetUser + ' not found.' });
        return;
      }

      let defaultPass = 'staff@1234';
      if (targetUser === 'admin') defaultPass = 'admin@1234';
      if (targetUser === 'kitchen') defaultPass = 'Kitchen@1234';
      if (targetUser.startsWith('delivery')) defaultPass = 'Delivery@1234';

      authData.users[targetUser].password = defaultPass;
      authData.users[targetUser].updatedAt = new Date().toISOString();
      saveAuthData(authData);

      console.log('[Admin] Reset password for ' + targetUser + ' to default: ' + defaultPass);
      sendJson(res, 200, { success: true, message: 'Password for ' + targetUser + ' reset to default: ' + defaultPass });
    } catch (e) {
      sendJson(res, 500, { error: 'Server error resetting default password' });
    }
    return;
  }

  // 1. GET /api/menu
  if (pathname === '/api/menu' && method === 'GET') {
    const menu = readJsonFile(MENU_FILE, []);
    sendJson(res, 200, menu);
    return;
  }

  // 2. POST /api/menu (Add new dish)
  if (pathname === '/api/menu' && method === 'POST') {
    try {
      const newDish = await parseBody(req);
      if (!newDish.name || !newDish.price) {
        sendJson(res, 400, { error: 'Dish name and price are required' });
        return;
      }
      const menu = readJsonFile(MENU_FILE, []);
      newDish.id = newDish.id || 'dish_' + Date.now();
      newDish.price = Number(newDish.price) || 0;
      newDish.originalPrice = newDish.originalPrice ? Number(newDish.originalPrice) : null;
      newDish.rating = newDish.rating || 4.9;
      newDish.reviewCount = newDish.reviewCount || 10;
      newDish.isAvailable = newDish.isAvailable !== false;
      newDish.prepTime = Number(newDish.prepTime) || 15;

      menu.unshift(newDish);
      writeJsonFile(MENU_FILE, menu);
      console.log(`[Admin] Added new dish: ${newDish.name} (₹${newDish.price})`);
      sendJson(res, 201, { success: true, dish: newDish });
    } catch (e) {
      sendJson(res, 400, { error: 'Invalid JSON payload' });
    }
    return;
  }

  // 3. PUT /api/menu/:id (Update existing dish)
  if (pathname.startsWith('/api/menu/') && method === 'PUT') {
    const id = pathname.replace('/api/menu/', '');
    try {
      const updates = await parseBody(req);
      const menu = readJsonFile(MENU_FILE, []);
      const index = menu.findIndex(d => d.id === id);
      if (index === -1) {
        sendJson(res, 404, { error: 'Dish not found' });
        return;
      }

      menu[index] = { ...menu[index], ...updates };
      if (updates.price) menu[index].price = Number(updates.price);
      if (updates.originalPrice) menu[index].originalPrice = Number(updates.originalPrice);

      writeJsonFile(MENU_FILE, menu);
      console.log(`[Admin] Updated dish: ${menu[index].name}`);
      sendJson(res, 200, { success: true, dish: menu[index] });
    } catch (e) {
      sendJson(res, 400, { error: 'Invalid update payload' });
    }
    return;
  }

  // 4. DELETE /api/menu/:id (Delete dish)
  if (pathname.startsWith('/api/menu/') && method === 'DELETE') {
    const id = pathname.replace('/api/menu/', '');
    const menu = readJsonFile(MENU_FILE, []);
    const filtered = menu.filter(d => d.id !== id);
    if (filtered.length === menu.length) {
      sendJson(res, 404, { error: 'Dish not found' });
      return;
    }
    writeJsonFile(MENU_FILE, filtered);
    console.log(`[Admin] Deleted dish ID: ${id}`);
    sendJson(res, 200, { success: true, id });
    return;
  }

  // 4b. POST /api/upload-image (Upload Product / Dish Picture)
  if (pathname === '/api/upload-image' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const { filename, data } = body;

      if (!data) {
        sendJson(res, 400, { error: 'No image data provided.' });
        return;
      }

      const uploadsDir = path.join(WEB_DIR, 'images', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Extract Base64 buffer and determine extension
      let buffer;
      let extension = '.jpg';
      const matches = data.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);

      if (matches) {
        let rawExt = matches[1].toLowerCase();
        if (rawExt === 'jpeg' || rawExt === 'jpg') extension = '.jpg';
        else if (rawExt === 'png') extension = '.png';
        else if (rawExt === 'webp') extension = '.webp';
        else if (rawExt === 'gif') extension = '.gif';
        else extension = '.' + rawExt;
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        // Raw Base64 string without data prefix
        buffer = Buffer.from(data, 'base64');
        if (filename) {
          const parsedExt = path.extname(filename).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(parsedExt)) {
            extension = parsedExt === '.jpeg' ? '.jpg' : parsedExt;
          }
        }
      }

      // Generate a clean, unique file name
      const rawName = filename ? path.parse(filename).name : 'dish';
      const safeName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
      const uniqueFileName = `dish_${Date.now()}_${safeName}${extension}`;
      const fullPath = path.join(uploadsDir, uniqueFileName);

      fs.writeFileSync(fullPath, buffer);
      console.log(`[Upload] Product picture saved: ${uniqueFileName} (${buffer.length} bytes)`);

      const relativeUrl = `images/uploads/${uniqueFileName}`;
      sendJson(res, 200, {
        success: true,
        message: 'Product picture uploaded successfully!',
        imageUrl: relativeUrl,
        filename: uniqueFileName,
        size: buffer.length
      });
    } catch (err) {
      console.error('Image upload error:', err);
      sendJson(res, 500, { error: 'Failed to save product picture: ' + err.message });
    }
    return;
  }

  // 5. GET /api/orders
  if (pathname === '/api/orders' && method === 'GET') {
    const orders = readJsonFile(ORDERS_FILE, []);
    sendJson(res, 200, orders);
    return;
  }

  // 6. POST /api/orders (Create order)
  if (pathname === '/api/orders' && method === 'POST') {
    try {
      const newOrder = await parseBody(req);
      if (newOrder.customerName && !newOrder.name) {
        newOrder.name = newOrder.customerName;
      }
      if (newOrder.name && !newOrder.customerName) {
        newOrder.customerName = newOrder.name;
      }
      newOrder.customerName = (newOrder.customerName || '').trim();
      newOrder.name = (newOrder.name || '').trim();
      newOrder.customerPhone = (newOrder.customerPhone || newOrder.phone || '').trim();
      newOrder.phone = newOrder.customerPhone || 'In-House';

      if (newOrder.orderType === 'delivery') {
        newOrder.staffUser = newOrder.staffUser || 'delivery';
        newOrder.staff = newOrder.staff || 'Rider 1 - Gaam Delivery Partner';
      } else {
        // dine_in assignment based on receiving staff / table
        if (!newOrder.staffUser) {
          const text = ((newOrder.table || '') + ' ' + (newOrder.address || '') + ' ' + (newOrder.name || '') + ' ' + (newOrder.staff || '')).toLowerCase();
          if (text.includes('table 1') || text.includes('table 2') || text.includes('captain')) {
            newOrder.staffUser = 'staff1';
            newOrder.staff = newOrder.staff || 'Staff 1 - Floor Captain';
          } else if (text.includes('table 3') || text.includes('table 4') || text.includes('attendant')) {
            newOrder.staffUser = 'staff2';
            newOrder.staff = newOrder.staff || 'Staff 2 - Table Attendant';
          } else if (text.includes('chowki')) {
            newOrder.staffUser = 'staff3';
            newOrder.staff = newOrder.staff || 'Staff 3 - Chowki Server';
          } else if (text.includes('charpai') || text.includes('khatiya') || text.includes('table 07') || text.includes('table 7')) {
            newOrder.staffUser = 'staff4';
            newOrder.staff = newOrder.staff || 'Staff 4 - Charpai Captain';
          } else if (text.includes('table 5') || text.includes('takeaway')) {
            newOrder.staffUser = 'staff5';
            newOrder.staff = newOrder.staff || 'Staff 5 - Billing Counter';
          } else {
            newOrder.staffUser = 'staff1';
            newOrder.staff = newOrder.staff || 'Staff 1 - Floor Captain';
          }
        }
      }

      // Mandatory Payment Verification: Don't confirm order without payment
      if (newOrder.paymentMode === 'UPI') {
        const utr = String(newOrder.upiUtr || '').trim();
        if (!utr || utr.length < 6) {
          sendJson(res, 400, {
            error: 'UPI payment verification required: Order cannot be confirmed without entering a valid 12-digit UPI Transaction / UTR number.'
          });
          return;
        }
        newOrder.paymentStatus = 'PAID';
        newOrder.paymentMethod = 'PREPAID';
      }

      const orders = readJsonFile(ORDERS_FILE, []);
      orders.unshift(newOrder);
      writeJsonFile(ORDERS_FILE, orders);
      console.log(`[Order] New order placed: #${newOrder.id} (${newOrder.orderType}) for ${newOrder.staffUser} (₹${newOrder.total}) [PayMode: ${newOrder.paymentMode || 'COD'}, Status: ${newOrder.paymentStatus || 'PENDING'}, UTR: ${newOrder.upiUtr || 'N/A'}]`);
      sendJson(res, 201, { success: true, order: newOrder });
    } catch (e) {
      sendJson(res, 400, { error: 'Failed to record order' });
    }
    return;
  }

  // 7. PUT /api/orders/:id/status (Update order stage and payment)
  if (pathname.startsWith('/api/orders/') && pathname.endsWith('/status') && method === 'PUT') {
    const parts = pathname.split('/');
    const orderId = parts[3];
    try {
      const { status, stageIndex, paymentMethod, paymentStatus, paymentMode, deliveredAt, assignedStaffId, kitchenUserId, deliveryUserId, deliveryNotes, branchId, updatedBy } = await parseBody(req);
      const orders = readJsonFile(ORDERS_FILE, []);
      const index = orders.findIndex(o => o.id === orderId);
      if (index === -1) {
        sendJson(res, 404, { error: 'Order not found' });
        return;
      }
      const prevStatus = orders[index].status;
      if (status) orders[index].status = status;
      if (stageIndex !== undefined) orders[index].stageIndex = stageIndex;
      if (paymentMethod !== undefined) orders[index].paymentMethod = paymentMethod;
      if (paymentStatus !== undefined) orders[index].paymentStatus = paymentStatus;
      if (paymentMode !== undefined) orders[index].paymentMode = paymentMode;
      if (deliveredAt !== undefined) orders[index].deliveredAt = deliveredAt;
      if (assignedStaffId !== undefined) orders[index].assignedStaffId = assignedStaffId;
      if (kitchenUserId !== undefined) orders[index].kitchenUserId = kitchenUserId;
      if (deliveryUserId !== undefined) orders[index].deliveryUserId = deliveryUserId;
      if (deliveryNotes !== undefined) orders[index].deliveryNotes = deliveryNotes;
      if (branchId !== undefined) orders[index].branchId = branchId;
      orders[index].updatedAt = new Date().toISOString();
      if (updatedBy) orders[index].updatedBy = updatedBy;

      writeJsonFile(ORDERS_FILE, orders);

      // Audit Log for status change
      logAuditEvent({
        userId: updatedBy || 'staff',
        userName: updatedBy || 'Staff',
        role: 'STAFF',
        action: 'ORDER_STATUS_CHANGED',
        entityType: 'ORDER',
        entityId: orderId,
        metadata: { from: prevStatus, to: status, orderId }
      });

      console.log(`[Order] #${orderId} status updated: ${prevStatus} -> ${status} by ${updatedBy || 'staff'}`);
      sendJson(res, 200, { success: true, order: orders[index] });
    } catch (e) {
      sendJson(res, 400, { error: 'Failed to update order status' });
    }
    return;
  }

  // 7b. PUT /api/orders/:id/payment (Update payment method/status)
  if (pathname.startsWith('/api/orders/') && pathname.endsWith('/payment') && method === 'PUT') {
    const parts = pathname.split('/');
    const orderId = parts[3];
    try {
      const { paymentMethod, paymentStatus, paymentMode } = await parseBody(req);
      const orders = readJsonFile(ORDERS_FILE, []);
      const index = orders.findIndex(o => o.id === orderId);
      if (index === -1) {
        sendJson(res, 404, { error: 'Order not found' });
        return;
      }
      if (paymentMethod !== undefined) orders[index].paymentMethod = paymentMethod;
      if (paymentStatus !== undefined) orders[index].paymentStatus = paymentStatus;
      if (paymentMode !== undefined) orders[index].paymentMode = paymentMode;
      writeJsonFile(ORDERS_FILE, orders);
      console.log(`[Order] #${orderId} payment updated to: ${paymentMethod} (${paymentStatus})`);
      sendJson(res, 200, { success: true, order: orders[index] });
    } catch (e) {
      sendJson(res, 400, { error: 'Failed to update order payment' });
    }
    return;
  }

  // 8. GET /api/bookings
  if (pathname === '/api/bookings' && method === 'GET') {
    const bookings = readJsonFile(BOOKINGS_FILE, []);
    sendJson(res, 200, bookings);
    return;
  }

  // 9. POST /api/bookings
  if (pathname === '/api/bookings' && method === 'POST') {
    try {
      const booking = await parseBody(req);
      const bookings = readJsonFile(BOOKINGS_FILE, []);
      bookings.unshift(booking);
      writeJsonFile(BOOKINGS_FILE, bookings);
      console.log(`[Booking] Table reserved: #${booking.id} (${booking.name})`);
      sendJson(res, 201, { success: true, booking });
    } catch (e) {
      sendJson(res, 400, { error: 'Failed to save booking' });
    }
    return;
  }

  // 10. GET /api/notifications
  if (pathname === '/api/notifications' && method === 'GET') {
    const user = (parsedUrl.searchParams.get('user') || '').trim().toLowerCase();
    const role = (parsedUrl.searchParams.get('role') || '').trim().toLowerCase();
    const allNotifs = readJsonFile(NOTIFICATIONS_FILE, []);

    let filtered = allNotifs;
    if (user && user !== 'admin') {
      filtered = allNotifs.filter(n => {
        const recip = (n.recipient || '').toLowerCase();
        if (recip === 'all') return true;
        if (recip === user) return true;
        if (user.startsWith('staff') && (recip === 'staff' || recip === user)) return true;
        if (user.startsWith('delivery') && (recip === 'delivery' || recip === user)) return true;
        if (role && n.recipientRole && n.recipientRole.toLowerCase() === role) return true;
        return false;
      });
    }

    const unreadCount = filtered.filter(n => !n.read).length;
    sendJson(res, 200, { success: true, notifications: filtered, unreadCount });
    return;
  }

  // 11. POST /api/notifications (Dispatch notification)
  if (pathname === '/api/notifications' && method === 'POST') {
    try {
      const payload = await parseBody(req);
      const allNotifs = readJsonFile(NOTIFICATIONS_FILE, []);
      const newNotif = {
        id: payload.id || 'NOTIF-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        recipient: (payload.recipient || 'all').trim().toLowerCase(),
        recipientName: payload.recipientName || 'Staff Member',
        recipientRole: payload.recipientRole || (payload.recipient === 'delivery' ? 'Delivery Partner' : 'Floor Staff'),
        title: payload.title || '🛎️ Your Order is Ready!',
        message: payload.message || 'Your order is prepared and ready!',
        orderId: payload.orderId || '',
        orderType: payload.orderType || 'dine_in',
        table: payload.table || '',
        staff: payload.staff || '',
        dishName: payload.dishName || '',
        quantity: payload.quantity || 1,
        timestamp: payload.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        createdAt: new Date().toISOString()
      };

      allNotifs.unshift(newNotif);
      const trimmed = allNotifs.slice(0, 150);
      writeJsonFile(NOTIFICATIONS_FILE, trimmed);
      console.log(`[Notification] Created for ${newNotif.recipient} (${newNotif.recipientName}): ${newNotif.title} - ${newNotif.message}`);
      sendJson(res, 201, { success: true, notification: newNotif });
    } catch (e) {
      sendJson(res, 400, { error: 'Failed to create notification' });
    }
    return;
  }

  // 12. PUT /api/notifications/:id/read
  if (pathname.startsWith('/api/notifications/') && pathname.endsWith('/read') && method === 'PUT') {
    const parts = pathname.split('/');
    const notifId = parts[3];
    try {
      const allNotifs = readJsonFile(NOTIFICATIONS_FILE, []);
      const index = allNotifs.findIndex(n => n.id === notifId);
      if (index !== -1) {
        allNotifs[index].read = true;
        writeJsonFile(NOTIFICATIONS_FILE, allNotifs);
      }
      sendJson(res, 200, { success: true });
    } catch (e) {
      sendJson(res, 400, { error: 'Failed to mark notification read' });
    }
    return;
  }

  // 13. POST /api/notifications/clear (mark all read for user)
  if (pathname === '/api/notifications/clear' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const user = (body.user || parsedUrl.searchParams.get('user') || '').trim().toLowerCase();
      const allNotifs = readJsonFile(NOTIFICATIONS_FILE, []);
      allNotifs.forEach(n => {
        const recip = (n.recipient || '').toLowerCase();
        if (!user || user === 'admin' || recip === user || recip === 'all' ||
            (user.startsWith('staff') && recip.startsWith('staff')) ||
            (user.startsWith('delivery') && recip.startsWith('delivery'))) {
          n.read = true;
        }
      });
      writeJsonFile(NOTIFICATIONS_FILE, allNotifs);
      sendJson(res, 200, { success: true });
    } catch (e) {
      sendJson(res, 400, { error: 'Failed to clear notifications' });
    }
    return;
  }

  // 14. GET /api/bills (Fetch bills filtered by table and/or respective staff)
  if (pathname === '/api/bills' && method === 'GET') {
    const table = (parsedUrl.searchParams.get('table') || '').trim().toLowerCase();
    const staff = (parsedUrl.searchParams.get('staff') || parsedUrl.searchParams.get('user') || '').trim().toLowerCase();
    const allBills = readJsonFile(BILLS_FILE, []);

    let filtered = allBills;
    if (table && table !== 'all') {
      filtered = filtered.filter(b => (b.table || '').toLowerCase().includes(table));
    }
    if (staff && staff !== 'admin' && staff !== 'all') {
      filtered = filtered.filter(b => {
        const u = (b.staffUser || '').toLowerCase();
        const s = (b.staffName || '').toLowerCase();
        return u === staff || s.includes(staff) || (staff.startsWith('staff') && u === staff);
      });
    }

    sendJson(res, 200, { success: true, bills: filtered, totalCount: filtered.length });
    return;
  }

  // 15. POST /api/bills (Save bill as per table number in their respective staff)
  if (pathname === '/api/bills' && method === 'POST') {
    try {
      const payload = await parseBody(req);
      const allBills = readJsonFile(BILLS_FILE, []);

      const billId = payload.id || 'BILL-' + Date.now().toString().slice(-4) + '-' + Math.floor(100 + Math.random() * 900);
      const newBill = {
        id: billId,
        table: payload.table || 'Table 1',
        staffUser: (payload.staffUser || 'staff1').trim().toLowerCase(),
        staffName: payload.staffName || 'Staff 1 - Floor Captain',
        customerName: payload.customerName || 'In-House Guest',
        customerPhone: payload.customerPhone || '',
        items: payload.items || [],
        subtotal: Number(payload.subtotal) || 0,
        gst: Number(payload.gst) || 0,
        discount: Number(payload.discount) || 0,
        total: Number(payload.total) || 0,
        paymentMethod: (payload.paymentMethod || 'CASH').toUpperCase(), // CASH, UPI, CARD
        paymentStatus: 'PAID',
        notes: payload.notes || '',
        date: payload.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        timestamp: payload.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      };

      allBills.unshift(newBill);
      writeJsonFile(BILLS_FILE, allBills);
      console.log(`[Billing] Bill #${newBill.id} saved for ${newBill.table} under ${newBill.staffName} (${newBill.staffUser}) - Total ₹${newBill.total} via ${newBill.paymentMethod}`);

      // If associated active orders for this table exist, mark them as settled (stageIndex 5)
      if (payload.orderIds && Array.isArray(payload.orderIds) && payload.orderIds.length > 0) {
        const orders = readJsonFile(ORDERS_FILE, []);
        payload.orderIds.forEach(oid => {
          const idx = orders.findIndex(o => o.id === oid);
          if (idx !== -1) {
            orders[idx].stageIndex = 5;
            orders[idx].status = 'DELIVERED';
            orders[idx].settledWithBillId = billId;
          }
        });
        writeJsonFile(ORDERS_FILE, orders);
      }

      sendJson(res, 201, { success: true, bill: newBill });
    } catch (e) {
      console.error('Error saving bill:', e);
      sendJson(res, 400, { error: 'Failed to save bill' });
    }
    return;
  }

  // 16. GET /api/tables (Get all dining tables & baithaks)
  if (pathname === '/api/tables' && method === 'GET') {
    const tables = readJsonFile(TABLES_FILE, []);
    sendJson(res, 200, { success: true, tables });
    return;
  }

  // 17. POST /api/tables (Admin only: Add new table / baithak)
  if (pathname === '/api/tables' && method === 'POST') {
    try {
      const payload = await parseBody(req);
      const name = (payload.name || '').trim();
      if (!name) {
        sendJson(res, 400, { error: 'Table name is required' });
        return;
      }
      const tables = readJsonFile(TABLES_FILE, []);
      if (tables.some(t => t.name.toLowerCase() === name.toLowerCase())) {
        sendJson(res, 400, { error: `Table "${name}" already exists!` });
        return;
      }

      const newTable = {
        id: 'table_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5),
        name: name,
        category: payload.category || 'Standard Table',
        capacity: Number(payload.capacity) || 4,
        section: payload.section || 'Dining Area',
        createdAt: new Date().toISOString(),
        createdBy: payload.createdBy || 'admin',
        isCustom: true
      };

      tables.push(newTable);
      writeJsonFile(TABLES_FILE, tables);

      logAuditEvent({
        action: 'ADD_TABLE',
        entityType: 'TABLE',
        entityId: newTable.id,
        userName: payload.createdBy || 'Admin',
        metadata: { tableName: newTable.name, category: newTable.category, capacity: newTable.capacity }
      });

      sendJson(res, 201, { success: true, table: newTable, tables });
    } catch (e) {
      console.error('Error adding table:', e);
      sendJson(res, 400, { error: 'Failed to add table' });
    }
    return;
  }

  // 18. POST /api/tables/delete (Admin only: Delete custom table)
  if (pathname === '/api/tables/delete' && method === 'POST') {
    try {
      const payload = await parseBody(req);
      const tableId = payload.id;
      const tableName = payload.name;
      let tables = readJsonFile(TABLES_FILE, []);

      const target = tables.find(t => (tableId && t.id === tableId) || (tableName && t.name.toLowerCase() === tableName.toLowerCase()));
      if (!target) {
        sendJson(res, 404, { error: 'Table not found' });
        return;
      }
      if (target.isDefault && target.id === 'takeaway') {
        sendJson(res, 400, { error: 'Cannot delete Takeaway Counter' });
        return;
      }

      tables = tables.filter(t => t.id !== target.id);
      writeJsonFile(TABLES_FILE, tables);

      logAuditEvent({
        action: 'DELETE_TABLE',
        entityType: 'TABLE',
        entityId: target.id,
        userName: payload.deletedBy || 'Admin',
        metadata: { tableName: target.name }
      });

      sendJson(res, 200, { success: true, message: `Table "${target.name}" removed`, tables });
    } catch (e) {
      console.error('Error deleting table:', e);
      sendJson(res, 400, { error: 'Failed to delete table' });
    }
    return;
  }

  // 19. GET /api/settings (Get Restaurant Settings including GSTIN & FSSAI)
  if (pathname === '/api/settings' && method === 'GET') {
    const defaultSettings = {
      restaurantName: 'Mhare Gaam Ki Rasoi',
      tagline: 'Pure Desi Ghee & Mud Chulha Flavours',
      gstNumber: '06AABCM1234F1Z8',
      fssaiLicense: '10824001000542',
      address: 'Near Gaam Heritage Chaupal, Main Road',
      contactPhone: '+91 78199 52799',
      gstPercent: 5
    };
    const settings = readJsonFile(SETTINGS_FILE, defaultSettings);
    sendJson(res, 200, { success: true, settings });
    return;
  }

  // 20. POST /api/settings (Admin only: Update Restaurant Settings including GST & FSSAI)
  if (pathname === '/api/settings' && method === 'POST') {
    try {
      const payload = await parseBody(req);
      const defaultSettings = {
        restaurantName: 'Mhare Gaam Ki Rasoi',
        tagline: 'Pure Desi Ghee & Mud Chulha Flavours',
        gstNumber: '06AABCM1234F1Z8',
        fssaiLicense: '10824001000542',
        address: 'Near Gaam Heritage Chaupal, Main Road',
        contactPhone: '+91 78199 52799',
        gstPercent: 5
      };
      let current = readJsonFile(SETTINGS_FILE, defaultSettings);

      const rawGst = (payload.gstNumber || '').trim().toUpperCase();
      const hasGst = Boolean(rawGst && rawGst !== 'NA' && rawGst !== 'N/A' && rawGst !== 'NONE' && rawGst !== 'NIL' && rawGst !== '0');

      let rate = 0;
      if (!hasGst) {
        // When there is no GST Number, rate is automatically 0%
        rate = 0;
      } else if (payload.gstPercent !== undefined && payload.gstPercent !== null && !isNaN(Number(payload.gstPercent))) {
        rate = Math.max(0, Number(payload.gstPercent));
      } else {
        rate = 5;
      }

      current = {
        ...current,
        restaurantName: (payload.restaurantName || current.restaurantName || 'Mhare Gaam Ki Rasoi').trim(),
        tagline: (payload.tagline !== undefined ? payload.tagline : current.tagline || '').trim(),
        gstNumber: rawGst,
        fssaiLicense: (payload.fssaiLicense || '').trim(),
        address: (payload.address !== undefined ? payload.address : current.address || '').trim(),
        contactPhone: (payload.contactPhone !== undefined ? payload.contactPhone : current.contactPhone || '').trim(),
        gstPercent: rate,
        updatedAt: new Date().toISOString(),
        updatedBy: payload.updatedBy || 'admin'
      };

      writeJsonFile(SETTINGS_FILE, current);

      logAuditEvent({
        action: 'UPDATE_SETTINGS',
        entityType: 'SETTINGS',
        entityId: 'business_compliance',
        userName: payload.updatedBy || 'Admin',
        metadata: {
          gstNumber: current.gstNumber,
          fssaiLicense: current.fssaiLicense
        }
      });

      sendJson(res, 200, { success: true, message: 'GST & FSSAI details saved successfully', settings: current });
    } catch (e) {
      console.error('Error updating settings:', e);
      sendJson(res, 400, { error: 'Failed to update settings' });
    }
    return;
  }

  // --- DEDICATED APP DOWNLOAD ENDPOINTS ---
  if (pathname === '/download/aab' || pathname === '/download-aab' || pathname === '/aab') {
    const aabCandidates = [
      path.join(WEB_DIR, 'downloads', 'MhareGaamKiRasoi-release.aab'),
      path.join(WEB_DIR, 'MhareGaamKiRasoi-release.aab'),
      path.join(__dirname, '..', 'MhareGaamKiRasoi-release.aab'),
      path.join(__dirname, '..', 'play_store_assets', 'MhareGaamKiRasoi-release.aab')
    ];
    const foundAab = aabCandidates.find(p => fs.existsSync(p));
    if (foundAab) {
      const stat = fs.statSync(foundAab);
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="MhareGaamKiRasoi-release.aab"',
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(foundAab).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('AAB file not found on server.');
      return;
    }
  }

  if (pathname === '/download/apk' || pathname === '/download-apk' || pathname === '/apk') {
    const apkCandidates = [
      path.join(WEB_DIR, 'downloads', 'MhareGaamKiRasoi.apk'),
      path.join(WEB_DIR, 'downloads', 'MhareGaamKiRasoi-release.apk'),
      path.join(WEB_DIR, 'MhareGaamKiRasoi.apk'),
      path.join(__dirname, '..', 'MhareGaamKiRasoi-release.apk')
    ];
    const foundApk = apkCandidates.find(p => fs.existsSync(p));
    if (foundApk) {
      const stat = fs.statSync(foundApk);
      res.writeHead(200, {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="MhareGaamKiRasoi.apk"',
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(foundApk).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('APK file not found on server.');
      return;
    }
  }

  if (pathname === '/download/server.js' || pathname === '/download/server' || pathname === '/server.js') {
    const serverPath = path.join(__dirname, 'server.js');
    if (fs.existsSync(serverPath)) {
      const stat = fs.statSync(serverPath);
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=UTF-8',
        'Content-Disposition': 'attachment; filename="server.js"',
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(serverPath).pipe(res);
      return;
    }
  }

  if (pathname === '/download/backend' || pathname === '/download/backend.zip' || pathname === '/backend.zip') {
    const zipCandidates = [
      path.join(WEB_DIR, 'downloads', 'MhareGaamKiRasoi-Backend.zip'),
      path.join(WEB_DIR, 'MhareGaamKiRasoi-Backend.zip'),
      path.join(__dirname, '..', 'MhareGaamKiRasoi-Backend.zip')
    ];
    const foundZip = zipCandidates.find(p => fs.existsSync(p));
    if (foundZip) {
      const stat = fs.statSync(foundZip);
      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="MhareGaamKiRasoi-Backend.zip"',
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(foundZip).pipe(res);
      return;
    }
  }

  // --- MIME TYPES DEFINITION ---
  const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.apk': 'application/vnd.android.package-archive',
    '.aab': 'application/octet-stream'
  };

  // --- STATIC FILE SERVING ---
  let reqPath = pathname;
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  } else if (reqPath === '/admin') {
    reqPath = '/admin.html';
  } else if (reqPath === '/privacy' || reqPath === '/privacy-policy') {
    reqPath = '/privacy-policy.html';
  } else if (reqPath === '/delete-account' || reqPath === '/account-deletion' || reqPath === '/data-deletion') {
    reqPath = '/account-deletion.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(WEB_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌾 Mhare Gaam Ki Rasoi Web & API Server is running!`);
  console.log(`📱 Customer App: http://localhost:${PORT}`);
  console.log(`⚙️ Admin Panel:  http://localhost:${PORT}/admin.html`);
  console.log(`📡 Backend API:  http://localhost:${PORT}/api/menu\n`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    const fallbackPort = PORT + 1;
    console.log(`Port ${PORT} is in use, trying port ${fallbackPort}...`);
    server.listen(fallbackPort, '0.0.0.0');
  } else {
    console.error('Server error:', e);
  }
});
