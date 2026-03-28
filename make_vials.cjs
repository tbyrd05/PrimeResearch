const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const products = [
  { id: 1,  name: 'GHK-CU',             size: '50mg',  file: 'vial_1' },
  { id: 2,  name: 'BPC-157',            size: '5mg',   file: 'vial_2' },
  { id: 3,  name: 'MT-2',               size: '10mg',  file: 'vial_3' },
  { id: 4,  name: 'TIRZEPATIDE',        size: '5mg',   file: 'vial_4' },
  { id: 5,  name: 'SEMAGLUTIDE',        size: '2mg',   file: 'vial_5' },
  { id: 6,  name: 'CJC-1295\nNO DAC',  size: '5mg',   file: 'vial_6' },
  { id: 13, name: 'CJC-1295\nW/ DAC',  size: '5mg',   file: 'vial_13' },
  { id: 8,  name: 'RETATRUTIDE',        size: '10mg',  file: 'vial_8' },
  { id: 9,  name: 'IPAMORELIN',         size: '2mg',   file: 'vial_9' },
  { id: 12, name: 'TESAMORELIN',        size: '10mg',  file: 'vial_12' },
  { id: 15, name: 'BPC-157/\nTB-500',  size: '10mg',  file: 'vial_15' },
  { id: 25, name: 'TB-500',             size: '5mg',   file: 'vial_25' },
  { id: 26, name: 'GLOW',              size: '70mg',  file: 'vial_26' },
  { id: 27, name: 'KLOW',              size: '80mg',  file: 'vial_27' },
  { id: 28, name: 'BACTERIOSTATIC\nWATER', size: '10mL', file: 'vial_28' },
  { id: 19, name: 'SELANK',             size: '5mg',   file: 'vial_19' },
  { id: 20, name: 'SEMAX',              size: '5mg',   file: 'vial_20' },
];

async function makeVial(product, baseImage) {
  const W = baseImage.width;
  const H = baseImage.height;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Draw the real vial photo — blank label already in it
  ctx.drawImage(baseImage, 0, 0, W, H);

  // ── Precise label bounds measured from vial_v5_base_blank photo
  // The white paper label on the vial sits at roughly these coordinates:
  const lblX  = W * 0.185;   // left edge of label
  const lblY  = H * 0.468;   // top edge of label
  const lblW  = W * 0.63;    // label width
  const lblH  = H * 0.302;   // label height

  const cx = lblX + lblW / 2; // horizontal center

  // ── ROW 1: Logo + Brand name (top ~20% of label)
  const headerH = lblH * 0.22;
  const brandFontSize = Math.round(lblH * 0.10);
  ctx.font = `800 ${brandFontSize}px sans-serif`;
  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw simple molecule nodes icon before brand text
  const iconY = lblY + headerH * 0.5;
  const measured = ctx.measureText('PRIME RESEARCH');
  const totalW = measured.width;
  const iconR = brandFontSize * 0.27;
  const startX = cx - totalW / 2 - iconR * 3.5;

  // draw 3 connected dots (molecular icon)
  [[0,0],[2.3,-0.9],[2.5,0.9]].forEach(([dx,dy], i) => {
    ctx.beginPath();
    ctx.arc(startX + dx * iconR, iconY + dy * iconR, i===0 ? iconR : iconR*0.7, 0, Math.PI*2);
    ctx.fillStyle = '#111111';
    ctx.fill();
  });
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = iconR * 0.55;
  ctx.lineCap = 'round';
  // bond 1
  ctx.beginPath(); ctx.moveTo(startX + iconR, iconY); ctx.lineTo(startX + 1.9*iconR, iconY - 0.7*iconR); ctx.stroke();
  // bond 2
  ctx.beginPath(); ctx.moveTo(startX + iconR, iconY); ctx.lineTo(startX + 2.0*iconR, iconY + 0.7*iconR); ctx.stroke();

  // brand text next to icon
  ctx.font = `800 ${brandFontSize}px sans-serif`;
  ctx.fillStyle = '#111111';
  ctx.textAlign = 'left';
  ctx.fillText('PRIME RESEARCH', cx - totalW / 2, iconY);

  // ── Thin divider line
  const divY = lblY + headerH;
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1.0;
  ctx.beginPath(); ctx.moveTo(lblX + lblW*0.04, divY); ctx.lineTo(lblX + lblW*0.96, divY); ctx.stroke();

  // ── ROW 2: Peptide Name (middle ~42% of label)
  const nameAreaY = divY;
  const nameAreaH = lblH * 0.42;
  const nameLines = product.name.split('\n');
  const rawNameFS = nameLines.length > 1 ? nameAreaH * 0.37 : nameAreaH * 0.42;
  const nameFontSize = Math.round(rawNameFS);
  ctx.font = `900 ${nameFontSize}px sans-serif`;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (nameLines.length > 1) {
    const gap = nameFontSize * 1.05;
    const mid = nameAreaY + nameAreaH * 0.42;
    ctx.fillText(nameLines[0], cx, mid - gap * 0.5);
    ctx.fillText(nameLines[1], cx, mid + gap * 0.5);
  } else {
    ctx.fillText(product.name, cx, nameAreaY + nameAreaH * 0.44);
  }

  // ── ROW 3: Dose badge (black pill, ~18% of label)
  const badgeAreaY = nameAreaY + nameAreaH;
  const badgeAreaH = lblH * 0.18;
  const badgeFontSize = Math.round(badgeAreaH * 0.52);
  ctx.font = `700 ${badgeFontSize}px sans-serif`;
  const bTxtW = ctx.measureText(product.size).width;
  const bPadX = lblW * 0.075;
  const bPadY = badgeFontSize * 0.28;
  const bW = bTxtW + bPadX * 2;
  const bH = badgeFontSize + bPadY * 2;
  const bX = cx - bW / 2;
  const bY = badgeAreaY + (badgeAreaH - bH) / 2;
  const br = bH * 0.22;

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(bX + br, bY);
  ctx.lineTo(bX + bW - br, bY); ctx.arcTo(bX+bW, bY, bX+bW, bY+br, br);
  ctx.lineTo(bX + bW, bY + bH - br); ctx.arcTo(bX+bW, bY+bH, bX+bW-br, bY+bH, br);
  ctx.lineTo(bX + br, bY + bH); ctx.arcTo(bX, bY+bH, bX, bY+bH-br, br);
  ctx.lineTo(bX, bY + br); ctx.arcTo(bX, bY, bX+br, bY, br);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${badgeFontSize}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(product.size, cx, bY + bH / 2);

  // ── ROW 4: Footer text (bottom ~18% of label) — dark text on white label
  const footerY = badgeAreaY + badgeAreaH;
  const footerH = lblH * 0.18;
  const footerFontSize = Math.round(footerH * 0.3);

  ctx.fillStyle = '#111111';
  ctx.font = `700 ${footerFontSize}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('FOR RESEARCH USE ONLY', cx, footerY + footerH * 0.3);
  ctx.font = `500 ${footerFontSize * 0.85}px sans-serif`;
  ctx.fillStyle = '#444444';
  ctx.fillText('NOT FOR HUMAN CONSUMPTION', cx, footerY + footerH * 0.7);

  const outPath = path.join(__dirname, 'public', `${product.file}.png`);
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log(`✓ ${product.file}.png`);
}

async function main() {
  // Use the V5 base that has a real blank paper label already on the vial
  const basePath = path.join(__dirname, 'public', 'peptide_vial_v5.png');
  if (!fs.existsSync(basePath)) { console.error('Missing peptide_vial_v5.png'); process.exit(1); }
  const baseImage = await loadImage(basePath);
  console.log(`Base: ${baseImage.width}x${baseImage.height}`);
  for (const p of products) { await makeVial(p, baseImage); }
  console.log('\nAll done!');
}
main().catch(console.error);
