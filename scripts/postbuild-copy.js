/**
 * postbuild-copy.js
 * Cross-platform replacement for `cp -r public .next/standalone/public &&
 * cp -r .next/static .next/standalone/.next/static` that works on both
 * Windows and Linux (the latter is where Hostinger actually runs the build).
 *
 * Called from the `postbuild` npm script after next build completes.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`[postbuild-copy] Skipping missing source: ${path.relative(root, src)}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src,  entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const copies = [
  { src: path.join(root, 'public'),            dest: path.join(root, '.next', 'standalone', 'public') },
  { src: path.join(root, '.next', 'static'),   dest: path.join(root, '.next', 'standalone', '.next', 'static') },
];

for (const { src, dest } of copies) {
  copyDir(src, dest);
  console.log(`[postbuild-copy] Copied ${path.relative(root, src)} → ${path.relative(root, dest)}`);
}
