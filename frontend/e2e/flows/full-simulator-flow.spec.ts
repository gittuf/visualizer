import { test, expect } from '@playwright/test';
import { selectors } from '../utils/selectors';

/**
 * E2E test suite for Full Simulator Flow
 * Tests end-to-end user journey through the simulator
 */
test.describe('Full Simulator Flow', () => {
  test('complete simulator workflow from start to finish', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    await expect(page.locator(selectors.homepage.container)).toBeVisible();

    // Open simulator by going to /simulator (story modal might be auto-triggered)
    await page.goto('/simulator');
    await expect(page.locator(selectors.homepage.simulatorContent)).toBeVisible();

    // Click Run Simulation button
    const runButton = page.locator(selectors.simulator.simulatorPlay);
    await runButton.click();

    // Wait for simulation to complete (button shows "Analyzing..." then back to "Run Simulation")
    await page.waitForTimeout(1500); // Wait for the 1 second processing

    // Check status card appears with result
    await expect(page.locator(selectors.homepage.statusCard)).toBeVisible();
    // Check that result is either allowed or blocked
    const resultText = await page.locator(selectors.homepage.statusCardResult).textContent();
    expect(['allowed', 'blocked']).toContain(resultText?.toLowerCase());
  });

  test('handles error scenarios gracefully', async ({ page }) => {
    await page.goto('/simulator');
    // For now, no specific error scenario, just ensure no errors on load
    await expect(page.locator(selectors.simulator.errorMessage)).toBeHidden();
  });
});
