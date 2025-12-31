/**
 * Platform detection is required because macOS uses ⌘ (Cmd) as the modifier key
 * while Windows/Linux use Ctrl. This ensures keyboard shortcuts display correctly
 * in the UI across all platforms.
 */

/**
 * Detects if the current platform is macOS
 * Uses navigator.userAgentData (modern) or navigator.userAgent (fallback)
 */
export function isMac(): boolean {
	if (typeof navigator === 'undefined') return false;

	// Modern API (Chrome 101+)
	if ('userAgentData' in navigator) {
		const uaData = navigator.userAgentData as { platform?: string };
		return uaData.platform?.toLowerCase() === 'macos';
	}

	// Fallback for older browsers
	return /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
}

/**
 * Gets the platform-specific modifier key symbol
 * Mac: ⌘ (Cmd), Windows/Linux: Ctrl
 */
export function getModifierKey(): string {
	return isMac() ? '⌘' : 'Ctrl';
}
