import { test, expect } from '@playwright/test';
import { selectors } from '../../utils/selectors';

/**
 * E2E test suite for Repository Selector feature
 * Tests repository selection and switching functionality
 */
test.describe('Repository Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays repository selector', async ({ page }) => {
    // Check that the repository selector is visible on homepage
    await expect(page.locator(selectors.repository.repositorySelector)).toBeVisible();
  });

  test('allows selecting demo repository', async ({ page }) => {
    // Click the try demo button
    await page.locator(selectors.repository.tryDemoButton).click();
    // Check if demo repository is selected
    await expect(page.locator(selectors.repository.selectedRepository)).toBeVisible();
  });
});
