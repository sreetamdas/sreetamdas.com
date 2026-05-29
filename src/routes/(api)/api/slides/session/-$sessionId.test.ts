import { describe, expect, test } from "vitest";

import { handleSlideSessionRequest, isValidSessionId } from "./$sessionId";

type SlideSessionStub = {
	fetch: (request: Request) => Promise<Response> | Response;
};

describe("handleSlideSessionRequest", () => {
	test("returns 500 when SLIDE_SESSIONS binding is missing", async () => {
		const response = await handleSlideSessionRequest(
			new Request("https://example.com/api/slides/session/demo"),
			undefined,
			"demo",
		);

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			error: "SLIDE_SESSIONS binding is not available",
		});
	});

	test("validates session ids before durable object lookup", async () => {
		const response = await handleSlideSessionRequest(
			new Request("https://example.com/api/slides/session/../bad"),
			{
				getByName: () => {
					throw new Error("should not lookup");
				},
			},
			"../bad",
		);

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ error: "Invalid slide session id" });
	});

	test("delegates valid requests to the named slide session durable object", async () => {
		const request = new Request("https://example.com/api/slides/session/keynote");
		let calledWithName = "";
		let calledWithRequest: Request | null = null;
		const stub: SlideSessionStub = {
			fetch: (incomingRequest) => {
				calledWithRequest = incomingRequest;
				return new Response("ok");
			},
		};

		const response = await handleSlideSessionRequest(
			request,
			{
				getByName: (name) => {
					calledWithName = name;
					return stub;
				},
			},
			"keynote",
		);

		expect(calledWithName).toBe("keynote");
		expect(calledWithRequest).toBe(request);
		expect(await response.text()).toBe("ok");
	});

	test("allows URL-safe session ids", () => {
		expect(isValidSessionId("room-1_abc")).toBe(true);
		expect(isValidSessionId("")).toBe(false);
		expect(isValidSessionId("bad/path")).toBe(false);
	});
});
