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

	test("delegates valid viewer requests to the named slide session durable object", async () => {
		const request = new Request("https://example.com/api/slides/session/keynote");
		let calledWithName = "";
		const calledWithRequests: Array<Request> = [];
		const stub: SlideSessionStub = {
			fetch: (incomingRequest) => {
				calledWithRequests.push(incomingRequest);
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
		const calledWithRequest = calledWithRequests.at(0);
		if (!calledWithRequest) throw new Error("expected forwarded request");
		expect(calledWithRequest.headers.get("x-sreetamdas-slide-role")).toBe("viewer");
		expect(await response.text()).toBe("ok");
	});

	test("rejects master requests without an allowed presenter", async () => {
		const response = await handleSlideSessionRequest(
			new Request("https://example.com/api/slides/session/keynote?role=master"),
			{
				getByName: () => {
					throw new Error("should not lookup");
				},
			},
			"keynote",
			() => undefined,
		);

		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({ error: "Presenter authentication required" });
	});

	test("forwards a trusted master role for allowed presenters", async () => {
		let trustedRole = "";
		const response = await handleSlideSessionRequest(
			new Request("https://example.com/api/slides/session/keynote?role=master"),
			{
				getByName: () => ({
					fetch: (incomingRequest) => {
						trustedRole = incomingRequest.headers.get("x-sreetamdas-slide-role") ?? "";
						return new Response("ok");
					},
				}),
			},
			"keynote",
			() => "sreetam@example.com",
		);

		expect(response.status).toBe(200);
		expect(trustedRole).toBe("master");
	});

	test("allows URL-safe session ids", () => {
		expect(isValidSessionId("room-1_abc")).toBe(true);
		expect(isValidSessionId("")).toBe(false);
		expect(isValidSessionId("bad/path")).toBe(false);
	});
});
