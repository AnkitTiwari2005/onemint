const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, '..', '.next', 'static', 'css');
if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css') && !f.includes('legacy'));
  if (cssFiles.length > 0) {
    const mainCss = path.join(cssDir, cssFiles[0]);
    console.log(`[postbuild-css] Found active CSS bundle: ${cssFiles[0]}`);

    // Stale CSS hashes that edge CDN caches may still request
    const legacyHashes = [
      'b90636cb31a8ca92.css',
      '8608c2953bc3ab1e.css',
    ];

    for (const legacy of legacyHashes) {
      const dest = path.join(cssDir, legacy);
      fs.copyFileSync(mainCss, dest);
      console.log(`[postbuild-css] Mirrored legacy CSS alias: ${legacy}`);
    }

    // Also mirror to public/_next/static/css for direct static serving fallback
    const pubCssDir = path.join(__dirname, '..', 'public', '_next', 'static', 'css');
    fs.mkdirSync(pubCssDir, { recursive: true });
    for (const legacy of legacyHashes) {
      fs.copyFileSync(mainCss, path.join(pubCssDir, legacy));
    }
    fs.copyFileSync(mainCss, path.join(pubCssDir, cssFiles[0]));
    console.log(`[postbuild-css] Mirrored CSS bundles to public/_next/static/css`);
  }
}
