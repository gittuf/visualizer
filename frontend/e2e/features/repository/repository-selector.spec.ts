import { test, expect } from '@playwright/test';
import { selectors } from '../../utils/selectors';

test.describe('Repository Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays repository selector', async ({ page }) => {
    await expect(page.locator(selectors.repository.repositorySelector)).toBeVisible({ timeout: 15000 });
  });

  test('allows selecting demo repository', async ({ page }) => {
    // 1. Stub the demo repo commit fetch so this test is stable without needing a live Git clone.
    await page.route('**/commits', async (route, request) => {
      if (request.method() !== 'POST') {
        return route.continue()
      }

      const demoCommits = [
        {
          hash: '34360d79',
          message: "Add rule 'protect-releases' to policy 'targets'",
          author: 'Aditya Sirish',
          date: '2025-04-23',
        },
        {
          hash: '5485d247',
          message: "Add rule 'protect-main' to policy 'targets'",
          author: 'Aditya Sirish',
          date: '2025-04-23',
        },
      ]

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(demoCommits),
      })
    })

    // 2. Setup response listener for the Go backend's git operations
    const commitFetch = page.waitForResponse(
      resp => resp.url().includes('/commits') && resp.status() === 200,
      { timeout: 60000 }
    );

    // 3. Trigger the demo repo selection
    await page.locator(selectors.repository.tryDemoButton).click();

    // 4. Wait for the API to resolve
    await commitFetch;

    // 5. Verify the demo commit list is rendered from the mocked commit response
    const firstCommitItem = page.locator(selectors.commit.commitItem).first();
    await expect(firstCommitItem).toBeVisible({ timeout: 20000 });
  });
});