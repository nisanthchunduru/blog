const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const assetsDir = path.join(__dirname, '../backend/public/assets');
const publicDir = path.join(__dirname, '../backend/public');
const fingerprintedDir = path.join(publicDir, 'assets/fingerprinted');

function cleanFingerprintedDir() {
  if (fs.existsSync(fingerprintedDir)) {
    fs.rmSync(fingerprintedDir, { recursive: true });
  }
  fs.mkdirSync(fingerprintedDir, { recursive: true });
}

function computeHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

function createFingerprintedCopy(file) {
  const filePath = path.join(assetsDir, file);
  if (!fs.existsSync(filePath)) return null;

  const hash = computeHash(filePath);
  const dir = path.dirname(file);
  const ext = path.extname(file);
  const name = path.basename(file, ext);
  const fingerprintedName = `${name}-${hash}${ext}`;
  const outputDir = path.join(fingerprintedDir, dir);
  
  fs.mkdirSync(outputDir, { recursive: true });
  fs.copyFileSync(filePath, path.join(outputDir, fingerprintedName));
  
  return dir === '.' ? `fingerprinted/${fingerprintedName}` : `fingerprinted/${dir}/${fingerprintedName}`;
}

cleanFingerprintedDir();

const fingerprints = {};
['application.css', 'application.js', 'images/favicon.svg', 'images/logo.svg'].forEach(file => {
  const fingerprintedPath = createFingerprintedCopy(file);
  if (fingerprintedPath) fingerprints[file] = fingerprintedPath;
});

fs.writeFileSync(path.join(publicDir, 'assets/fingerprints.json'), JSON.stringify(fingerprints, null, 2));
console.log('Asset fingerprints:', fingerprints);
