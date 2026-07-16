import { describe, expect, test } from "vitest";

import { isPresenceClientId, isPresenceServerMessage } from "./protocol";

describe("isPresenceClientId", () => {
	test("accepts UUID-like per-tab ids", () => {
		expect(isPresenceClientId("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
		expect(isPresenceClientId("browser_tab_123")).toBe(true);
	});

	test("rejects missing, short, oversized, or unsafe ids", () => {
		expect(isPresenceClientId(undefined)).toBe(false);
		expect(isPresenceClientId("short")).toBe(false);
		expect(isPresenceClientId("x".repeat(81))).toBe(false);
		expect(isPresenceClientId("has spaces")).toBe(false);
		expect(isPresenceClientId("<script>")).toBe(false);
	});
});

describe("isPresenceServerMessage", () => {
	test("accepts count messages", () => {
		expect(isPresenceServerMessage({ type: "count", count: 2 })).toBe(true);
		expect(isPresenceServerMessage({ type: "count", count: 2, hunters: 1 })).toBe(true);
	});

	test("rejects malformed messages", () => {
		expect(isPresenceServerMessage({ type: "count", count: Number.NaN })).toBe(false);
		expect(isPresenceServerMessage({ type: "count", count: -1 })).toBe(false);
		expect(isPresenceServerMessage({ type: "count", count: 1, hunters: -1 })).toBe(false);
		expect(isPresenceServerMessage({ type: "ping" })).toBe(false);
		expect(isPresenceServerMessage({ type: "pong" })).toBe(false);
		expect(isPresenceServerMessage(null)).toBe(false);
	});
});
