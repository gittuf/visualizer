import { test, expect } from '@playwright/test';
import { selectors } from '../../utils/selectors';

/**
 * E2E test suite for Trust Graph Visualization
 * Tests the display and interaction with trust graphs
 */
test.describe('Trust Graph', () => {
  test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.locator(selectors.repository.tryDemoButton).click();

  // Wait for the 'Browse Commits' tab to be enabled/visible first
  const browseTab = page.getByTestId('tab-commits');
  await expect(browseTab).toBeVisible({ timeout: 30000 });
  await browseTab.click();

  // Select the first commit 
    await expect(browseTab).toBeVisible({ timeout: 10000 });


  // Switch to Visualization tab
  const visTab = page.getByTestId('tab-visualization');
  await expect(visTab).not.toBeDisabled();
  await visTab.click();
});
  test('displays trust graph visualization', async ({ page }) => {
    // Check that the trust graph is visible
    await expect(page.locator(selectors.visualization.trustGraph)).toBeVisible();
  });

  test('shows graph content', async ({ page }) => {
    // Check that the graph contains some visual elements
    const graph = page.locator(selectors.visualization.trustGraph);
    await expect(graph).toBeVisible();
    // Verify graph has content (not empty)
    await expect(graph.locator('canvas, svg, div')).toBeVisible();
  });
});
