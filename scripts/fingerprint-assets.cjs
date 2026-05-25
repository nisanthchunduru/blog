const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const assetsDir = path.join(__dirname, '../backend/public/assets');

function removeExistingFingerprintedAssets() {
  fs.readdirSync(assetsDir)
    .filter(f => /^application-[a-f0-9]{8}\.(css|js)$/.test(f))
    .forEach(f => fs.unlinkSync(path.join(assetsDir, f)));
}

function computeHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

function createFingerprintedCopy(file) {
  const filePath = path.join(assetsDir, file);
  if (!fs.existsSync(filePath)) return null;

  const hash = computeHash(filePath);
  const ext = path.extname(file);
  const name = path.basename(file, ext);
  const fingerprintedName = `${name}-${hash}${ext}`;

  fs.copyFileSync(filePath, path.join(assetsDir, fingerprintedName));
  return fingerprintedName;
}

function fingerprintAssets(fingerprints) {
  fs.writeFileSync(path.join(assetsDir, 'fingerprints.json'), JSON.stringify(fingerprints, null, 2));
  console.log('Asset fingerprints:', fingerprints);
}

removeExistingFingerprintedAssets();

const fingerprints = {};
['application.css', 'application.js'].forEach(file => {
  const fingerprintedName = createFingerprintedCopy(file);
  if (fingerprintedName) fingerprints[file] = fingerprintedName;
});

fingerprintAssets(fingerprints);
