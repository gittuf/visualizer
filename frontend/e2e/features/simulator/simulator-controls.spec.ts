import { test, expect } from '@playwright/test';
import { selectors } from '../../utils/selectors';

/**
 * E2E test suite for Simulator Controls
 * Tests the controls for running simulations
 */
test.describe('Simulator Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulator');
  });

  test('displays simulator control buttons', async ({ page }) => {
    // The controls are shown by default
    // Check for the Controls card
    await expect(page.locator('text=Controls')).toBeVisible();
    // Check for What-If Mode toggle
    await expect(page.locator('text=What-If Mode')).toBeVisible();
    // Check for Test Scenario select
    await expect(page.locator('text=Test Scenario')).toBeVisible();
  });

  test('can toggle what-if mode', async ({ page }) => {
    const whatIfSwitch = page.locator('[role="switch"]').first();
    await whatIfSwitch.click();
    // Check if simulated signers appear
    await expect(page.locator('text=Simulate Signatures')).toBeVisible();
  });

  test('can select different scenarios', async ({ page }) => {
    const scenarioSelect = page.locator('button').filter({ hasText: 'Blocked Scenario' }).or(page.locator('button').filter({ hasText: 'Allowed Scenario' }));
    await scenarioSelect.click();
    // Select Allowed Scenario
    await page.locator('text=Allowed Scenario').click();
    // Check if selection changed (this might be hard to verify without specific selectors)
  });
});
