/**
 * Smoothly scrolls to an element with the ID from the current URL hash.
 * Tries up to 10 times in 50ms intervals to find the element.
 */
export function scrollToHash(maxTries = 10, intervalMs = 50) {
	if (typeof window === 'undefined' || typeof document === 'undefined') return;
	if (window.location.hash) {
		const id = window.location.hash.slice(1);
		let tries = 0;
		const interval = setInterval(() => {
			const el = document.getElementById(id);
			if (el) {
				el.scrollIntoView({ behavior: 'smooth' });
				clearInterval(interval);
			} else if (++tries >= maxTries) {
				clearInterval(interval);
			}
		}, intervalMs);
	}
}
