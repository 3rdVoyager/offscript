import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Captures only `.app-main` (no sidebar). Run against preview for clean output:
// npm run build && npm run preview -- --port 4322
// SCREENSHOT_BASE_URL=http://localhost:4322 npm run screenshots
const baseUrl = process.env.SCREENSHOT_BASE_URL || 'http://localhost:4321';
const outputDir = join(process.cwd(), 'public', 'assets', 'screenshots');

const shots = [
  { path: '/app/manage/scripts/add/', file: 'offscript-import.png' },
  { path: '/app/manage/scripts/', file: 'offscript-scripts.png' },
  { path: '/app/script/overview/', file: 'offscript-overview.png' },
  { path: '/app/practice/type/', file: 'offscript-type.png' },
  { path: '/app/script/progress/', file: 'offscript-progress.png' },
];

async function seedExampleScript(page) {
  const script = JSON.parse(
    readFileSync(join(process.cwd(), 'public/example-scripts/two-noble-kinsmen.json'), 'utf8'),
  );

  await page.goto(`${baseUrl}/app/`, { waitUntil: 'networkidle' });
  await page.evaluate((scriptData) => {
    const id = crypto.randomUUID();
    const stored = { ...scriptData, id };
    localStorage.setItem(
      'offscript-scripts',
      JSON.stringify({ activeScriptId: id, scripts: [stored] }),
    );
  }, script);
}

async function preparePage(page) {
  await page.evaluate(() => {
    document.querySelector('astro-dev-toolbar')?.remove();
    window.scrollTo(0, 0);
  });
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
});

await seedExampleScript(page);

for (const shot of shots) {
  await page.goto(`${baseUrl}${shot.path}`, { waitUntil: 'networkidle' });
  await preparePage(page);

  const main = page.locator('.app-main');
  await main.waitFor({ state: 'visible' });

  const box = await main.boundingBox();
  if (!box) {
    throw new Error(`Could not measure .app-main on ${shot.path}`);
  }

  const maxHeight = page.viewportSize()?.height ?? 800;
  await page.screenshot({
    path: join(outputDir, shot.file),
    animations: 'disabled',
    clip: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: Math.min(box.height, maxHeight),
    },
  });

  console.log(`Captured ${shot.file}`);
}

await browser.close();
