import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { handlePresenceGet } from "./presence";

type PresenceStub = {
	fetch: (request: Request) => Promise<Response> | Response;
};

type PresenceBinding = {
	getByName: (name: string) => PresenceStub;
};

type PresenceEnv = {
	SITE_PRESENCE?: PresenceBinding;
};

describe("handlePresenceGet", () => {
	test("returns 500 json when SITE_PRESENCE binding is missing", async () => {
		const request = new Request("https://example.com/api/presence");

		const response = await handlePresenceGet(request, {} as PresenceEnv);

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

		const env: PresenceEnv = {
			SITE_PRESENCE: {
				getByName: (name) => {
					calledWithName = name;
					return stub;
				},
			},
		};

		const response = await handlePresenceGet(request, env);

		assert.equal(calledWithName, "global");
		assert.equal(calledWithRequest, request);
		assert.equal(response.status, 200);
		assert.equal(await response.text(), "ok");
	});
});
