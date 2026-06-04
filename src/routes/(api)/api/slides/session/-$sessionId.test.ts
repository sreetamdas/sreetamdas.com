import { describe, expect, test } from "vitest";

import {
	handleSlideSessionRequest,
	isValidSessionId,
	resolveRequestedSlideRole,
	withTrustedSlideRole,
} from "./$sessionId";

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

	test("treats unknown roles as viewers without resolving presenter auth", async () => {
		let resolverCalled = false;
		let trustedRole = "";
		const response = await handleSlideSessionRequest(
			new Request("https://example.com/api/slides/session/keynote?role=admin"),
			{
				getByName: () => ({
					fetch: (incomingRequest) => {
						trustedRole = incomingRequest.headers.get("x-sreetamdas-slide-role") ?? "";
						return new Response("ok");
					},
				}),
			},
			"keynote",
			() => {
				resolverCalled = true;
				return "sreetam@example.com";
			},
		);

		expect(response.status).toBe(200);
		expect(resolverCalled).toBe(false);
		expect(trustedRole).toBe("viewer");
	});

	test("awaits async presenter resolution before forwarding master requests", async () => {
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
			async () => "sreetam@example.com",
		);

		expect(response.status).toBe(200);
		expect(trustedRole).toBe("master");
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

	test("overwrites any forged trusted role header before delegation", () => {
		const forwarded = withTrustedSlideRole(
			new Request("https://example.com/api/slides/session/keynote", {
				headers: {
					"x-sreetamdas-slide-role": "master",
					"x-custom": "kept",
				},
			}),
			"viewer",
		);

		expect(forwarded.headers.get("x-sreetamdas-slide-role")).toBe("viewer");
		expect(forwarded.headers.get("x-custom")).toBe("kept");
	});

	test("resolves only explicit master requests as presenter-gated", async () => {
		let resolverCalls = 0;
		await expect(
			resolveRequestedSlideRole(
				new Request("https://example.com/api/slides/session/keynote?role=viewer"),
				() => {
					resolverCalls += 1;
					return "sreetam@example.com";
				},
			),
		).resolves.toBe("viewer");
		expect(resolverCalls).toBe(0);

		await expect(
			resolveRequestedSlideRole(
				new Request("https://example.com/api/slides/session/keynote?role=master"),
				() => undefined,
			),
		).resolves.toBe("unauthorized");
	});

	test("allows URL-safe session ids", () => {
		expect(isValidSessionId("room-1_abc")).toBe(true);
		expect(isValidSessionId("")).toBe(false);
		expect(isValidSessionId("bad/path")).toBe(false);
		expect(isValidSessionId("a".repeat(80))).toBe(true);
		expect(isValidSessionId("a".repeat(81))).toBe(false);
	});
});
