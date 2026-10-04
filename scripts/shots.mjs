// Walks the main flow at iPhone size and saves screenshots for visual review.
import { chromium } from '@playwright/test';

const OUT = process.env.OUT || 'shots';
const BASE = process.env.BASE || 'http://localhost:4173/';
const wide = process.env.WIDE === '1';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined,
});
const ctx = await browser.newContext(
  wide
    ? { viewport: { width: 1180, height: 820 }, deviceScaleFactor: 1 }
    : { viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'en-US' },
);
// In sandboxes where Chromium doesn't trust the egress proxy's CA, fetch photos with curl instead.
if (process.env.CURL_IMAGES) {
  const { execFileSync } = await import('node:child_process');
  await ctx.route(/themealdb\.com/, (route) => {
    try {
      const body = execFileSync('curl', ['-sS', '--max-time', '20', route.request().url()]);
      return route.fulfill({ status: 200, contentType: 'image/jpeg', body });
    } catch {
      return route.abort();
    }
  });
}
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
const shot = async (name) => {
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}.png` });
};
const cont = () => page.getByRole('button', { name: /^Continue/ }).click();

await page.goto(BASE);
await page.waitForSelector('.welcome');
await shot('01-welcome');
await page.getByRole('button', { name: /Get started/ }).click();
await shot('02-store');
await cont();
await shot('03-budget');
await cont();
await shot('04-diet');
await cont();
await page.getByRole('button', { name: /Quick prep/ }).click();
await page.getByRole('button', { name: /High protein/ }).click();
await page.getByRole('button', { name: /Healthy/ }).click();
await page.getByRole('button', { name: /Comfort food/ }).click();
await shot('05-priorities');
await cont();
await page.getByRole('button', { name: 'Air fryer', exact: true }).first().click();
await shot('06-kitchen');
await cont();
await shot('07-dislikes');
await cont();
await shot('08-days');
await cont();
await page.waitForTimeout(700);
await shot('09-planning');
await page.waitForSelector('.plan-head', { timeout: 10000 });
await page.waitForTimeout(1500);
await shot('10-plan');
await page.evaluate(() => window.scrollTo(0, 600));
await shot('11-plan-scrolled');
await page.evaluate(() => window.scrollTo(0, 0));
{
  // Press and hold the first meal card to open the swap sheet.
  const box = await page.locator('.meal-card').first().boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(700);
  await page.mouse.up();
}
await shot('12-swap');
await page.keyboard.press('Escape');
await page.getByRole('button', { name: /Grocery list/ }).click();
await page.waitForSelector('.total-card');
await shot('13-list');
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await shot('14-list-bottom');
await page.goBack();
await page.waitForSelector('.meal-card');
await page.locator('.meal-card a').first().click();
await page.waitForSelector('.recipe-sheet, .recipe-wide');
await page.waitForTimeout(1000);
await shot('15-recipe');
await page.evaluate(() => window.scrollTo(0, 560));
await shot('16-recipe-ingredients');
if (!wide) {
  await page.getByRole('button', { name: 'Preparation' }).click();
  await shot('17-recipe-prep');
}
await page.getByRole('button', { name: /Start cooking/ }).click();
await shot('18-cook');
await page.goBack();
await page.goto(BASE + '#/plans');
await shot('19-plans');
await page.goto(BASE + '#/discover');
await page.waitForTimeout(1500);
await shot('20-discover');
await page.goto(BASE + '#/favorites');
await shot('21-favorites');
await page.goto(BASE + '#/profile');
await shot('22-profile');
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no page errors');
await browser.close();
