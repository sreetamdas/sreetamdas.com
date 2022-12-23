import { rest } from "msw";

import { BUTTONDOWN_EMAIL_MOCK, BUTTONDOWN_SUBSCRIBERS_MOCK } from "@/domains/Buttondown/mocks";

export const handlers = [
	// Buttondown.email
	rest.get("https://api.buttondown.email/v1/subscribers", (_req, res, ctx) =>
		res(ctx.status(200), ctx.json(BUTTONDOWN_SUBSCRIBERS_MOCK))
	),
	rest.get("https://api.buttondown.email/v1/emails", (_req, res, ctx) =>
		res(ctx.status(200), ctx.json(BUTTONDOWN_EMAIL_MOCK))
	),

	// GitHub stats
	rest.get("https://api.github.com/repos/sreetamdas/sreetamdas.com", (_req, res, ctx) =>
		res(ctx.status(200))
	),
	rest.post("/api/github/stats", (_req, res, ctx) =>
		res(ctx.status(200), ctx.json({ stars: 0, forks: 0 }))
	),

	// Supabase
	rest.post("/api/page/add-view", (_req, res, ctx) => res(ctx.status(200))),
	rest.get("/api/page/get-views", (_req, res, ctx) =>
		res(ctx.status(200), ctx.json({ view_count: 0 }))
	),
];
