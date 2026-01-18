/**
 * Development entry point for UJL Crafter
 *
 * This file sets up the development environment for testing the Crafter.
 * It supports both single and dual instance modes via URL hash.
 *
 * Usage:
 * - Single instance: http://localhost:5173/
 * - Dual instance:   http://localhost:5173/#dual
 */

import './app.css';
import { mount, unmount } from 'svelte';
import DevApp from './DevApp.svelte';

// Mount the dev app
const app = mount(DevApp, {
	target: document.getElementById('app')!
});

// Cleanup on HMR
if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		unmount(app);
	});
}
