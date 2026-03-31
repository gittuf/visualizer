import { test, expect } from '@playwright/test';
import { selectors } from '../../utils/selectors';

/**
 * E2E test suite for JSON Tree View feature
 * Tests the display and interaction of JSON tree view
 */
test.describe('JSON Tree View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // First select the demo repository
    await page.locator(selectors.repository.tryDemoButton).click();
    // Wait for commits to load and select first commit
    await page.waitForTimeout(10000);
    await page.locator(selectors.commit.commitItem).first().click();
    // Click on the tree tab to navigate to JSON view
    await page.waitForTimeout(10000);

    await page.locator(selectors.tabs.tree).click();
  });

  test('displays JSON tree viewer', async ({ page }) => {
    // Check that the JSON tree view is visible
    await expect(page.locator(selectors.json.jsonTreeView)).toBeVisible();
  });

  test('shows JSON data structure', async ({ page }) => {
    // Check that the tree container is visible and contains data
    const treeContainer = page.locator(selectors.json.jsonTreeView);
    await expect(treeContainer).toBeVisible();
    // Verify that it contains some text content (JSON structure)
    await expect(treeContainer).toContainText('root');
  });
});
