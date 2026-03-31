import { test, expect } from '@playwright/test';
import { selectors } from '../../utils/selectors';

/**
 * E2E test suite for the Simulator Page (/simulator)
 * Tests core functionality including page load, story modal state,
 * glossary presence, and status card behavior.
 */
test.describe('Simulator Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulator');
  });

  test.describe('Page Load & Initial Render', () => {
    test('loads without JavaScript runtime errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      expect(errors).toHaveLength(0);
    });

    test('renders the main application container', async ({ page }) => {
      await expect(page.locator(selectors.homepage.container)).toBeVisible();
    });
  });

  test.describe('Story Modal', () => {
    test('remains hidden on initial page load', async ({ page }) => {
      // The story modal is only triggered via user interaction, not auto-displayed
      await expect(page.locator(selectors.homepage.storyModal)).toBeHidden();
    });

    test('modal controls are not present when modal is closed', async ({ page }) => {
      await expect(page.locator(selectors.homepage.storyModalCloseButton)).toBeHidden();
      await expect(page.locator(selectors.homepage.storyModalOpenSimulatorButton)).toBeHidden();
    });
  });

  test.describe('Simulator Glossary', () => {
    test('displays glossary section in footer', async ({ page }) => {
      await expect(page.locator(selectors.homepage.simulatorGlossary)).toBeVisible();
    });

    test('renders all four glossary terms', async ({ page }) => {
      await expect(page.locator(selectors.homepage.glossaryItemRoot)).toBeVisible();
      await expect(page.locator(selectors.homepage.glossaryItemRole)).toBeVisible();
      await expect(page.locator(selectors.homepage.glossaryItemAttestation)).toBeVisible();
      await expect(page.locator(selectors.homepage.glossaryItemThreshold)).toBeVisible();
    });

    test('displays correct terminology in glossary', async ({ page }) => {
      const rootTerm = page.locator(selectors.homepage.glossaryItemRoot);
      await expect(rootTerm).toContainText('Root');
      
      const roleTerm = page.locator(selectors.homepage.glossaryItemRole);
      await expect(roleTerm).toContainText('Role');
      
      const attestationTerm = page.locator(selectors.homepage.glossaryItemAttestation);
      await expect(attestationTerm).toContainText('Attestation');
      
      const thresholdTerm = page.locator(selectors.homepage.glossaryItemThreshold);
      await expect(thresholdTerm).toContainText('Threshold');
    });
  });

  test.describe('Status Card', () => {
    test.beforeEach(async ({ page }) => {
      // Activate simulator view via keyboard shortcut (R) before each status card test
      await page.keyboard.press('R');
      await expect(page.locator(selectors.homepage.statusCard)).toBeVisible({ timeout: 10000 });
    });

    test('displays result indicator (allowed or blocked)', async ({ page }) => {
      const result = page.locator(selectors.homepage.statusCardResult);
      await expect(result).toBeVisible();
      
      const resultText = await result.textContent();
      expect(['allowed', 'blocked']).toContain(resultText?.trim().toLowerCase());
    });
  });
});