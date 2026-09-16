const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Exact SVG of the new LifeEngine logo from image.png
// - Left and right hollow pillars of 'H' in dark navy (#0c2038)
// - Swoosh across crossbar: bottom dark navy wave, thin white gap, top electric cyan/blue swoosh (#0080ff)
// - Wordmark 'LIFEENGINE' in bold geometric dark navy
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="blueWaveGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0066ee" />
      <stop offset="50%" stop-color="#0088ff" />
      <stop offset="100%" stop-color="#26c2ff" />
    </linearGradient>
  </defs>

  <!-- Clean White Background -->
  <rect width="512" height="512" fill="#ffffff" rx="100" />

  <g transform="translate(0, -10)">
    <!-- LEFT PILLAR of 'H' (Dark Navy #0c2038) -->
    <!-- Outer frame: x=168, y=140, w=38, h=164; inner cutout: x=182, y=154, w=10, h=136 -->
    <path 
      d="M 164 136 
         L 204 136 
         L 204 200 
         L 190 200 
         L 190 152 
         L 178 152 
         L 178 240 
         L 164 240 
         Z" 
      fill="#0c2038" 
    />
    <path 
      d="M 164 240
         L 178 240
         L 178 288
         L 190 288
         L 190 248
         L 204 248
         L 204 300
         L 164 300
         Z"
      fill="#0c2038"
    />

    <!-- RIGHT PILLAR of 'H' (Dark Navy #0c2038) -->
    <path 
      d="M 308 136 
         L 348 136 
         L 348 300 
         L 308 300 
         L 308 230 
         L 322 230 
         L 322 286 
         L 334 286 
         L 334 150 
         L 322 150 
         L 322 178 
         L 308 184 
         Z" 
      fill="#0c2038" 
    />

    <!-- LOWER SWOOSH: Navy curved wave flowing from bottom-left up through the center -->
    <path 
      d="M 164 300 
         C 164 250, 180 216, 216 204
         C 252 192, 290 196, 348 226
         C 310 216, 260 210, 222 222
         C 186 234, 178 266, 178 300
         Z" 
      fill="#0c2038" 
    />

    <!-- UPPER DYNAMIC SWOOSH: Electric Blue / Cyan wave curving up and sweeping out past right pillar -->
    <path 
      d="M 204 206 
         C 240 188, 276 182, 320 162
         C 346 150, 370 134, 388 138
         C 378 152, 356 182, 326 196
         C 284 216, 244 212, 204 206
         Z" 
      fill="url(#blueWaveGrad)" 
    />

    <!-- Sleek inner line highlight between swooshes -->
    <path 
      d="M 204 206 
         C 244 196, 280 192, 330 188
         C 358 174, 374 158, 388 138
         C 372 150, 350 170, 324 180
         C 280 196, 240 200, 204 206
         Z"
      fill="#40c4ff"
      opacity="0.8"
    />

    <!-- WORDMARK: LIFEENGINE in bold geometric sans -->
    <text 
      x="256" 
      y="368" 
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Montserrat', sans-serif" 
      font-size="44" 
      font-weight="900" 
      letter-spacing="5" 
      text-anchor="middle" 
      fill="#0c2038">LIFEENGINE</text>
  </g>
</svg>`;

async function buildAllIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  const distDir = path.join(__dirname, '..', 'dist');

  fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgContent);

  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-maskable-512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon.png', size: 64 },
    { name: 'logo.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    const buf = await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, name), buf);

    // Also update dist if dist exists
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, name), buf);
    }
  }

  console.log('Successfully generated all brand icons and logo assets!');
}

buildAllIcons().catch(console.error);
