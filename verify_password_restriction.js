const fs = require('fs');

const adminHtml = fs.readFileSync('web/admin.html', 'utf8');
const adminJs = fs.readFileSync('web/admin.js', 'utf8');

// 1. Check admin.html: openChangePasswordModalBtn has admin-only-settings-btn and style="display: none;"
console.log('--- Checking admin.html ---');
const hasAdminOnlyClass = adminHtml.includes('id="openChangePasswordModalBtn"') && 
  adminHtml.includes('admin-only-settings-btn" id="openChangePasswordModalBtn"');
console.log('openChangePasswordModalBtn has admin-only class:', hasAdminOnlyClass);

const hasDisplayNone = adminHtml.includes('id="openChangePasswordModalBtn"') &&
  adminHtml.includes('id="openChangePasswordModalBtn"\n            title="Change Admin Password" style="display: none;"');
console.log('openChangePasswordModalBtn has style="display: none;":', hasDisplayNone);

// 2. Check admin.js: applyRolePermissions hides for staff, kitchen, delivery
console.log('\n--- Checking admin.js ---');
const staffHides = adminJs.includes("lowerRole.includes('staff')") &&
  adminJs.includes("if (btnChangePwd) btnChangePwd.style.display = 'none';");
console.log('Staff role hides change password:', staffHides);

const adminShows = adminJs.includes("if (btnChangePwd) btnChangePwd.style.display = 'inline-flex';");
console.log('Admin role shows change password:', adminShows);

const handleChangePasswordGuarded = adminJs.includes("if (!isCurrentUserAdmin()) {");
console.log('handleChangePassword guarded by isCurrentUserAdmin():', handleChangePasswordGuarded);

// 3. Check server.js: /api/change-password endpoint
const serverJs = fs.readFileSync('web/server.js', 'utf8');
console.log('\n--- Checking server.js ---');
const serverRestricted = serverJs.includes("if (!u.includes('admin') && u !== 'gaurav' && u !== 'master')");
console.log('Server /api/change-password endpoint restricted to admin:', serverRestricted);
