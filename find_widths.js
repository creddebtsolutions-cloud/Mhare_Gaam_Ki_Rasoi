const fs = require('fs');

const css = fs.readFileSync('web/admin.css', 'utf8');
const lines = css.split('\n');

console.log('--- Searching for fixed width or min-width in admin.css ---');
lines.forEach((line, i) => {
  if (line.match(/(min-width|width)\s*:\s*\d{3,}px/) && !line.includes('max-width')) {
    console.log(`${i + 1}: ${line}`);
  }
});
