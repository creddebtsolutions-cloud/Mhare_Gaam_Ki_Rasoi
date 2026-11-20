const http = require('http');

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  // Test 1: Staff user attempting to change password
  const staffRes = await postJson('/api/change-password', {
    username: 'staff1',
    currentPassword: '123',
    newPassword: 'newpassword123'
  });
  console.log('Staff change password result:', staffRes.status, staffRes.data);

  // Test 2: Delivery user attempting to change password
  const deliveryRes = await postJson('/api/change-password', {
    username: 'delivery1',
    currentPassword: '123',
    newPassword: 'newpassword123'
  });
  console.log('Delivery change password result:', deliveryRes.status, deliveryRes.data);

  // Test 3: Kitchen user attempting to change password
  const kitchenRes = await postJson('/api/change-password', {
    username: 'kitchen',
    currentPassword: '123',
    newPassword: 'newpassword123'
  });
  console.log('Kitchen change password result:', kitchenRes.status, kitchenRes.data);
}

run().catch(console.error);
