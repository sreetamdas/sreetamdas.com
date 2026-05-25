import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { handlePresenceGetForNamespace } from "./presence";

type PresenceStub = {
	fetch: (request: Request) => Promise<Response> | Response;
};

describe("handlePresenceGetForNamespace", () => {
	test("returns 500 json when SITE_PRESENCE binding is missing", async () => {
		const request = new Request("https://example.com/api/presence");

		const response = await handlePresenceGetForNamespace(request, undefined);

		assert.equal(response.status, 500);
		assert.match(response.headers.get("content-type") ?? "", /^application\/json/);
		assert.deepEqual(await response.json(), {
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

		assert.equal(calledWithName, "global");
		assert.equal(calledWithRequest, request);
		assert.equal(response.status, 200);
		assert.equal(await response.text(), "ok");
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

		assert.equal(response.status, 200);
		assert.equal(await response.text(), "async-ok");
	});

	test("bubbles durable object lookup failures", async () => {
		const request = new Request("https://example.com/api/presence");
		const presence = {
			getByName: () => {
				throw new Error("lookup failed");
			},
		};

		assert.throws(() => handlePresenceGetForNamespace(request, presence), {
			message: "lookup failed",
		});
	});
});
