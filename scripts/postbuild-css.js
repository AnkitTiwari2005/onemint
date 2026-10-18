const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, '..', '.next', 'static', 'css');
if (fs.existsSync(cssDir)) {
  // Stale CSS hashes that edge CDN caches may still request
  const legacyHashes = new Set([
    'b90636cb31a8ca92.css',
    '8608c2953bc3ab1e.css',
  ]);

  // Find all CSS bundles excluding legacy aliases, and pick the largest bundle
  const candidates = fs.readdirSync(cssDir)
    .filter(f => f.endsWith('.css') && !f.includes('legacy') && !legacyHashes.has(f))
    .map(f => ({
      name: f,
      size: fs.statSync(path.join(cssDir, f)).size,
    }))
    .sort((a, b) => b.size - a.size);

  if (candidates.length > 0) {
    const mainCssFile = candidates[0].name;
    const mainCss = path.join(cssDir, mainCssFile);
    console.log(`[postbuild-css] Found active CSS bundle: ${mainCssFile} (${candidates[0].size} bytes)`);

    for (const legacy of legacyHashes) {
      const dest = path.join(cssDir, legacy);
      fs.copyFileSync(mainCss, dest);
      console.log(`[postbuild-css] Mirrored legacy CSS alias: ${legacy}`);
    }
  }
}
