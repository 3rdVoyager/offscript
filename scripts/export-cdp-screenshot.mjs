import fs from 'node:fs';

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/export-cdp-screenshot.mjs <cdp-json> <output.png>');
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const base64 = payload.result?.data ?? payload.data;

if (!base64) {
  console.error('No screenshot data found in JSON.');
  process.exit(1);
}

fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'));
const buffer = fs.readFileSync(outputPath);
const width = buffer.readUInt32BE(16);
const height = buffer.readUInt32BE(20);
console.log(`Wrote ${outputPath} (${width}x${height})`);
