import { describe, expect, test } from "vitest";

import { handlePresenceGetForNamespace } from "./presence";

type PresenceStub = {
	fetch: (request: Request) => Promise<Response> | Response;
};

describe("handlePresenceGetForNamespace", () => {
	test("returns 500 json when SITE_PRESENCE binding is missing", async () => {
		const request = new Request("https://example.com/api/presence");

		const response = await handlePresenceGetForNamespace(request, undefined);

		expect(response.status).toBe(500);
		expect(response.headers.get("content-type") ?? "").toMatch(/^application\/json/);
		expect(await response.json()).toEqual({
			error: "SITE_PRESENCE binding is not available",
		});
	});

	test("delegates request to global presence durable object", async () => {
		const request = new Request("https://example.com/api/presence");
		let calledWithName = "";
		let calledWithRequest: Request | null = null;

		const stub: PresenceStub = {
			fetch: (incomingRequest) => {
				calledWithRequest = incomingRequest;
				return new Response("ok", { status: 200 });
			},
		};

		const presence = {
			getByName: (name: string) => {
				calledWithName = name;
				return stub;
			},
		};

		const response = await handlePresenceGetForNamespace(request, presence);

		expect(calledWithName).toBe("global");
		expect(calledWithRequest).toBe(request);
		expect(response.status).toBe(200);
		expect(await response.text()).toBe("ok");
	});

	test("supports async durable object fetch responses", async () => {
		const request = new Request("https://example.com/api/presence");
		const presence = {
			getByName: () => {
				return {
					fetch: async () => {
						return new Response("async-ok", { status: 200 });
					},
				};
			},
		};

		const response = await handlePresenceGetForNamespace(request, presence);

		expect(response.status).toBe(200);
		expect(await response.text()).toBe("async-ok");
	});

	test("bubbles durable object lookup failures", async () => {
		const request = new Request("https://example.com/api/presence");
		const presence = {
			getByName: () => {
				throw new Error("lookup failed");
			},
		};

		expect(() => handlePresenceGetForNamespace(request, presence)).toThrow("lookup failed");
	});
});
