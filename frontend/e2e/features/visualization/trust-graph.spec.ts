import { test, expect } from '@playwright/test';
import { selectors } from '../../utils/selectors';

/**
 * E2E test suite for the Trust Graph Visualization.
 * Verifies the end-to-end flow of fetching gittuf policy metadata from the 
 * Go backend and rendering the delegation graph using the visualization engine.
 */
test.describe('Trust Graph', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Navigate to the application root
    await page.goto('/');

    // 2. Initialize the Demo Repository.
    // We wait for the 'commits' API to resolve, signifying the backend has 
    // successfully cloned the repo and parsed the gittuf policy refs.
    const commitResponse = page.waitForResponse(resp => 
      resp.url().includes('/commits') && resp.status() === 200,
      { timeout: 60000 } // Extended timeout for Git clone
    );
    await page.locator(selectors.repository.tryDemoButton).click();
    await commitResponse;

    // 3. Navigate to the Visualization tab.
    // We ensure the tab is actionable before clicking to prevent race conditions 
    // during the initial metadata hydration.
    const visTab = page.getByTestId('tab-visualization');
    await expect(visTab).toBeVisible({ timeout: 15000 });
    await expect(visTab).toBeEnabled({ timeout: 15000 });
    await visTab.click();
  });

  test('displays trust graph visualization', async ({ page }) => {
    // Verify that the Trust Graph container is rendered.
    const trustGraph = page.locator(selectors.visualization.trustGraph);
    await expect(trustGraph).toBeVisible({ timeout: 20000 });
  });

  test('shows graph content', async ({ page }) => {
    // Check that the graph is not only visible but contains actual rendered elements.
    // This targets canvas or SVG elements typically used by visualization libraries.
    const graphContainer = page.locator(selectors.visualization.trustGraph);
    await expect(graphContainer).toBeVisible();

    // Verify the graph has internal graphical content (Canvas/SVG/Div-nodes)
    const graphContent = graphContainer.locator('canvas, svg, .react-flow__node'); 
    await expect(graphContent.first()).toBeVisible({ timeout: 15000 });
  });
});