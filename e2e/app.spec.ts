import { expect, test, type Page } from '@playwright/test';

// Photos come from a third-party host; keep tests hermetic.
test.beforeEach(async ({ page }) => {
  await page.route(/themealdb\.com/, (r) => r.abort());
});

/** Press and hold a meal card — Whipp's way to swap. */
async function longPress(page: Page, index = 0) {
  const box = (await page.locator('.meal-card').nth(index).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(700);
  await page.mouse.up();
}

/** Wait until the app's async IndexedDB save contains `text`, so a reload can't race it. */
async function saved(page: Page, text: string) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise<string>((resolve) => {
            const open = indexedDB.open('keyval-store');
            open.onsuccess = () => {
              const req = open.result.transaction('keyval').objectStore('keyval').get('whipp-clone');
              req.onsuccess = () => resolve(String(req.result ?? ''));
              req.onerror = () => resolve('');
            };
            open.onerror = () => resolve('');
          }),
      ),
    )
    .toContain(text);
}

async function onboard(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Get started/ }).click();
  await page.getByRole('button', { name: 'Kroger' }).click();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /^Continue/ }).click();
  await page.getByRole('button', { name: /High protein/ }).click();
  await page.getByRole('button', { name: /^Continue/ }).click();
  await page.getByRole('button', { name: 'Microwave', exact: true }).last().click();
  await page.getByRole('button', { name: /^Continue/ }).click();
  await page.getByRole('button', { name: /^Continue/ }).click(); // cooking days
  await page.getByRole('button', { name: /Mushroom/ }).click(); // things to avoid
  await page.getByRole('button', { name: /^Continue/ }).click();
  await expect(page.locator('.plan-head')).toBeVisible({ timeout: 10_000 });
}

test('onboarding plans a full week that survives a reload', async ({ page }) => {
  await onboard(page);
  await expect(page.locator('.meal-card')).toHaveCount(7);
  await expect(page.locator('.plan-head')).toContainText('Kroger');
  const titles = await page.locator('.meal-card h3').allTextContents();
  await page.reload();
  await expect(page.locator('.meal-card h3')).toHaveText(titles);
});

test('swap, redo and skip update the week', async ({ page }) => {
  await onboard(page);
  const first = await page.locator('.meal-card h3').first().textContent();
  await longPress(page, 0);
  const option = page.getByRole('dialog').locator('.meal-card').first();
  const picked = await option.locator('h3').textContent();
  await option.click();
  await expect(page.locator('.meal-card h3').first()).toHaveText(picked!);
  expect(picked).not.toBe(first);

  await longPress(page, 0);
  await page.getByRole('button', { name: /Skip this night/ }).click();
  await expect(page.locator('.meal-card')).toHaveCount(6);
  await expect(page.getByRole('button', { name: /Add a dinner/ })).toBeVisible();

  const before = await page.locator('.meal-card h3').allTextContents();
  await page.getByRole('button', { name: /Redo/ }).click();
  await expect.poll(async () => (await page.locator('.meal-card h3').allTextContents()).join()).not.toBe(before.join());
});

test('grocery list ticks persist and custom items can be added', async ({ page }) => {
  await onboard(page);
  await page.getByRole('button', { name: /Grocery list/ }).click();
  await expect(page.getByText('Estimated total')).toBeVisible();
  const firstCheck = page.locator('.item-row:not(.pantry) .check').first();
  await firstCheck.click();
  await expect(page.getByText(/^1 of \d+ in the cart$/)).toBeVisible();
  await page.getByPlaceholder(/Paper towels|Kitchen roll/).fill('Paper towels');
  await page.getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByText('Paper towels', { exact: true })).toBeVisible();
  await saved(page, 'Paper towels');
  await page.reload();
  await expect(page.getByText(/^1 of \d+ in the cart$/)).toBeVisible();
  await expect(page.getByText('Paper towels', { exact: true })).toBeVisible();
});

test('recipe: favorite, scale and cook mode', async ({ page }) => {
  await onboard(page);
  await page.locator('.meal-card a').first().click();
  await page.getByRole('button', { name: 'Save to favorites' }).first().click();
  const pill = page.locator('.price-pill').first();
  const price = await pill.textContent();
  await page.getByRole('button', { name: 'More servings' }).click();
  await expect(pill).not.toHaveText(price!);
  await page.getByRole('button', { name: /Start cooking/ }).click();
  await expect(page.getByText(/Step 1 of/)).toBeVisible();
  await page.getByRole('button', { name: /Next step/ }).click();
  await expect(page.getByText(/Step 2 of/)).toBeVisible();
  await page.goto('/#/favorites');
  await expect(page.locator('.meal-card')).toHaveCount(1);
});

test('profile changes flow into the next plan and reset returns to welcome', async ({ page }) => {
  await onboard(page);
  await page.goto('/#/profile/edit/diet');
  await page.getByRole('button', { name: /Vegan/ }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await page.goto('/#/plan');
  await page.getByRole('button', { name: /Redo/ }).click();
  await page.locator('.meal-card a').first().click();
  await expect(page.locator('.tag', { hasText: 'Vegan' }).first()).toBeVisible();
  await page.goto('/#/profile');
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: /Reset all data/ }).click();
  await expect(page.getByRole('button', { name: /Get started/ })).toBeVisible();
});

test('lunch & dinner plans two meals a day', async ({ page }) => {
  await onboard(page);
  await page.goto('/#/profile/edit/meals');
  await page.getByRole('button', { name: /Lunch & dinner/ }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await page.goto('/#/plan');
  await page.getByRole('button', { name: /Redo/ }).click();
  await expect(page.locator('.meal-card')).toHaveCount(14);
  await expect(page.locator('.slot-label', { hasText: 'lunch' })).toHaveCount(7);
  await page.goto('/#/profile');
  await expect(page.getByText('Lunch & dinner')).toBeVisible();
});

test('discover filters, cuisines and favorites', async ({ page }) => {
  await onboard(page);
  await page.goto('/#/discover');
  await expect(page.getByText('Explore by cuisine')).toBeVisible();
  const all = await page.locator('.meal-card').count();
  await page.getByRole('button', { name: 'Veggie & vegan' }).click();
  const veg = await page.locator('.meal-card').count();
  expect(veg).toBeGreaterThan(10);
  expect(veg).toBeLessThan(all);
  await page.getByRole('button', { name: 'Veggie & vegan' }).click();
  await page.locator('.cuisine-card', { hasText: 'Italian' }).click();
  await expect(page.getByRole('button', { name: /Clear Italian/ })).toBeVisible();
  await page.goto('/#/favorites');
  await expect(page.getByText('No favorites yet')).toBeVisible();
});

test('Her Balance plans a week of qualifying meals and explains why', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Get started/ }).click();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /^Continue/ }).click();
  await page.getByRole('button', { name: /Her Balance/ }).click();
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: /^Continue/ }).click();
  await expect(page.locator('.plan-head')).toBeVisible({ timeout: 10_000 });
  const cards = page.locator('.meal-card');
  await expect(cards).toHaveCount(7);
  for (let i = 0; i < 7; i++) await expect(cards.nth(i).getByText('Her Balance')).toBeVisible();
  await cards.first().locator('a').click();
  await expect(page.getByText('Weight-loss friendly · supports hormones')).toBeVisible();
  await page.getByRole('link', { name: /How we choose these meals/ }).click();
  await expect(page.getByRole('heading', { name: 'Her Balance' })).toBeVisible();
  await expect(page.getByText('Not medical advice')).toBeVisible();
});
