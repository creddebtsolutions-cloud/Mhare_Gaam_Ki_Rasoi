const fs = require('fs');
const https = require('https');

const filePath = 'C:/Users/Er. Gaurav Singh/.gemini/antigravity-ide/brain/2a9a71c8-336d-4286-b628-d7afafb759ca/.user_uploaded/media_1791349056555.png';
const fileData = fs.readFileSync(filePath);

const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
const postHeader = Buffer.from(
  `--${boundary}\r\n` +
  `Content-Disposition: form-data; name="file"; filename="qr.png"\r\n` +
  `Content-Type: image/png\r\n\r\n`
);
const postFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
const payload = Buffer.concat([postHeader, fileData, postFooter]);

const req = https.request('https://api.qrserver.com/v1/read-qr-code/', {
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': payload.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('QR Code Result:', body);
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(payload);
req.end();
