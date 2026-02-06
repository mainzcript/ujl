/**
 * @ujl-framework/adapter-web - Main entry point
 *
 * This module ensures the Custom Element is registered by importing UJLContent,
 * and exports the webAdapter function and all types.
 */

// Import UJLContent to ensure it's bundled and the Custom Element is registered
import "./components/UJLContent.svelte";

// Export types
export * from "./types.js";

// Export webAdapter function
export { webAdapter } from "./adapter.js";
