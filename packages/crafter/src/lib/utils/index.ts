/**
 * Centralized utilities export for the Crafter package.
 * All utility functions are re-exported from this file for easy access.
 */

// Core utilities
export * from "./logger.js";
export * from "./platform.js";

// File and clipboard utilities
export * from "./clipboard.js";
export * from "./files.js";
export * from "./image-compression.js";

// UJLC tree manipulation utilities
export * from "./ujlc-tree.js";

// Scoped DOM utilities (for multi-instance support)
export * from "./scoped-dom.js";

// Color utilities
export * from "./colors/index.js";

// Note: The cn() function and type utilities are provided by @ujl-framework/ui
// to avoid duplication. Import them directly from '@ujl-framework/ui' when needed.
