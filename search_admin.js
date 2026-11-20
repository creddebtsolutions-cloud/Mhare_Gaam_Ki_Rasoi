const fs = require('fs');
const content = fs.readFileSync('web/admin.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('initRoleSelector') || line.includes('login-role-tab') || line.includes('data-role')) {
    console.log(`${i + 1}: ${line}`);
  }
});
