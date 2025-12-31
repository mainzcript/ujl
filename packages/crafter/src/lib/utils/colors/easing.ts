/**
 * Cosine ease function for smooth blending transitions.
 * Returns 1 at dist=0, 0 at dist>=radius, smooth C¹-continuous curve.
 *
 * @param dist - Distance from anchor point
 * @param radius - Maximum distance for blending
 * @returns Blend factor (0-1), where 1 = 100% overlay, 0 = 100% base
 */
export function ease(dist: number, radius: number): number {
	if (dist >= radius) return 0;
	const x = dist / radius;
	return 0.5 * (1 + Math.cos(Math.PI * x));
}
