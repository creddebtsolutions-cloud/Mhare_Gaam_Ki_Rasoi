const fs = require('fs');
const path = require('path');

function findManifests(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const f of list) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        results = results.concat(findManifests(full));
      } else if (f === 'AndroidManifest.xml') {
        results.push(full);
      }
    }
  } catch (e) {}
  return results;
}

const manifests = findManifests('C:/Users/Er. Gaurav Singh/.gradle/build-rasoi/app/intermediates');
manifests.forEach(m => {
  const content = fs.readFileSync(m, 'utf8');
  if (content.includes('targetSdkVersion')) {
    console.log('Manifest:', m);
    const targetSdk = content.match(/android:targetSdkVersion="([^"]+)"/);
    const minSdk = content.match(/android:minSdkVersion="([^"]+)"/);
    const versionCode = content.match(/android:versionCode="([^"]+)"/);
    const versionName = content.match(/android:versionName="([^"]+)"/);
    console.log('  targetSdkVersion:', targetSdk ? targetSdk[1] : 'N/A');
    console.log('  minSdkVersion:   ', minSdk ? minSdk[1] : 'N/A');
    console.log('  versionCode:     ', versionCode ? versionCode[1] : 'N/A');
    console.log('  versionName:     ', versionName ? versionName[1] : 'N/A');
  }
});

const { execSync } = require('child_process');
const aapt = path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk', 'build-tools', '34.0.0', 'aapt2.exe');
if (fs.existsSync(aapt)) {
  console.log('\n--- AAPT2 DUMP BADGING on MhareGaamKiRasoi-release.apk ---');
  try {
    const cmd = `"${aapt}" dump badging MhareGaamKiRasoi-release.apk`;
    const out = execSync(cmd, { encoding: 'utf8' });
    out.split('\n').forEach(line => {
      if (line.startsWith('package:') || line.startsWith('targetSdkVersion:') || line.startsWith('application-label:')) {
        console.log(line);
      }
    });
  } catch (err) {
    console.error('Error running aapt2:', err.message);
  }
}
