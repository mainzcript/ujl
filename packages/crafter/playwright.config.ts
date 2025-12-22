import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	timeout: 30000,
	fullyParallel: true,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : 2,
	// Reporter - list only in CI, html locally
	reporter: process.env.CI
		? [['list'], ['junit', { outputFile: 'test-results/junit.xml' }]]
		: [['html'], ['list']],

	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		storageState: undefined
	},

	webServer: {
		// Use dev server instead of build+preview for faster feedback
		command: 'pnpm run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI,
		timeout: 120000, // 2 minutes for initial start
		stdout: 'pipe',
		stderr: 'pipe',
		env: {
			PUBLIC_TEST_MODE: 'true'
		}
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
		// Additional browsers can be enabled later
		// {
		// 	name: 'firefox',
		// 	use: { ...devices['Desktop Firefox'] },
		// },
		// {
		// 	name: 'webkit',
		// 	use: { ...devices['Desktop Safari'] },
		// },
	]
});
