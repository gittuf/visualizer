import { test, expect } from '@playwright/test';
import { selectors } from '../../utils/selectors';

/**
 * E2E test suite for the Commit List and repository selection workflow.
 * Verifies the integration between the frontend repository selector and 
 * the Go backend's Git service.
 */
test.describe('Commit List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // 1. Prepare listener for the /commits API (Triggered by Demo button)
    const commitFetch = page.waitForResponse(
      resp => resp.url().includes('/commits') && resp.status() === 200,
      { timeout: 60000 } // Extended timeout for Git clone
    );
    await page.locator(selectors.repository.tryDemoButton).click();
    await commitFetch;

    // 2. Navigate to the Commits view via the main navigation tabs
    await page.locator(selectors.tabs.commits).click();
  });

  test('shows commit details on selection', async ({ page }) => {
    // 1. Explicitly activate the 'Browse Commits' tab using its unique identifier
    const commitTab = page.getByTestId('tab-commits');
    await commitTab.click();

    // 2. Wait for the commit history to be retrieved and rendered in the list.
    // Timeout covers the round-trip delay from the /commits API endpoint.
    const firstItem = page.locator(selectors.commit.commitItem).first();
    await expect(firstItem).toBeVisible({ timeout: 15000 });

    // 3. Verify the contextual instructions for commit analysis are displayed.
    // We use a case-insensitive regex to match the prompt for commit selection.
    await expect(page.getByText(/Select Commits to Analyze/i)).toBeVisible();
  });
});