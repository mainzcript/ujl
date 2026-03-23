import { describe, expect, it } from "vitest";
import {
	getAutoScrollDelta,
	getAutoScrollEdgeZone,
	resolveAutoScrollEdgeState,
} from "./auto-scroll.js";

describe("auto-scroll targeting", () => {
	const containerRect = { top: 100, bottom: 500 };

	it("detects the active edge zone near the top and bottom", () => {
		expect(getAutoScrollEdgeZone(110, containerRect, 64)).toBe("top");
		expect(getAutoScrollEdgeZone(490, containerRect, 64)).toBe("bottom");
		expect(getAutoScrollEdgeZone(250, containerRect, 64)).toBe(null);
	});

	it("keeps scrolling inactive before the dwell delay elapses", () => {
		const started = resolveAutoScrollEdgeState(
			"top",
			{ activeZone: null, zoneEnteredAt: null },
			1_000,
			250,
		);

		const pending = resolveAutoScrollEdgeState("top", started.nextState, 1_200, 250);

		expect(started.isScrollActive).toBe(false);
		expect(pending.isScrollActive).toBe(false);
	});

	it("activates scrolling after the dwell delay in the same edge zone", () => {
		const started = resolveAutoScrollEdgeState(
			"bottom",
			{ activeZone: null, zoneEnteredAt: null },
			1_000,
			250,
		);

		const active = resolveAutoScrollEdgeState("bottom", started.nextState, 1_250, 250);

		expect(active.isScrollActive).toBe(true);
		expect(active.nextState).toEqual({ activeZone: "bottom", zoneEnteredAt: 1_000 });
	});

	it("resets the dwell delay when leaving the edge zone", () => {
		const activeState = { activeZone: "top" as const, zoneEnteredAt: 1_000 };

		const cleared = resolveAutoScrollEdgeState(null, activeState, 1_300, 250);

		expect(cleared.isScrollActive).toBe(false);
		expect(cleared.nextState).toEqual({ activeZone: null, zoneEnteredAt: null });
	});

	it("restarts the dwell delay when switching between top and bottom zones", () => {
		const topState = { activeZone: "top" as const, zoneEnteredAt: 1_000 };

		const switched = resolveAutoScrollEdgeState("bottom", topState, 1_300, 250);

		expect(switched.isScrollActive).toBe(false);
		expect(switched.nextState).toEqual({ activeZone: "bottom", zoneEnteredAt: 1_300 });
	});

	it("keeps the existing delta curve after activation", () => {
		expect(getAutoScrollDelta(110, containerRect, 64, 18)).toBeLessThan(0);
		expect(getAutoScrollDelta(490, containerRect, 64, 18)).toBeGreaterThan(0);
		expect(getAutoScrollDelta(250, containerRect, 64, 18)).toBe(0);
	});
});
