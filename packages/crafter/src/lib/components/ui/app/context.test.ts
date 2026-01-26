import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import TestWrapper from './test-wrapper.svelte';
import type { useApp } from './context.svelte.js';
import { BREAKPOINT_PANEL_DESKTOP, BREAKPOINT_SIDEBAR_DESKTOP } from './constants.js';

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

// Helper to set container width for desktop mode
function setDesktopWidth(app: ReturnType<typeof useApp>, breakpoint: number) {
	app.setContainerWidth(breakpoint);
}

// Helper to set container width for mobile mode
function setMobileWidth(app: ReturnType<typeof useApp>, breakpoint: number) {
	app.setContainerWidth(breakpoint - 1);
}

describe('AppState', () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	describe('state initialization', () => {
		it('should derive sidebarDesktopOpen from props', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: true });
			expect(app.sidebarDesktopOpen).toBe(true);
			expect(getSidebarOpen()).toBe(true);
		});

		it('should derive panelDesktopOpen from props', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });
			expect(app.panelDesktopOpen).toBe(false);
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
		it('should open sidebar and close sheet when desktop mode', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: false });
			setDesktopWidth(app, BREAKPOINT_SIDEBAR_DESKTOP);
			app.sidebarSheetOpen = true;
			app.requireSidebar();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getSidebarOpen()).toBe(true);
			expect(app.sidebarSheetOpen).toBe(false);
		});

		it('should open sheet when mobile mode', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: false });
			setMobileWidth(app, BREAKPOINT_SIDEBAR_DESKTOP);
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
		it('should hide sidebar when sidebarDesktopOpen is true', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: true });
			setDesktopWidth(app, BREAKPOINT_SIDEBAR_DESKTOP);

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
			setDesktopWidth(app, BREAKPOINT_SIDEBAR_DESKTOP);
			app.sidebarSheetOpen = false;
			app.toggleSidebar();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getSidebarOpen()).toBe(true);
		});
	});

	describe('preferPanel', () => {
		it('should open panel when desktop mode', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });
			setDesktopWidth(app, BREAKPOINT_PANEL_DESKTOP);
			app.panelDrawerOpen = true;
			app.preferPanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getPanelOpen()).toBe(true);
			expect(app.panelDrawerOpen).toBe(false);
		});

		it('should not open panel when mobile mode', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });
			setMobileWidth(app, BREAKPOINT_PANEL_DESKTOP);
			app.preferPanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getPanelOpen()).toBe(false);
		});
	});

	describe('requirePanel', () => {
		it('should open panel and close drawer when desktop mode', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });
			setDesktopWidth(app, BREAKPOINT_PANEL_DESKTOP);
			app.panelDrawerOpen = true;
			app.requirePanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getPanelOpen()).toBe(true);
			expect(app.panelDrawerOpen).toBe(false);
		});

		it('should open drawer when mobile mode', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });
			setMobileWidth(app, BREAKPOINT_PANEL_DESKTOP);
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
		it('should hide panel when panelDesktopOpen is true', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: true });
			setDesktopWidth(app, BREAKPOINT_PANEL_DESKTOP);

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
			setDesktopWidth(app, BREAKPOINT_PANEL_DESKTOP);
			app.panelDrawerOpen = false;
			app.togglePanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getPanelOpen()).toBe(true);
		});
	});

	describe('container width setter', () => {
		it('should set container width and use it for sidebar visibility check', async () => {
			const { app, getSidebarOpen } = await renderApp({ initialSidebarOpen: false });
			setDesktopWidth(app, BREAKPOINT_SIDEBAR_DESKTOP);
			app.requireSidebar();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getSidebarOpen()).toBe(true);
		});

		it('should set container width and use it for panel visibility check', async () => {
			const { app, getPanelOpen } = await renderApp({ initialPanelOpen: false });
			setDesktopWidth(app, BREAKPOINT_PANEL_DESKTOP);
			app.requirePanel();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(getPanelOpen()).toBe(true);
		});

		it('should handle mobile width gracefully', async () => {
			const { app } = await renderApp({ initialSidebarOpen: false, initialPanelOpen: false });

			setMobileWidth(app, BREAKPOINT_SIDEBAR_DESKTOP);
			setMobileWidth(app, BREAKPOINT_PANEL_DESKTOP);

			app.requireSidebar();
			app.requirePanel();

			expect(app.sidebarSheetOpen).toBe(true);
			expect(app.panelDrawerOpen).toBe(true);
		});
	});

	describe('breakpoint detection', () => {
		it('should detect desktop sidebar mode when width >= breakpoint', async () => {
			const { app } = await renderApp({});
			app.setContainerWidth(BREAKPOINT_SIDEBAR_DESKTOP);
			expect(app.isDesktopSidebar).toBe(true);

			app.setContainerWidth(BREAKPOINT_SIDEBAR_DESKTOP - 1);
			expect(app.isDesktopSidebar).toBe(false);
		});

		it('should detect desktop panel mode when width >= breakpoint', async () => {
			const { app } = await renderApp({});
			app.setContainerWidth(BREAKPOINT_PANEL_DESKTOP);
			expect(app.isDesktopPanel).toBe(true);

			app.setContainerWidth(BREAKPOINT_PANEL_DESKTOP - 1);
			expect(app.isDesktopPanel).toBe(false);
		});
	});

	describe('isSidebarVisible', () => {
		it('should return true when desktop sidebar is open and visible', async () => {
			const { app, getIsSidebarVisible } = await renderApp({ initialSidebarOpen: true });
			setDesktopWidth(app, BREAKPOINT_SIDEBAR_DESKTOP);

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
			setDesktopWidth(app, BREAKPOINT_PANEL_DESKTOP);

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

			expect(app.panelDesktopOpen).toBe(false);
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

			expect(app.sidebarDesktopOpen).toBe(false);
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
