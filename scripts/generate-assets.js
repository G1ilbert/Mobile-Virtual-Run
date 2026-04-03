const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const YELLOW = '#F2CC0F';
const DARK_BG = '#1A1A1A';

const assetsDir = path.join(__dirname, '..', 'assets');

// Helper: SVG to PNG buffer via sharp
async function svgToPng(svgStr, width, height, outPath) {
  const buf = Buffer.from(svgStr);
  await sharp(buf, { density: 300 })
    .resize(width, height)
    .png()
    .toFile(outPath);
  console.log(`Created: ${outPath} (${width}x${height})`);
}

// ===== APP ICON (1024x1024) =====
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <!-- Dark background -->
  <rect width="1024" height="1024" fill="${DARK_BG}"/>

  <!-- "K" letter -->
  <text x="512" y="580"
    font-family="Arial, sans-serif"
    font-weight="900"
    font-size="580"
    text-anchor="middle"
    fill="${YELLOW}">K</text>

  <!-- Underline -->
  <line x1="260" y1="730" x2="764" y2="730" stroke="${YELLOW}" stroke-width="10" stroke-linecap="round"/>

  <!-- Tagline -->
  <text x="512" y="820"
    font-family="Arial, sans-serif"
    font-weight="300"
    font-size="52"
    letter-spacing="6"
    text-anchor="middle"
    fill="${YELLOW}">ก้าวต่อไป</text>
</svg>`;

// ===== ADAPTIVE ICON FOREGROUND (1024x1024, transparent bg) =====
const adaptiveSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <!-- Transparent background -->

  <!-- "K" letter — slightly smaller for safe zone -->
  <text x="512" y="560"
    font-family="Arial, sans-serif"
    font-weight="900"
    font-size="480"
    text-anchor="middle"
    fill="${YELLOW}">K</text>

  <!-- Underline -->
  <line x1="300" y1="700" x2="724" y2="700" stroke="${YELLOW}" stroke-width="8" stroke-linecap="round"/>

  <!-- Tagline -->
  <text x="512" y="790"
    font-family="Arial, sans-serif"
    font-weight="300"
    font-size="46"
    letter-spacing="6"
    text-anchor="middle"
    fill="${YELLOW}">ก้าวต่อไป</text>
</svg>`;

// ===== SPLASH SCREEN (1284x2778) =====
const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1284" height="2778" viewBox="0 0 1284 2778">
  <!-- Dark background -->
  <rect width="1284" height="2778" fill="${DARK_BG}"/>

  <!-- Large "K" watermark (subtle) -->
  <text x="642" y="1500"
    font-family="Arial, sans-serif"
    font-weight="900"
    font-size="900"
    text-anchor="middle"
    fill="${YELLOW}"
    opacity="0.04">K</text>

  <!-- Brand name -->
  <text x="642" y="1330"
    font-family="Arial, sans-serif"
    font-weight="300"
    font-size="80"
    letter-spacing="16"
    text-anchor="middle"
    fill="${YELLOW}">KAOTORPAI</text>

  <!-- Divider line -->
  <line x1="442" y1="1370" x2="842" y2="1370" stroke="${YELLOW}" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>

  <!-- Thai tagline -->
  <text x="642" y="1430"
    font-family="Arial, sans-serif"
    font-weight="300"
    font-size="42"
    letter-spacing="6"
    text-anchor="middle"
    fill="${YELLOW}"
    opacity="0.85">ก้าวต่อไป</text>
</svg>`;

async function main() {
  await svgToPng(iconSvg, 1024, 1024, path.join(assetsDir, 'icon.png'));
  await svgToPng(adaptiveSvg, 1024, 1024, path.join(assetsDir, 'adaptive-icon.png'));
  await svgToPng(splashSvg, 1284, 2778, path.join(assetsDir, 'splash.png'));
  console.log('\nAll assets created successfully!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
