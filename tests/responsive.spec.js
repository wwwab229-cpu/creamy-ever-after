import { test, expect } from '@playwright/test';

const url = 'https://creamy-ever-after.vercel.app/';
const viewports = [
  { width: 320, height: 720 }, { width: 360, height: 800 },
  { width: 390, height: 844 }, { width: 430, height: 932 },
  { width: 768, height: 1024 }, { width: 1024, height: 768 },
  { width: 1440, height: 900 }
];

test('site loads and key content is present', async ({ page }) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('footer')).toBeAttached();
  await expect(page.locator('main')).toBeAttached();
});

for (const viewport of viewports) {
  test(`no horizontal overflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const metrics = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    }));
    expect(metrics.scrollWidth, `overflow: viewport=${metrics.width}, document=${metrics.scrollWidth}`).toBeLessThanOrEqual(metrics.width + 1);
  });
}

test('mobile navigation opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const button = page.locator('#menu-button');
  const nav = page.locator('#mobile-nav');
  await expect(button).toBeVisible();
  const initiallyVisible = await nav.isVisible();
  await button.click();
  await expect(nav).toBeVisible({ timeout: 5000 });
  if (!initiallyVisible) await expect(button).toHaveAttribute('aria-expanded', 'true');
  await button.click();
  await expect(nav).toBeHidden({ timeout: 5000 });
});

test('footer fits within viewport width on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const bounds = await page.locator('footer').evaluate(el => {
    const r = el.getBoundingClientRect();
    return { left: r.left, right: r.right, width: r.width };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(-1);
  expect(bounds.right).toBeLessThanOrEqual(361);
});
