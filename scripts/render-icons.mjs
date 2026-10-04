// Renders public/icon.svg to the PNG sizes the PWA manifest and iOS need.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const svg = readFileSync('public/icon.svg', 'utf8');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
for (const [size, file, bleed] of [
  [192, 'icon-192.png', false],
  [512, 'icon-512.png', false],
  [180, 'apple-touch-icon.png', true],
]) {
  await page.setViewportSize({ width: size, height: size });
  // iOS rounds corners itself, so the touch icon is full-bleed.
  const body = bleed ? svg.replace('rx="112"', 'rx="0"') : svg;
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${body.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`,
  );
  await page.screenshot({ path: `public/${file}`, omitBackground: true });
}
await browser.close();
