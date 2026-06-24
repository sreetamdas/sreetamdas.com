import { describe, expect, test } from "vitest";

import { isRealtimeClientId } from "./client-id";

describe("isRealtimeClientId", () => {
	test("accepts safe browser client ids", () => {
		expect(isRealtimeClientId("browser_tab_123")).toBe(true);
		expect(isRealtimeClientId("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
	});

	test("rejects missing, short, oversized, or unsafe client ids", () => {
		expect(isRealtimeClientId(undefined)).toBe(false);
		expect(isRealtimeClientId("short")).toBe(false);
		expect(isRealtimeClientId("x".repeat(81))).toBe(false);
		expect(isRealtimeClientId("has spaces")).toBe(false);
		expect(isRealtimeClientId("<script>")).toBe(false);
	});
});
