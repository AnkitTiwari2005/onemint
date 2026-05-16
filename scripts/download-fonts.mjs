/**
 * Downloads all 5 Google Fonts used in layout.tsx as self-hosted woff2 files.
 * Run once: node scripts/download-fonts.mjs
 *
 * Fonts:
 *   - Playfair Display (400, 500, 600, 700, italic variants)
 *   - Lora (400, 500, 600, 700, italic variants)
 *   - Source Serif 4 (400, 600, 700, opsz axis — variable)
 *   - DM Sans (400, 500, 600, 700)
 *   - JetBrains Mono (400, 500, 700)
 */

import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'fonts');

// Google Fonts CSS2 API — requests woff2 format with Latin subset
// The API returns a CSS file with @font-face declarations and woff2 URLs
const FONT_REQUESTS = [
  {
    family: 'Playfair+Display',
    params: 'ital,wght@0,400;0,500;0,600;0,700;1,400;1,600',
    subdir: 'playfair-display',
  },
  {
    family: 'Lora',
    params: 'ital,wght@0,400;0,500;0,600;0,700;1,400;1,600',
    subdir: 'lora',
  },
  {
    family: 'Source+Serif+4',
    params: 'ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400',
    subdir: 'source-serif-4',
  },
  {
    family: 'DM+Sans',
    params: 'ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700',
    subdir: 'dm-sans',
  },
  {
    family: 'JetBrains+Mono',
    params: 'ital,wght@0,400;0,500;0,700;1,400',
    subdir: 'jetbrains-mono',
  },
];

async function fetchText(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function fetchBinary(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

// Parse @font-face blocks from Google Fonts CSS
function parseFontFaces(css) {
  const faces = [];
  const blockRegex = /@font-face\s*\{([^}]+)\}/g;
  let match;
  while ((match = blockRegex.exec(css)) !== null) {
    const block = match[1];
    const urlMatch = block.match(/src:\s*url\(([^)]+)\)/);
    const styleMatch = block.match(/font-style:\s*(\w+)/);
    const weightMatch = block.match(/font-weight:\s*([\d]+)/);
    const commentMatch = css.slice(Math.max(0, match.index - 200), match.index).match(/\/\*\s*([^*]+)\s*\*\/\s*$/);
    if (urlMatch) {
      faces.push({
        url: urlMatch[1].trim(),
        style: styleMatch ? styleMatch[1] : 'normal',
        weight: weightMatch ? weightMatch[1] : '400',
        subset: commentMatch ? commentMatch[1].trim().replace(/\s+/g, '-').toLowerCase() : 'latin',
      });
    }
  }
  return faces;
}

async function downloadFont({ family, params, subdir }) {
  const apiUrl = `https://fonts.googleapis.com/css2?family=${family}:${params}&display=swap&subset=latin`;
  console.log(`\n📥 Fetching CSS for ${family.replace('+', ' ')}...`);

  // Must send a modern User-Agent to get woff2 format
  const css = await fetchText(apiUrl, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });

  const faces = parseFontFaces(css);
  console.log(`   Found ${faces.length} font faces`);

  const fontDir = join(OUT_DIR, subdir);
  await mkdir(fontDir, { recursive: true });

  // Also save the CSS file for reference / local @font-face declarations
  const cssLines = [];

  for (const face of faces) {
    const ext = face.url.split('.').pop().split('?')[0] || 'woff2';
    const filename = `${subdir}-${face.subset}-${face.style}-${face.weight}.${ext}`;
    const filePath = join(fontDir, filename);
    const publicPath = `/fonts/${subdir}/${filename}`;

    console.log(`   ↓ ${filename}`);
    const data = await fetchBinary(face.url);
    await writeFile(filePath, data);

    cssLines.push(`@font-face {
  font-family: '${family.replace(/\+/g, ' ')}';
  font-style: ${face.style};
  font-weight: ${face.weight};
  font-display: swap;
  src: url('${publicPath}') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2020, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}`);
  }

  const cssOut = join(fontDir, `${subdir}.css`);
  await writeFile(cssOut, cssLines.join('\n\n') + '\n');
  console.log(`   ✅ Saved CSS → public/fonts/${subdir}/${subdir}.css`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log('🚀 Downloading fonts to public/fonts/ ...\n');

  for (const font of FONT_REQUESTS) {
    await downloadFont(font);
  }

  console.log('\n✅ All fonts downloaded!');
  console.log('📋 Next step: Run `node scripts/generate-font-css.mjs` to generate the combined CSS\n');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
