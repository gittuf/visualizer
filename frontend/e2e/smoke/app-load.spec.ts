import { test, expect } from '@playwright/test';

/**
 * Smoke test suite for basic app loading
 * Quick checks to ensure the app starts without critical failures
 */
test.describe('App Load Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/gittuf/i); // Adjust title as needed
    await expect(page.locator('body')).toBeVisible();
  });

  test('simulator page loads successfully', async ({ page }) => {
    await page.goto('/simulator');
    await expect(page.locator('body')).toBeVisible();
  });

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('basic navigation works', async ({ page }) => {
    await page.goto('/');
    // Assuming there's navigation to simulator
    await page.goto('/simulator');
    await expect(page.url()).toContain('/simulator');
  });
});
