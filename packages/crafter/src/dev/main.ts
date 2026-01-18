/**
 * Development entry point for UJL Crafter
 *
 * Mounts the DevApp which initializes a Crafter instance for local development.
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
