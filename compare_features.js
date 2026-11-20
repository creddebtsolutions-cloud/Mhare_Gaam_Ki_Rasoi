const fs = require('fs');

const webMenu = JSON.parse(fs.readFileSync('web/data/menu.json', 'utf8'));
const kotlinRepo = fs.readFileSync('app/src/main/java/com/mharegaam/rasoi/data/repository/MenuRepository.kt', 'utf8');

console.log('=== 1. MENU DISHES PARITY ===');
console.log('Total dishes in web/data/menu.json:', webMenu.length);

let missingInKotlin = [];
let matched = 0;
webMenu.forEach(item => {
  if (kotlinRepo.includes('"' + item.id + '"')) {
    matched++;
  } else {
    missingInKotlin.push(item.id + ' (' + item.name + ')');
  }
});

console.log('Matched in Android MenuRepository:', matched);
console.log('Missing in Android MenuRepository:', missingInKotlin.length === 0 ? 'NONE! 100% matched' : missingInKotlin);

console.log('\n=== 2. DRAWABLES IN ANDROID DRAWABLE FOLDER ===');
const drawableDir = 'app/src/main/res/drawable';
const drawables = fs.readdirSync(drawableDir);
console.log('Total drawables:', drawables.length);

const dishDrawables = [
  'dish_thali.jpg',
  'dish_bajra_saag.jpg',
  'dish_handi_dal.jpg',
  'dish_handi_paneer.jpg',
  'dish_kadhi_pakoda.jpg',
  'dish_churma.jpg',
  'dish_rabri_malpua.jpg',
  'dish_kulhad_lassi.jpg',
  'dish_masala_chaach.jpg',
  'dish_bajra_roti.jpg',
  'dish_smokey_pizza.jpg',
  'dish_cold_coffee.jpg'
];

dishDrawables.forEach(img => {
  const exists = drawables.includes(img);
  console.log(`Drawable ${img}: ${exists ? 'EXISTS (' + Math.round(fs.statSync(drawableDir + '/' + img).size / 1024) + ' KB)' : 'MISSING'}`);
});

console.log('\n=== 3. APP SCREEN NAVIGATION PARITY ===');
const appNav = fs.readFileSync('app/src/main/java/com/mharegaam/rasoi/MhareGaamApp.kt', 'utf8');
const screens = [
  'HomeScreen',
  'MenuScreen',
  'CartScreen',
  'CheckoutScreen',
  'TableBookingScreen',
  'OrdersScreen',
  'OrderTrackingScreen',
  'AdminPortalScreen',
  'StaffLoginScreen',
  'AdminDashboardScreen',
  'KitchenDashboardScreen',
  'DeliveryDashboardScreen',
  'StaffDashboardScreen',
  'StaffManagementScreen',
  'AuditLogsScreen'
];

screens.forEach(s => {
  console.log(`Screen ${s}: ${appNav.includes(s) ? 'CONFIGURED IN NAVHOST' : 'NOT FOUND'}`);
});
