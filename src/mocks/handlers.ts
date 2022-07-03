import { rest } from "msw";

export const handlers = [
	// Buttondown.email
	rest.get("https://api.buttondown.email/v1/subscribers", (_req, res, ctx) =>
		res(ctx.status(200), ctx.json({ count: 69 }))
	),

	// GitHub stats
	rest.get("https://api.github.com/repos/sreetamdas/sreetamdas.com", (_req, res, ctx) =>
		res(ctx.status(200))
	),
	rest.post("/api/github/stats", (_req, res, ctx) =>
		res(ctx.status(200), ctx.json({ stars: 69, forks: 69 }))
	),

	// Supabase
	rest.post("/api/page/add-view", (_req, res, ctx) => res(ctx.status(200))),
	rest.get("/api/page/get-views", (_req, res, ctx) =>
		res(ctx.status(200), ctx.json({ view_count: 69 }))
	),
];
