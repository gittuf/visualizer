import { test as setup } from '@playwright/test';

/**
 * Global setup for E2E tests
 * Runs once before all test suites
 */
setup('global setup', async ({}) => {
  // Perform any global setup here
  // For example, start a test database, seed data, etc.
  console.log('Running global setup...');

  // Example: Ensure test environment is ready
  // This could include API mocking setup, database initialization, etc.

  console.log('Global setup completed.');
});
