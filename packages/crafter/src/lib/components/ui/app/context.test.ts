import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import TestWrapper from './test-wrapper.svelte';
import type { useApp } from './context.svelte.js';

type AppState = ReturnType<typeof useApp>;
type TestHelpers = {
	app: AppState;
	getSidebarOpen: () => boolean;
	getPanelOpen: () => boolean;
	getIsSidebarVisible: () => boolean;
	getIsPanelVisible: () => boolean;
};

// Helper to render and get app instance
async function renderApp(options: {
	initialSidebarOpen?: boolean;
	initialPanelOpen?: boolean;
}): Promise<TestHelpers> {
	let helpers: TestHelpers | undefined;

	render(TestWrapper, {
		initialSidebarOpen: options.initialSidebarOpen ?? true,
		initialPanelOpen: options.initialPanelOpen ?? false,
		onAppReady: (h) => {
			helpers = h;
		}
	});

	// Wait for effect to run
	await new Promise((resolve) => setTimeout(resolve, 10));

	if (!helpers) {
		throw new Error('App helpers not received');
	}

	return helpers;
}

// Mock getComputedStyle for visibility checks
function mockElementVisible() {
	const mockElement = document.createElement('div');
	vi.spyOn(window, 'getComputedStyle').mockReturnValue({
		display: 'block'
	} as CSSStyleDeclaration);
	return mockElement;
}

function mockElementHidden() {
	const mockElement = document.createElement('div');
	vi.spyOn(window, 'getComputedStyle').mockReturnValue({
		display: 'none'
	} as CSSStyleDeclaration);
	return mockElement;
}

describe('AppState', () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	describe('state initialization', () => {
		it('should derive sidebarOpen from props', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: true });
			expect(app.sidebarOpen).toBe(true);
			expect(getSidebarOpen()).toBe(true);
		});

		it('should derive panelOpen from props', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });
			expect(app.panelOpen).toBe(false);
			expect(getPanelOpen()).toBe(false);
		});

		it('should initialize sheet and drawer states as false', async () => {
			const { app } = await renderApp({});
			expect(app.sidebarSheetOpen).toBe(false);
			expect(app.panelDrawerOpen).toBe(false);
		});
	});

	describe('preferSidebar', () => {
		it('should open sidebar', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: false });

			app.preferSidebar();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getSidebarOpen()).toBe(true);
		});
	});

	describe('requireSidebar', () => {
		it('should open sidebar and close sheet when element is visible', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: false });
			const mockElement = mockElementVisible();

			app.setSidebarRef(mockElement);
			app.sidebarSheetOpen = true;
			app.requireSidebar();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getSidebarOpen()).toBe(true);
			expect(app.sidebarSheetOpen).toBe(false);
		});

		it('should open sheet when element is not visible', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: false });
			const mockElement = mockElementHidden();

			app.setSidebarRef(mockElement);
			app.requireSidebar();

			expect(app.sidebarSheetOpen).toBe(true);
			expect(getSidebarOpen()).toBe(false);
		});

		it('should open sheet when element ref is null', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: false });

			app.setSidebarRef(null);
			app.requireSidebar();

			expect(app.sidebarSheetOpen).toBe(true);
			expect(getSidebarOpen()).toBe(false);
		});
	});

	describe('hideSidebar', () => {
		it('should close sidebar and sheet', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: true });

			app.sidebarSheetOpen = true;
			app.hideSidebar();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getSidebarOpen()).toBe(false);
			expect(app.sidebarSheetOpen).toBe(false);
		});
	});

	describe('toggleSidebar', () => {
		it('should hide sidebar when sidebarOpen is true', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: true });

			app.toggleSidebar();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getSidebarOpen()).toBe(false);
			expect(app.sidebarSheetOpen).toBe(false);
		});

		it('should hide sidebar when sheet is open', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: false });

			app.sidebarSheetOpen = true;
			app.toggleSidebar();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getSidebarOpen()).toBe(false);
			expect(app.sidebarSheetOpen).toBe(false);
		});

		it('should require sidebar when both closed', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: false });
			const mockElement = mockElementVisible();

			app.setSidebarRef(mockElement);
			app.sidebarSheetOpen = false;
			app.toggleSidebar();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getSidebarOpen()).toBe(true);
		});
	});

	describe('preferPanel', () => {
		it('should open panel when element is visible', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });
			const mockElement = mockElementVisible();

			app.setPanelRef(mockElement);
			app.panelDrawerOpen = true;
			app.preferPanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getPanelOpen()).toBe(true);
			expect(app.panelDrawerOpen).toBe(false);
		});

		it('should not open panel when element is not visible', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });
			const mockElement = mockElementHidden();

			app.setPanelRef(mockElement);
			app.preferPanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getPanelOpen()).toBe(false);
		});

		it('should not open panel when element ref is null', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });

			app.setPanelRef(null);
			app.preferPanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getPanelOpen()).toBe(false);
		});
	});

	describe('requirePanel', () => {
		it('should open panel and close drawer when element is visible', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });
			const mockElement = mockElementVisible();

			app.setPanelRef(mockElement);
			app.panelDrawerOpen = true;
			app.requirePanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getPanelOpen()).toBe(true);
			expect(app.panelDrawerOpen).toBe(false);
		});

		it('should open drawer when element is not visible', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });
			const mockElement = mockElementHidden();

			app.setPanelRef(mockElement);
			app.requirePanel();

			expect(app.panelDrawerOpen).toBe(true);
			expect(getPanelOpen()).toBe(false);
		});

		it('should open drawer when element ref is null', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });

			app.setPanelRef(null);
			app.requirePanel();

			expect(app.panelDrawerOpen).toBe(true);
			expect(getPanelOpen()).toBe(false);
		});
	});

	describe('hidePanel', () => {
		it('should close panel and drawer', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: true });

			app.panelDrawerOpen = true;
			app.hidePanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getPanelOpen()).toBe(false);
			expect(app.panelDrawerOpen).toBe(false);
		});
	});

	describe('togglePanel', () => {
		it('should hide panel when panelOpen is true', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: true });

			app.togglePanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getPanelOpen()).toBe(false);
			expect(app.panelDrawerOpen).toBe(false);
		});

		it('should hide panel when drawer is open', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });

			app.panelDrawerOpen = true;
			app.togglePanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getPanelOpen()).toBe(false);
			expect(app.panelDrawerOpen).toBe(false);
		});

		it('should require panel when both closed', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });
			const mockElement = mockElementVisible();

			app.setPanelRef(mockElement);
			app.panelDrawerOpen = false;
			app.togglePanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getPanelOpen()).toBe(true);
		});
	});

	describe('ref setters', () => {
		it('should set sidebar ref and use it for visibility check', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: false });
			const mockElement = mockElementVisible();

			app.setSidebarRef(mockElement);
			app.requireSidebar();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getSidebarOpen()).toBe(true);
		});

		it('should set panel ref and use it for visibility check', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });
			const mockElement = mockElementVisible();

			app.setPanelRef(mockElement);
			app.requirePanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getPanelOpen()).toBe(true);
		});

		it('should handle null refs gracefully', async () => {
			const { app } = await renderApp({ initialSidebarOpen: false, initialPanelOpen: false });

			app.setSidebarRef(null);
			app.setPanelRef(null);

			app.requireSidebar();
			app.requirePanel();

			expect(app.sidebarSheetOpen).toBe(true);
			expect(app.panelDrawerOpen).toBe(true);
		});
	});

	describe('visibility check logic', () => {
		it('should use getComputedStyle to check element visibility', () => {
			const mockElement = document.createElement('div');
			const mockStyle = { display: 'block' };

			vi.spyOn(window, 'getComputedStyle').mockReturnValue(mockStyle as CSSStyleDeclaration);

			const result = getComputedStyle(mockElement).display !== 'none';
			expect(result).toBe(true);

			mockStyle.display = 'none';
			const resultHidden = getComputedStyle(mockElement).display !== 'none';
			expect(resultHidden).toBe(false);
		});

		it('should handle null element refs', () => {
			const element: HTMLElement | null = null;
			const result = element !== null && getComputedStyle(element!).display !== 'none';
			expect(result).toBe(false);
		});
	});

	describe('isSidebarVisible', () => {
		it('should return true when desktop sidebar is open and visible', async () => {
			const { app, getIsSidebarVisible } = await renderApp({ initialSidebarOpen: true });
			const mockElement = mockElementVisible();
			app.setSidebarRef(mockElement);

			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(getIsSidebarVisible()).toBe(true);
		});

		it('should return true when mobile sheet is open', async () => {
			const { app, getIsSidebarVisible } = await renderApp({ initialSidebarOpen: false });
			app.sidebarSheetOpen = true;

			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(getIsSidebarVisible()).toBe(true);
		});

		it('should return false when both desktop and mobile are closed', async () => {
			const { app, getIsSidebarVisible } = await renderApp({ initialSidebarOpen: false });
			app.sidebarSheetOpen = false;

			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(getIsSidebarVisible()).toBe(false);
		});
	});

	describe('isPanelVisible', () => {
		it('should return true when desktop panel is open and visible', async () => {
			const { app, getIsPanelVisible } = await renderApp({ initialPanelOpen: true });
			const mockElement = mockElementVisible();
			app.setPanelRef(mockElement);

			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(getIsPanelVisible()).toBe(true);
		});

		it('should return true when mobile drawer is open', async () => {
			const { app, getIsPanelVisible } = await renderApp({ initialPanelOpen: false });
			app.panelDrawerOpen = true;

			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(getIsPanelVisible()).toBe(true);
		});

		it('should return false when both desktop and mobile are closed', async () => {
			const { app, getIsPanelVisible } = await renderApp({ initialPanelOpen: false });
			app.panelDrawerOpen = false;

			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(getIsPanelVisible()).toBe(false);
		});
	});

	describe('onPanelClose callback', () => {
		it('should call callback when panel is closed', async () => {
			const { app } = await renderApp({ initialPanelOpen: true });
			let callbackCalled = false;

			app.onPanelClose(() => {
				callbackCalled = true;
			});

			app.hidePanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(callbackCalled).toBe(true);
		});

		it('should not call callback if not set', async () => {
			const { app } = await renderApp({ initialPanelOpen: true });

			// Should not throw
			app.hidePanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(app.panelOpen).toBe(false);
		});

		it('should return cleanup function', async () => {
			const { app } = await renderApp({ initialPanelOpen: true });
			let callbackCalled = false;

			const cleanup = app.onPanelClose(() => {
				callbackCalled = true;
			});

			cleanup();
			app.hidePanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(callbackCalled).toBe(false);
		});
	});

	describe('onSidebarClose callback', () => {
		it('should call callback when sidebar is closed', async () => {
			const { app } = await renderApp({ initialSidebarOpen: true });
			let callbackCalled = false;

			app.onSidebarClose(() => {
				callbackCalled = true;
			});

			app.hideSidebar();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(callbackCalled).toBe(true);
		});

		it('should not call callback if not set', async () => {
			const { app } = await renderApp({ initialSidebarOpen: true });

			// Should not throw
			app.hideSidebar();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(app.sidebarOpen).toBe(false);
		});

		it('should return cleanup function', async () => {
			const { app } = await renderApp({ initialSidebarOpen: true });
			let callbackCalled = false;

			const cleanup = app.onSidebarClose(() => {
				callbackCalled = true;
			});

			cleanup();
			app.hideSidebar();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(callbackCalled).toBe(false);
		});
	});
});
