const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../server/templates');
const destDir = path.join(__dirname, '../server_dist/templates');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy all files from src to dest
const files = fs.readdirSync(srcDir);
files.forEach(file => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(destDir, file);
  fs.copyFileSync(srcFile, destFile);
  console.log(`Copied ${file}`);
});

console.log('Templates copied successfully!');
