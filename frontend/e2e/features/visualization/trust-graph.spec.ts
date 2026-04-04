import { test, expect } from '@playwright/test';
import { selectors } from '../../utils/selectors';

test.describe('Trust Graph', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // 1. Initialize Repo
    const commitResponse = page.waitForResponse(resp => 
      resp.url().includes('/commits') && resp.status() === 200,
      { timeout: 60000 }
    );
    await page.locator(selectors.repository.tryDemoButton).click();
    await commitResponse;

    // 2. Select a commit to populate the graph
    // Targeted selector based on your UI screenshot
    const commitRow = page.locator('.commit-item, [data-testid^="commit-"]').first();
    await commitRow.click();

    // 3. Navigate to Graph View
    const graphTab = page.locator(selectors.tabs.visualization);
    await expect(graphTab).toBeVisible({ timeout: 20000 });
    await expect(graphTab).toBeEnabled({ timeout: 20000 });
    await graphTab.click();
  });

  test('renders React Flow nodes and edges', async ({ page }) => {
    // 1. Verify the React Flow viewport is active
    const flowContainer = page.locator('.react-flow');
    await expect(flowContainer).toBeVisible({ timeout: 30000 });

    // 2. Target the "Root" node seen in your inspector/screenshot
    const rootNode = page.locator('.react-flow__node').filter({ hasText: 'Root' });
    await expect(rootNode).toBeVisible({ timeout: 15000 });

    // 3. Verify the description under the Root node
    await expect(rootNode).toContainText('Object with 6 properties');

    // 4. Verify edges (lines) are drawn
    const edges = page.locator('.react-flow__edge');
    await expect(edges.first()).toBeVisible();
  });

  test('can expand/collapse graph nodes', async ({ page }) => {
    const rootNode = page.locator('.react-flow__node').filter({ hasText: 'Root' });
    
    // Click the Root node to test interactivity (as seen in your Inspector tree)
    await rootNode.click();

    // Verify child nodes like 'expires' or 'principals' exist after layout
    const expiresNode = page.getByText('expires', { exact: true });
    await expect(expiresNode).toBeVisible();
  });
});