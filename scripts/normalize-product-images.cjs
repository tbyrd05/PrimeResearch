const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const outDir = path.join(publicDir, 'normalized');

const imageMap = {
  'ghk50.png': 'ghk50.png',
  'bpc_157.png': 'bpc_157.png',
  'mt2.png': 'mt2.png',
  'tirz5.png': 'tirz5.png',
  'sema5.png': 'sema5.png',
  'cjcNdac.png': 'cjcNdac.png',
  'cjcWdac.png': 'cjcWdac.png',
  'reta.png': 'reta.png',
  'ipamorelin.png': 'ipamorelin.png',
  'tesa10.png': 'tesa10.png',
  'bpc tb blend.jpg': 'bpc-tb-blend.png',
  'tb500.jpg': 'tb500.png',
  'glow70.png': 'glow70.png',
  'Peptide_01.png': 'klow80.png',
  'bacwater.png': 'bacwater.png',
  'selank5.png': 'selank5.png',
  'semax5.png': 'semax5.png',
};

const OUTPUT_SIZE = 900;
const CONTENT_BOX = {
  width: 430,
  height: 540,
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getBounds(ctx, width, height) {
  const { data } = ctx.getImageData(0, 0, width, height);
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      // Ignore near-white background pixels.
      if (a < 10 || (r > 244 && g > 244 && b > 244)) {
        continue;
      }

      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  if (right === -1) {
    return { left: 0, top: 0, width, height };
  }

  return {
    left: Math.max(0, left - 8),
    top: Math.max(0, top - 8),
    width: Math.min(width - left, right - left + 17),
    height: Math.min(height - top, bottom - top + 17),
  };
}

async function normalizeImage(inputName, outputName) {
  const inputPath = path.join(publicDir, inputName);
  const outputPath = path.join(outDir, outputName);
  const image = await loadImage(inputPath);

  const sampleCanvas = createCanvas(image.width, image.height);
  const sampleCtx = sampleCanvas.getContext('2d');
  sampleCtx.drawImage(image, 0, 0);

  const bounds = getBounds(sampleCtx, image.width, image.height);

  const canvas = createCanvas(OUTPUT_SIZE, OUTPUT_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const scale = Math.min(CONTENT_BOX.width / bounds.width, CONTENT_BOX.height / bounds.height);
  const drawWidth = bounds.width * scale;
  const drawHeight = bounds.height * scale;
  const dx = (OUTPUT_SIZE - drawWidth) / 2;
  const dy = (OUTPUT_SIZE - drawHeight) / 2;

  ctx.drawImage(
    image,
    bounds.left,
    bounds.top,
    bounds.width,
    bounds.height,
    dx,
    dy,
    drawWidth,
    drawHeight
  );

  fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
}

async function main() {
  ensureDir(outDir);

  for (const [inputName, outputName] of Object.entries(imageMap)) {
    await normalizeImage(inputName, outputName);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
