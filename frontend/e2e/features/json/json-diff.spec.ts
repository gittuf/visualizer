import { test, expect } from '@playwright/test';
import { selectors } from '../../utils/selectors';

/**
 * E2E test suite for the JSON Tree View feature.
 * Verifies that security metadata is correctly decoded by the Go backend 
 * and rendered as an interactive tree structure in the frontend.
 */
test.describe('JSON Tree View', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // 1. Prepare listener for the /commits API (Triggered by Demo button)
    const commitFetch = page.waitForResponse(
      resp => resp.url().includes('/commits') && resp.status() === 200,
      { timeout: 60000 } // Extended timeout for Git clone
    );
    await page.locator(selectors.repository.tryDemoButton).click();
    await commitFetch;

    // 2. Prepare listener for /metadata API (Triggered by selecting a commit)
    const metadataFetch = page.waitForResponse(
      resp => resp.url().includes('/metadata') && resp.status() === 200,
      { timeout: 30000 }
    );
    await page.locator(selectors.commit.commitItem).first().click();
    await metadataFetch;

    // 3. Navigate to Tree tab
    await page.locator(selectors.tabs.tree).click();
  });

  test('displays and populates JSON tree viewer', async ({ page }) => {
    const treeContainer = page.locator(selectors.json.jsonTreeView);
    
    // Ensure container is rendered
    await expect(treeContainer).toBeVisible({ timeout: 15000 });
    
    // Verify specific gittuf metadata fields are present (e.g., 'root')
    await expect(treeContainer).toContainText('root');
  });
});