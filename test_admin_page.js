const http = require('http');

http.get('http://localhost:3000/admin.html', (res) => {
  console.log('admin.html status code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Contains phoneFrame:', data.includes('id="phoneFrame"'));
    console.log('Contains preview-toolbar:', data.includes('class="preview-toolbar"'));
    console.log('Contains role-preview-chips:', data.includes('class="role-preview-chips"'));
    console.log('Contains adminPhoneViewport:', data.includes('id="adminPhoneViewport"'));
    console.log('Contains android-status-bar:', data.includes('class="android-status-bar"'));
  });
});
