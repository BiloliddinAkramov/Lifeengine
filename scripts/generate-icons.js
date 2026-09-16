import fs from 'fs';
import sharp from 'sharp';

// Exact Brain Logo Matching User Image
// A vibrant blue squircle with a solid pure white brain silhouette,
// split vertically in the center into symmetric left and right hemispheres.

const leftHemispherePath = `
  M 250 166
  C 250 156 242 150 231 150
  C 216 150 204 158 196 170
  C 183 162 168 167 160 180
  C 152 194 155 210 162 220
  C 150 227 142 243 145 259
  C 147 274 157 286 170 291
  C 163 299 165 313 174 324
  C 183 336 197 344 212 344
  C 225 344 237 348 246 348
  C 250 348 250 344 250 338
  L 250 166
  Z
`.trim().replace(/\s+/g, ' ');

// Standard Squircle Icon SVG (512x512)
export const brainIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="blueBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a6ef5" />
      <stop offset="100%" stop-color="#1f5ee7" />
    </linearGradient>
  </defs>
  <!-- Blue Squircle Background -->
  <rect width="512" height="512" rx="138" fill="url(#blueBg)" />

  <!-- Solid White Brain Silhouette -->
  <!-- Left Hemisphere -->
  <path d="${leftHemispherePath}" fill="#ffffff" />
  
  <!-- Right Hemisphere (exact symmetrical mirror) -->
  <g transform="translate(512, 0) scale(-1, 1)">
    <path d="${leftHemispherePath}" fill="#ffffff" />
  </g>
</svg>`;

// Maskable Icon SVG (512x512 with safe area margin)
export const brainMaskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="blueBgMaskable" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a6ef5" />
      <stop offset="100%" stop-color="#1f5ee7" />
    </linearGradient>
  </defs>
  <!-- Full Bleed Background for Adaptive/Maskable Android Icons -->
  <rect width="512" height="512" fill="url(#blueBgMaskable)" />

  <!-- Centered White Brain Silhouette inside Safe Zone (80% scale) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <path d="${leftHemispherePath}" fill="#ffffff" />
    <g transform="translate(512, 0) scale(-1, 1)">
      <path d="${leftHemispherePath}" fill="#ffffff" />
    </g>
  </g>
</svg>`;

async function generateAllIcons() {
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }

  // Save SVG
  fs.writeFileSync('public/icon.svg', brainIconSvg);
  console.log('Saved public/icon.svg');

  const regularBuffer = Buffer.from(brainIconSvg);
  const maskableBuffer = Buffer.from(brainMaskableSvg);

  // 1. icon-512.png
  await sharp(regularBuffer)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile('public/icon-512.png');
  console.log('Generated public/icon-512.png');

  // 2. icon-192.png
  await sharp(regularBuffer)
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile('public/icon-192.png');
  console.log('Generated public/icon-192.png');

  // 3. icon-maskable-512.png
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile('public/icon-maskable-512.png');
  console.log('Generated public/icon-maskable-512.png');

  // 4. apple-touch-icon.png
  await sharp(regularBuffer)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile('public/apple-touch-icon.png');
  console.log('Generated public/apple-touch-icon.png');

  // 5. favicon.png
  await sharp(regularBuffer)
    .resize(64, 64)
    .png({ quality: 100 })
    .toFile('public/favicon.png');
  console.log('Generated public/favicon.png');

  // Also copy to dist if dist/ exists
  if (fs.existsSync('dist')) {
    fs.copyFileSync('public/icon.svg', 'dist/icon.svg');
    fs.copyFileSync('public/icon-512.png', 'dist/icon-512.png');
    fs.copyFileSync('public/icon-192.png', 'dist/icon-192.png');
    fs.copyFileSync('public/icon-maskable-512.png', 'dist/icon-maskable-512.png');
    fs.copyFileSync('public/apple-touch-icon.png', 'dist/apple-touch-icon.png');
    fs.copyFileSync('public/favicon.png', 'dist/favicon.png');
    console.log('Synchronized icons to dist/');
  }

  console.log('All icons generated successfully and match user logo!');
}

generateAllIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
