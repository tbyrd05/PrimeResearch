const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

const products = [
  { id: 1,  name: 'GHK-CU',              size: '50MG',  file: 'vial_1' },
  { id: 2,  name: 'BPC-157',             size: '5MG',   file: 'vial_2' },
  { id: 3,  name: 'MT-2',               size: '10MG',  file: 'vial_3' },
  { id: 4,  name: 'TIRZEPATIDE',        size: '5MG',   file: 'vial_4' },
  { id: 5,  name: 'SEMAGLUTIDE',        size: '2MG',   file: 'vial_5' },
  { id: 6,  name: 'CJC-1295 NO DAC',   size: '5MG',   file: 'vial_6' },
  { id: 13, name: 'CJC-1295 W/ DAC',   size: '5MG',   file: 'vial_13' },
  { id: 8,  name: 'RETATRUTIDE',        size: '10MG',  file: 'vial_8' },
  { id: 9,  name: 'IPAMORELIN',         size: '2MG',   file: 'vial_9' },
  { id: 12, name: 'TESAMORELIN',        size: '10MG',  file: 'vial_12' },
  { id: 15, name: 'BPC-157/TB-500',     size: '10MG',  file: 'vial_15' },
  { id: 25, name: 'TB-500',             size: '5MG',   file: 'vial_25' },
  { id: 26, name: 'GLOW BLEND',         size: '70MG',  file: 'vial_26' },
  { id: 27, name: 'KLOW BLEND',         size: '80MG',  file: 'vial_27' },
  { id: 28, name: 'BACTERIOSTATIC\nWATER', size: '10ML',  file: 'vial_28' },
  { id: 19, name: 'SELANK',             size: '5MG',   file: 'vial_19' },
  { id: 20, name: 'SEMAX',              size: '5MG',   file: 'vial_20' },
];

async function makeVial(product, baseImage) {
  const W = baseImage.width;
  const H = baseImage.height;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Draw base vial photo
  ctx.drawImage(baseImage, 0, 0, W, H);

  // Label dimensions — positioned over the blank white label area in the photo
  // The vial label area sits roughly 38%–75% down the image, centered horizontally
  const labelW = W * 0.52;
  const labelH = H * 0.30;
  const labelX = (W - labelW) / 2;
  const labelY = H * 0.40;

  // ── Label background (white, slightly textured with gradient for realism)
  const bg = ctx.createLinearGradient(labelX, 0, labelX + labelW, 0);
  bg.addColorStop(0,   'rgba(235,240,248,1)');
  bg.addColorStop(0.12,'rgba(255,255,255,1)');
  bg.addColorStop(0.88,'rgba(255,255,255,1)');
  bg.addColorStop(1,   'rgba(235,240,248,1)');
  ctx.fillStyle = bg;
  ctx.fillRect(labelX, labelY, labelW, labelH);

  // ── Cylindrical shading — dark edges
  const shade = ctx.createLinearGradient(labelX, 0, labelX + labelW, 0);
  shade.addColorStop(0,    'rgba(0,0,0,0.06)');
  shade.addColorStop(0.08, 'rgba(0,0,0,0)');
  shade.addColorStop(0.92, 'rgba(0,0,0,0)');
  shade.addColorStop(1,    'rgba(0,0,0,0.06)');
  ctx.fillStyle = shade;
  ctx.fillRect(labelX, labelY, labelW, labelH);

  // ── Specular highlight (diagonal glare)
  const glare = ctx.createLinearGradient(labelX + labelW * 0.2, labelY, labelX + labelW * 0.6, labelY + labelH);
  glare.addColorStop(0,   'rgba(255,255,255,0)');
  glare.addColorStop(0.4, 'rgba(255,255,255,0.3)');
  glare.addColorStop(0.6, 'rgba(255,255,255,0.15)');
  glare.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = glare;
  ctx.fillRect(labelX, labelY, labelW, labelH);

  // ── SECTION: Header  ─────────────────────────────────
  const headerH = labelH * 0.22;
  const brandFontSize = Math.round(labelH * 0.10);
  ctx.fillStyle = '#0f1f4d';   // dark navy
  ctx.font = `900 ${brandFontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PRIME RESEARCH', labelX + labelW / 2, labelY + headerH / 2);

  // ── Divider line
  const divY = labelY + headerH;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(labelX + 4, divY);
  ctx.lineTo(labelX + labelW - 4, divY);
  ctx.stroke();

  // ── SECTION: Peptide Name ────────────────────────────
  const nameLines = product.name.split('\n');
  const nameFontSize = nameLines.length > 1
    ? Math.round(labelH * 0.115)
    : Math.round(labelH * 0.145);
  ctx.fillStyle = '#000000';
  ctx.font = `900 ${nameFontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const nameMidY = labelY + headerH + (labelH * 0.38);
  if (nameLines.length > 1) {
    ctx.fillText(nameLines[0], labelX + labelW / 2, nameMidY - nameFontSize * 0.6);
    ctx.fillText(nameLines[1], labelX + labelW / 2, nameMidY + nameFontSize * 0.6);
  } else {
    ctx.fillText(product.name, labelX + labelW / 2, nameMidY);
  }

  // ── Dose badge (black pill)
  const badgeFontSize = Math.round(labelH * 0.085);
  ctx.font = `900 ${badgeFontSize}px sans-serif`;
  const badgeW = ctx.measureText(product.size).width + labelW * 0.16;
  const badgeH = badgeFontSize * 1.7;
  const badgeX = labelX + labelW / 2 - badgeW / 2;
  const badgeY = labelY + headerH + labelH * 0.60;
  const rx = badgeH / 4; // corner radius
  ctx.fillStyle = '#000000';
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, rx);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${badgeFontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(product.size, labelX + labelW / 2, badgeY + badgeH / 2);

  // ── SECTION: Footer (black strip) ───────────────────
  const footerH = labelH * 0.18;
  const footerY = labelY + labelH - footerH;
  ctx.fillStyle = '#000000';
  ctx.fillRect(labelX, footerY, labelW, footerH);

  const footerFontSize = Math.round(labelH * 0.056);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${footerFontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FOR RESEARCH USE ONLY', labelX + labelW / 2, footerY + footerH * 0.38);
  ctx.font = `500 ${footerFontSize * 0.82}px sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('NOT FOR HUMAN CONSUMPTION', labelX + labelW / 2, footerY + footerH * 0.72);

  // ── Label border (very subtle, blends with glare)
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  ctx.strokeRect(labelX, labelY, labelW, labelH);

  // Output
  const outPath = path.join(__dirname, 'public', `${product.file}.png`);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buf);
  console.log(`✓ ${product.file}.png — ${product.name} ${product.size}`);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function main() {
  const basePath = path.join(__dirname, 'public', 'peptide_vial_v5.png');
  let baseImage;
  try {
    baseImage = await loadImage(basePath);
  } catch(e) {
    // fallback to original
    baseImage = await loadImage(path.join(__dirname, 'public', 'peptide_vial_product_1774468006550.png'));
  }
  console.log(`Base image: ${baseImage.width}x${baseImage.height}`);
  for (const p of products) {
    await makeVial(p, baseImage);
  }
  console.log('\nAll vial images generated!');
}

main().catch(console.error);
