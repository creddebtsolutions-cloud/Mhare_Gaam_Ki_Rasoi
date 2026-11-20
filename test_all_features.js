const http = require('http');

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE ROLE & FEATURE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(desc, condition, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc} ${details ? '--> ' + JSON.stringify(details) : ''}`);
      failed++;
    }
  }

  // 1. ADMIN LOGIN TEST
  console.log('\n--- 1. Testing Admin Login ---');
  let adminRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'admin@1234' });

  assert('Admin login via /api/login succeeds (200)', adminRes.status === 200);
  assert('Admin login returns valid role', adminRes.body.role && adminRes.body.role.toUpperCase().includes('ADMIN'), adminRes.body);
  const adminToken = adminRes.body.token;
  assert('Admin login returns token', Boolean(adminToken));

  // Staff-Auth login for Admin
  let adminStaffAuth = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/staff-auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { identifier: 'admin', password: 'admin@1234', expectedRole: 'ADMIN' });
  assert('Admin login via /api/staff-auth/login succeeds (200)', adminStaffAuth.status === 200, adminStaffAuth.body);

  // Verify Admin Session Token
  let verifyAdmin = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/staff-auth/verify',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminStaffAuth.body.token || adminToken}` }
  });
  assert('Admin token verification via getAuthUser succeeds (200)', verifyAdmin.status === 200, verifyAdmin.body);

  // 2. STAFF / POS LOGIN TEST
  console.log('\n--- 2. Testing Staff / POS Login ---');
  let staffRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'staff1', password: 'staff1@1234' });

  assert('Staff login via /api/login succeeds (200)', staffRes.status === 200);
  assert('Staff login returns STAFF role', staffRes.body.role === 'STAFF', staffRes.body);

  let staffAuthRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/staff-auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { identifier: 'staff1', password: 'staff1@1234', expectedRole: 'STAFF' });
  assert('Staff login via /api/staff-auth/login succeeds (200)', staffAuthRes.status === 200, staffAuthRes.body);

  // 3. KITCHEN LOGIN TEST
  console.log('\n--- 3. Testing Kitchen (KDS) Login ---');
  let kitchenRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'kitchen', password: 'Kitchen@1234' });

  assert('Kitchen login via /api/login succeeds (200)', kitchenRes.status === 200);
  assert('Kitchen login returns KITCHEN role', kitchenRes.body.role === 'KITCHEN' || kitchenRes.body.role.includes('Kitchen'), kitchenRes.body);

  let kitchenAuthRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/staff-auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { identifier: 'kitchen', password: 'Kitchen@1234', expectedRole: 'KITCHEN' });
  assert('Kitchen login via /api/staff-auth/login succeeds (200)', kitchenAuthRes.status === 200, kitchenAuthRes.body);

  // 4. DELIVERY LOGIN TEST
  console.log('\n--- 4. Testing Delivery Login ---');
  let deliveryRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'delivery', password: 'Delivery@1234' });

  assert('Delivery login via /api/login succeeds (200)', deliveryRes.status === 200);
  assert('Delivery login returns DELIVERY role', deliveryRes.body.role === 'DELIVERY' || deliveryRes.body.role.includes('Delivery'), deliveryRes.body);

  let deliveryAuthRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/staff-auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { identifier: 'delivery', password: 'Delivery@1234', expectedRole: 'DELIVERY' });
  assert('Delivery login via /api/staff-auth/login succeeds (200)', deliveryAuthRes.status === 200, deliveryAuthRes.body);

  // 5. SECURITY & INVALID LOGIN TEST
  console.log('\n--- 5. Testing Role Restriction & Invalid Passwords ---');
  let wrongPassRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'wrongpassword' });
  assert('Incorrect password correctly rejected (401)', wrongPassRes.status === 401);

  let roleMismatchRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/staff-auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { identifier: 'delivery', password: 'Delivery@1234', expectedRole: 'ADMIN' });
  assert('Role mismatch blocked (403)', roleMismatchRes.status === 403);

  // 6. ADMIN FEATURES TEST
  console.log('\n--- 6. Testing Admin Features ---');
  let statsRes = await request({ hostname: 'localhost', port: 3000, path: '/api/staff/dashboard-stats', method: 'GET' });
  assert('Dashboard stats fetched successfully (200)', statsRes.status === 200 && statsRes.body.success, statsRes.body);

  let settingsRes = await request({ hostname: 'localhost', port: 3000, path: '/api/settings', method: 'GET' });
  assert('Restaurant GST & FSSAI settings fetched (200)', settingsRes.status === 200 && settingsRes.body.success, settingsRes.body);

  let tablesRes = await request({ hostname: 'localhost', port: 3000, path: '/api/tables', method: 'GET' });
  assert('Tables list fetched (200)', tablesRes.status === 200 && Array.isArray(tablesRes.body.tables), tablesRes.body);

  let staffListRes = await request({ hostname: 'localhost', port: 3000, path: '/api/staff/users', method: 'GET' });
  assert('Staff users list fetched (200)', staffListRes.status === 200 && Array.isArray(staffListRes.body), staffListRes.body);

  let auditRes = await request({ hostname: 'localhost', port: 3000, path: '/api/staff/audit-logs', method: 'GET' });
  assert('Audit logs fetched (200)', auditRes.status === 200 && Array.isArray(auditRes.body));

  // 7. POS STAFF FEATURES TEST (Order Creation & Bill Generation)
  console.log('\n--- 7. Testing POS Staff Features ---');
  const testOrderId = 'TEST-POS-' + Date.now();
  let createOrderRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/orders',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    id: testOrderId,
    customerName: 'Rohit Sharma (Test Guest)',
    customerPhone: '9811122233',
    table: 'Table 1',
    orderType: 'dine_in',
    items: [
      { id: 'dish_1', name: 'Shahi Desi Thali', price: 249, quantity: 2 }
    ],
    total: 498,
    status: 'CONFIRMED',
    stageIndex: 0,
    paymentMode: 'CASH',
    paymentStatus: 'PENDING',
    staffUser: 'staff1',
    staff: 'Ramesh Kumar (Floor Captain)'
  });
  assert('POS Staff can create dine-in order (201)', createOrderRes.status === 201, createOrderRes.body);

  // Generate Bill for Table 1
  let billRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/bills',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    table: 'Table 1',
    staffUser: 'staff1',
    staffName: 'Ramesh Kumar (Floor Captain)',
    customerName: 'Rohit Sharma (Test Guest)',
    customerPhone: '9811122233',
    items: [{ name: 'Shahi Desi Thali', price: 249, quantity: 2 }],
    subtotal: 498,
    gst: 24.9,
    discount: 0,
    total: 522.9,
    paymentMethod: 'CASH',
    orderIds: [testOrderId]
  });
  assert('POS Staff can generate & settle table bill (201)', billRes.status === 201, billRes.body);

  // Filter bills by staff1
  let filteredBills = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/bills?staff=staff1',
    method: 'GET'
  });
  assert('Bills filtered by staff1 retrieved successfully', filteredBills.status === 200 && filteredBills.body.bills.length > 0);

  // 8. KITCHEN KDS FEATURES TEST
  console.log('\n--- 8. Testing Kitchen (KDS) Features ---');
  // Kitchen updates order to CHULHA_PREP
  let kitchenPrepRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/orders/${testOrderId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    status: 'CHULHA_PREP',
    stageIndex: 1,
    updatedBy: 'Chef Balbir (Chulha Head)'
  });
  assert('Kitchen marks order CHULHA_PREP (200)', kitchenPrepRes.status === 200, kitchenPrepRes.body);

  // Kitchen marks order PACKED_READY
  let kitchenReadyRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/orders/${testOrderId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    status: 'PACKED_READY',
    stageIndex: 2,
    updatedBy: 'Chef Balbir (Chulha Head)'
  });
  assert('Kitchen marks order PACKED_READY (200)', kitchenReadyRes.status === 200, kitchenReadyRes.body);

  // Kitchen sends bell chime notification to staff
  let notifRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/notifications',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    recipient: 'staff1',
    recipientName: 'Ramesh Kumar (Floor Captain)',
    title: '🛎️ Order Ready for Table 1!',
    message: 'Shahi Desi Thali (x2) is hot and ready on the counter.',
    orderId: testOrderId,
    table: 'Table 1'
  });
  assert('Kitchen sends bell notification to floor staff (201)', notifRes.status === 201, notifRes.body);

  // 9. DELIVERY RIDER FEATURES TEST
  console.log('\n--- 9. Testing Delivery Rider Features ---');
  const deliveryOrderId = 'TEST-DELIV-' + Date.now();
  await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/orders',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    id: deliveryOrderId,
    customerName: 'Ankit Verma',
    customerPhone: '9876543210',
    address: 'Flat 402, Royal Residency, Meerut',
    orderType: 'delivery',
    items: [{ id: 'dish_2', name: 'Handi Dal Makhani', price: 189, quantity: 1 }],
    total: 189,
    status: 'PACKED_READY',
    stageIndex: 2,
    paymentMode: 'COD',
    paymentStatus: 'PENDING',
    staffUser: 'delivery',
    staff: 'Sonu Rider (Delivery Partner)'
  });

  // Rider accepts & marks OUT_FOR_DELIVERY
  let outForDeliveryRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/orders/${deliveryOrderId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    status: 'OUT_FOR_DELIVERY',
    stageIndex: 3,
    deliveryUserId: 'usr_delivery1',
    updatedBy: 'Sonu Rider (Delivery Partner)'
  });
  assert('Rider marks order OUT_FOR_DELIVERY (200)', outForDeliveryRes.status === 200, outForDeliveryRes.body);

  // Rider marks DELIVERED and collects cash
  let deliveredRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/orders/${deliveryOrderId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    status: 'DELIVERED',
    stageIndex: 4,
    paymentStatus: 'PAID',
    paymentMethod: 'CASH_ON_DELIVERY',
    deliveredAt: new Date().toISOString(),
    updatedBy: 'Sonu Rider (Delivery Partner)'
  });
  assert('Rider marks order DELIVERED & payment collected (200)', deliveredRes.status === 200, deliveredRes.body);

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
