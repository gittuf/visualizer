import { test, expect } from '@playwright/test';
import { selectors } from '../../utils/selectors';

test.describe('Commit List', () => {
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  
  // 1. Click the demo button
  const demoBtn = page.getByTestId('try-demo-button');
  await demoBtn.click();

  // 2. Wait for the "Connected" state to appear inside the selector
  // This confirms the handleTryDemo function has executed successfully
  await expect(page.getByTestId('selected-repository')).toBeVisible({ timeout: 30000 });
  
  // 3. Since the selector stays on screen, we need to make sure 
  // we are clicking the 'Commits' tab in the MAIN navigation, 
  // not the 'Remote/Local' tabs in the selector.
  // Use a more specific locator for the main dashboard tabs if possible.
  await page.locator(selectors.tabs.commits).click();
});

test('shows commit details on selection', async ({ page }) => {
  // 1. Force the 'Browse Commits' tab to be active
  // Use the data-testid we added earlier to be 100% sure
  const commitTab = page.getByTestId('tab-commits');
  await commitTab.click();

  // 2. Now wait for the items in the list to appear
  const firstItem = page.locator(selectors.commit.commitItem).first();
  await expect(firstItem).toBeVisible({ timeout: 15000 });
   

  // 4. Verify 'Commit Analysis' is visible
  // Note: Check if "Commit Analysis" is actually the text on screen.
  // In your screenshot, it says "Step 2: Select Commits to Analyze"
  await expect(page.getByText(/Select Commits to Analyze/i)).toBeVisible();
});
});