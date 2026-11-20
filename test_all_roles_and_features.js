/**
 * Comprehensive Automated End-to-End Test Suite for Mhare Gaam Ki Rasoi
 * Validates:
 * 1. Admin Login & Features (Menu CRUD, Dashboard, Staff Management, Settings, Tables, Bookings)
 * 2. Staff Login & Features (POS In-House Order Punching, KOT, Bill Generation, Payment Settlement)
 * 3. Kitchen Login & Features (KDS Display, Item Prep, Chulha Status Transitions, Ready Alerts)
 * 4. Delivery Login & Features (Delivery Order Dispatch, Out for Delivery, Customer Delivery, Payment)
 */

const BASE_URL = 'http://localhost:3000';

let testResults = [];
function recordTest(suite, testName, passed, details = '') {
  testResults.push({ suite, testName, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${suite}] ${testName} ${details ? '(' + details + ')' : ''}`);
}

async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : BASE_URL + url;
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  let data;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runAllTests() {
  console.log('===============================================================');
  console.log('🚀 RUNNING DEEP COMPREHENSIVE 4-ROLE & FEATURE VERIFICATION');
  console.log('===============================================================\n');

  let adminToken = '';
  let staffToken = '';
  let kitchenToken = '';
  let deliveryToken = '';

  // --------------------------------------------------------------------------
  // SUITE 1: ADMIN LOGIN & FEATURES
  // --------------------------------------------------------------------------
  console.log('--- SUITE 1: ADMIN LOGIN & CORE FEATURES ---');

  // 1.1 Admin Login via /api/login
  try {
    const res = await request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'admin@1234' })
    });
    const passed = res.status === 200 && res.data.success && !!res.data.token;
    if (passed) adminToken = res.data.token;
    recordTest('ADMIN', 'Admin Login via /api/login', passed, `Role: ${res.data?.role}`);
  } catch (e) {
    recordTest('ADMIN', 'Admin Login via /api/login', false, e.message);
  }

  // 1.2 Admin Login via /api/staff-auth/login
  try {
    const res = await request('/api/staff-auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'admin@1234' })
    });
    const passed = res.status === 200 && res.data.success && !!res.data.token;
    recordTest('ADMIN', 'Admin Login via /api/staff-auth/login', passed, `User: ${res.data?.user?.name}`);
  } catch (e) {
    recordTest('ADMIN', 'Admin Login via /api/staff-auth/login', false, e.message);
  }

  // 1.3 Verify Admin Token
  try {
    const res = await request('/api/staff-auth/verify', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const role = res.data?.user?.role;
    const passed = res.status === 200 && res.data.success && (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'Master Admin');
    recordTest('ADMIN', 'Admin Token Verification', passed, `Role: ${role}`);
  } catch (e) {
    recordTest('ADMIN', 'Admin Token Verification', false, e.message);
  }

  // 1.4 Get Dashboard Stats
  try {
    const res = await request('/api/staff/dashboard-stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const passed = res.status === 200 && res.data.success && typeof res.data.stats?.totalOrders === 'number';
    recordTest('ADMIN', 'Fetch Dashboard Analytics Stats', passed, `Total Orders: ${res.data?.stats?.totalOrders}`);
  } catch (e) {
    recordTest('ADMIN', 'Fetch Dashboard Analytics Stats', false, e.message);
  }

  // 1.5 Get Dishes
  try {
    const res = await request('/api/menu');
    const passed = res.status === 200 && Array.isArray(res.data) && res.data.length > 0;
    recordTest('ADMIN', 'Fetch Menu Dishes', passed, `Count: ${res.data?.length}`);
  } catch (e) {
    recordTest('ADMIN', 'Fetch Menu Dishes', false, e.message);
  }

  // 1.6 Add New Dish via POST /api/menu
  const testDishId = 'test_dish_' + Date.now();
  const testDish = {
    id: testDishId,
    name: 'Gaam Desi Churma Ball Special',
    hindiName: 'गाम देसी चूरमा लड्डू',
    categoryId: 'sweets',
    description: 'Freshly pounded organic bajra churma balls in cow desi ghee.',
    price: 149,
    originalPrice: 199,
    image: 'images/dish_churma.jpg',
    isVeg: true,
    isBestseller: true,
    isVillageSpecial: true,
    isDesiGheeSpecial: true,
    isAvailable: true,
    prepTime: 10,
    rating: 5.0,
    reviewCount: 12
  };
  try {
    const res = await request('/api/menu', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(testDish)
    });
    const passed = (res.status === 200 || res.status === 201) && res.data.success;
    recordTest('ADMIN', 'Create New Menu Dish', passed, `Dish ID: ${testDishId}`);
  } catch (e) {
    recordTest('ADMIN', 'Create New Menu Dish', false, e.message);
  }

  // 1.7 Update Dish Details via PUT /api/menu/:id
  try {
    const res = await request(`/api/menu/${testDishId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ price: 159, isAvailable: false })
    });
    const passed = res.status === 200 && res.data.success && res.data.dish?.price === 159;
    recordTest('ADMIN', 'Update Dish Details & Availability', passed, `New Price: 159`);
  } catch (e) {
    recordTest('ADMIN', 'Update Dish Details & Availability', false, e.message);
  }

  // 1.8 Delete Test Dish via DELETE /api/menu/:id
  try {
    const res = await request(`/api/menu/${testDishId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const verifyRes = await request('/api/menu');
    const stillExists = verifyRes.data.some(d => d.id === testDishId);
    const passed = res.status === 200 && !stillExists;
    recordTest('ADMIN', 'Delete Menu Dish Cleanup', passed, `Removed: ${passed}`);
  } catch (e) {
    recordTest('ADMIN', 'Delete Menu Dish Cleanup', false, e.message);
  }

  // 1.9 Admin Table Management: Add & Delete Table
  const testTableName = 'Baithak Test ' + Math.floor(Math.random() * 1000);
  try {
    const addRes = await request('/api/tables', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: testTableName, category: 'Standard Table', capacity: 6, section: 'Courtyard' })
    });
    const addPassed = (addRes.status === 200 || addRes.status === 201) && addRes.data.success;
    recordTest('ADMIN', 'Add Dining Table to POS Map', addPassed, `Table: ${testTableName}`);

    const delRes = await request('/api/tables/delete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: testTableName })
    });
    const delPassed = delRes.status === 200 && delRes.data.success;
    recordTest('ADMIN', 'Delete Dining Table from POS Map', delPassed);
  } catch (e) {
    recordTest('ADMIN', 'Table Management', false, e.message);
  }

  // 1.10 Admin Business Settings (GST, FSSAI, Restaurant Name)
  try {
    const getSettings = await request('/api/settings');
    const curSettings = getSettings.data.settings || {};

    const updateRes = await request('/api/settings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        ...curSettings,
        gstNumber: '06AABCM1234F1Z8',
        fssaiLicense: '10824001000542'
      })
    });
    const passed = updateRes.status === 200 && updateRes.data.success;
    recordTest('ADMIN', 'Update Restaurant GST & FSSAI Settings', passed, `GST: 06AABCM1234F1Z8`);
  } catch (e) {
    recordTest('ADMIN', 'Update Restaurant GST & FSSAI Settings', false, e.message);
  }

  // 1.11 Staff User Management (List Users & View Audit Logs)
  try {
    const usersRes = await request('/api/staff/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const usersPassed = usersRes.status === 200 && Array.isArray(usersRes.data);
    recordTest('ADMIN', 'Fetch Staff Users List', usersPassed, `Total Staff: ${usersRes.data?.length}`);

    const auditRes = await request('/api/staff/audit-logs', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const auditPassed = auditRes.status === 200 && Array.isArray(auditRes.data);
    recordTest('ADMIN', 'Fetch Staff Audit Logs', auditPassed, `Log entries: ${auditRes.data?.length}`);
  } catch (e) {
    recordTest('ADMIN', 'Staff Management & Audit Logs', false, e.message);
  }

  // 1.12 Table Bookings CRUD
  const testBookingId = 'BKG-' + Date.now();
  try {
    const createBkgRes = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        id: testBookingId,
        customerName: 'Suresh Kumar',
        phone: '9811122233',
        guestCount: 4,
        date: new Date().toISOString().split('T')[0],
        time: '07:30 PM',
        area: 'Courtyard Baithak',
        status: 'CONFIRMED'
      })
    });
    const bkgListRes = await request('/api/bookings');
    const bkgFound = Array.isArray(bkgListRes.data) && bkgListRes.data.some(b => b.id === testBookingId);
    recordTest('ADMIN', 'Create & View Table Booking', bkgFound, `Booking ID: ${testBookingId}`);
  } catch (e) {
    recordTest('ADMIN', 'Create & View Table Booking', false, e.message);
  }

  // --------------------------------------------------------------------------
  // SUITE 2: STAFF POS LOGIN & FEATURES
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 2: STAFF POS LOGIN & ORDER PUNCHING ---');

  // 2.1 Staff Login
  try {
    const res = await request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'staff', password: 'staff123' })
    });
    const passed = res.status === 200 && res.data.success && !!res.data.token;
    if (passed) staffToken = res.data.token;
    recordTest('STAFF_POS', 'Staff Login via /api/login', passed, `Name: ${res.data?.name}`);
  } catch (e) {
    recordTest('STAFF_POS', 'Staff Login via /api/login', false, e.message);
  }

  // 2.2 Verify Staff Token
  try {
    const res = await request('/api/staff-auth/verify', {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    const passed = res.status === 200 && res.data.success && !!res.data.user;
    recordTest('STAFF_POS', 'Staff Token Verification', passed, `Role: ${res.data?.user?.role}`);
  } catch (e) {
    recordTest('STAFF_POS', 'Staff Token Verification', false, e.message);
  }

  // 2.3 Fetch Tables for POS Layout
  try {
    const res = await request('/api/tables');
    const tablesList = res.data.tables || res.data;
    const passed = res.status === 200 && Array.isArray(tablesList) && tablesList.length > 0;
    recordTest('STAFF_POS', 'Fetch Dining Tables for POS Ordering', passed, `Available Tables: ${tablesList?.length}`);
  } catch (e) {
    recordTest('STAFF_POS', 'Fetch Dining Tables for POS Ordering', false, e.message);
  }

  // 2.4 Staff Punch Dine-In POS Order (Push KOT)
  const testPosOrderId = 'KOT-' + Math.floor(1000 + Math.random() * 9000);
  const posOrderPayload = {
    id: testPosOrderId,
    name: 'Chaudhary Veer',
    customerName: 'Chaudhary Veer',
    phone: '9876543210',
    customerPhone: '9876543210',
    orderType: 'dine_in',
    address: 'Table 2',
    table: 'Table 2',
    staff: 'Staff 1 - Floor Captain',
    staffUser: 'staff1',
    receivedBy: 'staff1',
    status: 'CHULHA_PREP',
    paymentStatus: 'PENDING',
    paymentMode: 'CASH',
    items: [
      {
        id: 'handi_paneer',
        name: 'Gaam Handi Paneer Kadhai',
        hindiName: 'गाम हांडी पनीर कढ़ाई',
        price: 299,
        quantity: 1
      },
      {
        id: 'roti_bajra_makhan',
        name: 'Tawa Bajra Roti with Makhan (2 Pcs)',
        hindiName: 'बाजरा रोटी मक्‍खन वाली',
        price: 89,
        quantity: 2
      }
    ],
    notes: 'Extra Desi Ghee on rotis',
    total: 501,
    timestamp: '12:30 PM'
  };

  try {
    const res = await request('/api/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify(posOrderPayload)
    });
    const passed = (res.status === 200 || res.status === 201) && res.data.success;
    recordTest('STAFF_POS', 'Punch POS Dine-In Order (KOT Generation)', passed, `KOT ID: ${testPosOrderId}`);
  } catch (e) {
    recordTest('STAFF_POS', 'Punch POS Dine-In Order (KOT Generation)', false, e.message);
  }

  // 2.5 Generate Table Bill in Billing System
  const testBillId = 'BILL-' + Math.floor(1000 + Math.random() * 9000);
  const billPayload = {
    id: testBillId,
    table: 'Table 2',
    staffUser: 'staff1',
    staffName: 'Staff 1 - Floor Captain',
    customerName: 'Chaudhary Veer',
    customerPhone: '9876543210',
    orderIds: [testPosOrderId],
    items: posOrderPayload.items,
    subtotal: 477,
    gst: 24,
    discount: 0,
    total: 501,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID'
  };

  try {
    const res = await request('/api/bills', {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify(billPayload)
    });
    const passed = (res.status === 200 || res.status === 201) && res.data.success;
    recordTest('STAFF_POS', 'Generate & Settle Table Bill', passed, `Bill ID: ${testBillId}`);
  } catch (e) {
    recordTest('STAFF_POS', 'Generate & Settle Table Bill', false, e.message);
  }

  // 2.6 Verify Bill is Retrievable by Table & Staff
  try {
    const res = await request('/api/bills');
    const billsList = res.data?.bills || (Array.isArray(res.data) ? res.data : []);
    const bill = billsList.find(b => b.id === testBillId);
    const passed = !!bill && bill.paymentStatus === 'PAID';
    recordTest('STAFF_POS', 'Verify Settled Bill in Billing History', passed, `Status: ${bill?.paymentStatus}`);
  } catch (e) {
    recordTest('STAFF_POS', 'Verify Settled Bill in Billing History', false, e.message);
  }

  // --------------------------------------------------------------------------
  // SUITE 3: KITCHEN KDS LOGIN & FEATURES
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 3: KITCHEN DISPLAY SYSTEM (KDS) & PREP TRACKING ---');

  // 3.1 Kitchen Login
  try {
    const res = await request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'kitchen', password: 'kitchen123' })
    });
    const passed = res.status === 200 && res.data.success && !!res.data.token;
    if (passed) kitchenToken = res.data.token;
    recordTest('KITCHEN', 'Kitchen Login via /api/login', passed, `Role: ${res.data?.role}`);
  } catch (e) {
    recordTest('KITCHEN', 'Kitchen Login via /api/login', false, e.message);
  }

  // 3.2 Verify Kitchen Token
  try {
    const res = await request('/api/staff-auth/verify', {
      headers: { Authorization: `Bearer ${kitchenToken}` }
    });
    const passed = res.status === 200 && res.data.success && (res.data.user.role === 'KITCHEN' || res.data.user.role.includes('Kitchen'));
    recordTest('KITCHEN', 'Kitchen Token Verification', passed, `Role: ${res.data?.user?.role}`);
  } catch (e) {
    recordTest('KITCHEN', 'Kitchen Token Verification', false, e.message);
  }

  // 3.3 Query Active Orders in Kitchen
  try {
    const res = await request('/api/orders');
    const orderFound = Array.isArray(res.data) && res.data.some(o => o.id === testPosOrderId);
    recordTest('KITCHEN', 'View Active KOTs on Kitchen Display', orderFound, `Found order: ${testPosOrderId}`);
  } catch (e) {
    recordTest('KITCHEN', 'View Active KOTs on Kitchen Display', false, e.message);
  }

  // 3.4 Kitchen Marks Order as "HANDI_SIMMER" / "CHULHA_PREP"
  try {
    const prepRes = await request(`/api/orders/${testPosOrderId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${kitchenToken}` },
      body: JSON.stringify({
        status: 'HANDI_SIMMER',
        stageIndex: 3,
        updatedBy: 'kitchen'
      })
    });
    const prepPassed = prepRes.status === 200 && prepRes.data.success;
    recordTest('KITCHEN', 'Advance Order Status to HANDI_SIMMER', prepPassed);
  } catch (e) {
    recordTest('KITCHEN', 'Advance Order Status to HANDI_SIMMER', false, e.message);
  }

  // 3.5 Kitchen Marks Order as "FOOD_READY" / "PACKED_READY"
  try {
    const readyRes = await request(`/api/orders/${testPosOrderId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${kitchenToken}` },
      body: JSON.stringify({
        status: 'PACKED_READY',
        stageIndex: 4,
        updatedBy: 'kitchen'
      })
    });
    const readyPassed = readyRes.status === 200 && readyRes.data.success;
    recordTest('KITCHEN', 'Advance Order Status to PACKED_READY', readyPassed);
  } catch (e) {
    recordTest('KITCHEN', 'Advance Order Status to PACKED_READY', false, e.message);
  }

  // --------------------------------------------------------------------------
  // SUITE 4: DELIVERY LOGIN & DISPATCH FEATURES
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 4: DELIVERY LOGIN & RIDER DISPATCH ---');

  // 4.1 Create a Delivery Order for testing Rider dispatch
  const testDeliveryOrderId = 'DELIV-' + Date.now();
  const deliveryOrderPayload = {
    id: testDeliveryOrderId,
    name: 'Kavita Yadav',
    customerName: 'Kavita Yadav',
    phone: '9812345678',
    customerPhone: '9812345678',
    address: 'House 14, Gaam Kheri Chowk, Near Panchayat Bhawan',
    deliveryAddress: 'House 14, Gaam Kheri Chowk, Near Panchayat Bhawan',
    orderType: 'delivery',
    status: 'PACKED_READY',
    paymentStatus: 'PENDING',
    paymentMode: 'COD',
    items: [
      {
        id: 'thali_special',
        name: 'Mhare Gaam Ki Special Thali',
        price: 349,
        quantity: 2
      }
    ],
    total: 738,
    timestamp: '01:00 PM'
  };

  try {
    const createRes = await request('/api/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(deliveryOrderPayload)
    });
    const passed = (createRes.status === 200 || createRes.status === 201) && createRes.data.success;
    recordTest('DELIVERY', 'Create Delivery Customer Order', passed);
  } catch (e) {
    recordTest('DELIVERY', 'Create Delivery Customer Order', false, e.message);
  }

  // 4.2 Delivery Login
  try {
    const res = await request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'delivery', password: 'delivery123' })
    });
    const passed = res.status === 200 && res.data.success && !!res.data.token;
    if (passed) deliveryToken = res.data.token;
    recordTest('DELIVERY', 'Delivery Login via /api/login', passed, `Name: ${res.data?.name}`);
  } catch (e) {
    recordTest('DELIVERY', 'Delivery Login via /api/login', false, e.message);
  }

  // 4.3 Verify Delivery Token
  try {
    const res = await request('/api/staff-auth/verify', {
      headers: { Authorization: `Bearer ${deliveryToken}` }
    });
    const passed = res.status === 200 && res.data.success && (res.data.user.role === 'DELIVERY' || res.data.user.role.includes('Delivery'));
    recordTest('DELIVERY', 'Delivery Token Verification', passed, `Role: ${res.data?.user?.role}`);
  } catch (e) {
    recordTest('DELIVERY', 'Delivery Token Verification', false, e.message);
  }

  // 4.4 Assign Order to Delivery Rider & Update to "OUT_FOR_DELIVERY"
  try {
    const outRes = await request(`/api/orders/${testDeliveryOrderId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${deliveryToken}` },
      body: JSON.stringify({
        status: 'OUT_FOR_DELIVERY',
        stageIndex: 4,
        deliveryUserId: 'usr_delivery1',
        deliveryNotes: 'Dispatched on Gaam Hero Splendor rider bike',
        updatedBy: 'delivery'
      })
    });
    const outPassed = outRes.status === 200 && outRes.data.success;
    recordTest('DELIVERY', 'Rider Accepts & Sets OUT_FOR_DELIVERY', outPassed);
  } catch (e) {
    recordTest('DELIVERY', 'Rider Accepts & Sets OUT_FOR_DELIVERY', false, e.message);
  }

  // 4.5 Rider Marks Order as "DELIVERED" and Collects COD Payment
  try {
    const deliveredRes = await request(`/api/orders/${testDeliveryOrderId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${deliveryToken}` },
      body: JSON.stringify({
        status: 'DELIVERED',
        stageIndex: 5,
        paymentStatus: 'PAID',
        deliveredAt: '01:45 PM',
        updatedBy: 'delivery'
      })
    });
    const deliveredPassed = deliveredRes.status === 200 && deliveredRes.data.success;
    recordTest('DELIVERY', 'Rider Confirms DELIVERED & COD Payment Collected', deliveredPassed);
  } catch (e) {
    recordTest('DELIVERY', 'Rider Confirms DELIVERED & COD Payment Collected', false, e.message);
  }

  // 4.6 Verify Final Order Status is DELIVERED and PAID
  try {
    const res = await request('/api/orders');
    const order = Array.isArray(res.data) && res.data.find(o => o.id === testDeliveryOrderId);
    const passed = !!order && order.status === 'DELIVERED' && order.paymentStatus === 'PAID';
    recordTest('DELIVERY', 'Verify Final Delivered Order Record', passed, `Status: ${order?.status}, Payment: ${order?.paymentStatus}`);
  } catch (e) {
    recordTest('DELIVERY', 'Verify Final Delivered Order Record', false, e.message);
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  const total = testResults.length;
  const passedCount = testResults.filter(r => r.passed).length;
  const failedCount = total - passedCount;
  console.log(`📊 TEST EXECUTION SUMMARY: ${passedCount}/${total} PASSED (${failedCount} failed)`);
  console.log('===============================================================');

  if (failedCount > 0) {
    console.error(`\n⚠️ ${failedCount} tests failed! Reviewing failures:`);
    testResults.filter(r => !r.passed).forEach(f => {
      console.error(` - [${f.suite}] ${f.testName}: ${f.details}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 4 ROLES & FEATURES PASSED COMPLETELY WITHOUT ERRORS!');
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Fatal Test Harness Error:', err);
  process.exit(1);
});
