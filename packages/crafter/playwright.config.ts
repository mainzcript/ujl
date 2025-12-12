import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	// Test-Verzeichnis
	testDir: './e2e',

	// Timeout für einzelne Tests
	timeout: 30000,

	// Parallele Ausführung
	fullyParallel: true,

	// Fehlgeschlagene Tests wiederholen
	retries: process.env.CI ? 2 : 0,

	// Anzahl der Worker
	workers: process.env.CI ? 1 : 2,

	// Reporter - in CI nur list, lokal mit html
	reporter: process.env.CI
		? [['list'], ['junit', { outputFile: 'test-results/junit.xml' }]]
		: [['html'], ['list']],

	use: {
		// Base URL für alle Tests
		baseURL: 'http://localhost:5173',

		// Trace bei Fehlern
		trace: 'on-first-retry',

		// Screenshot bei Fehlern
		screenshot: 'only-on-failure',

		// Video bei Fehlern
		video: 'retain-on-failure',

		storageState: undefined
	},

	// Webserver-Konfiguration
	webServer: {
		// Verwende dev-Server statt build+preview für schnelleres Feedback
		command: 'pnpm run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI,
		timeout: 120000, // 2 Minuten für ersten Start
		stdout: 'pipe',
		stderr: 'pipe',
		env: {
			PUBLIC_TEST_MODE: 'true'
		}
	},

	// Browser-Konfiguration
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
		// Weitere Browser können später aktiviert werden
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
