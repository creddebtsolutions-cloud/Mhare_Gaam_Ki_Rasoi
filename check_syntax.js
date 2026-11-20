const fs = require('fs');
const vm = require('vm');

function checkFile(path) {
  try {
    const code = fs.readFileSync(path, 'utf8');
    new vm.Script(code);
    console.log(`${path}: Syntax OK!`);
  } catch (err) {
    console.error(`${path}: Syntax ERROR:`, err.message);
    process.exit(1);
  }
}

checkFile('web/admin.js');
checkFile('web/server.js');
