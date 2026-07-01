import { describe, expect, test } from "vitest";

import { tanstackStartLivePolls } from "./-live-polls";

describe("tanstackStartLivePolls", () => {
	test("aligns live polls with the slide cues in the talk deck", () => {
		expect(tanstackStartLivePolls.map((poll) => poll.slide)).toEqual([15, 20]);
	});
});
