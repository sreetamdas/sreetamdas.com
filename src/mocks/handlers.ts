import { rest } from "msw";

export const handlers = [
	rest.post("/api/coffee", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json({ message: "I'm NOT a teapot" }));
	}),
	rest.post("https://telemetry.nextjs.org/api/v1/record", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json({ message: "I'm NOT a teapot" }));
	}),

	rest.get("https://api.buttondown.email/v1/subscribers", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json({ count: 69 }));
	}),

	rest.get("https://api.github.com/repos/sreetamdas/sreetamdas.com", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json({ stargazers_count: 69, forks: 69 }));
	}),

	rest.post(
		"https://shpiudmeykaahmmhipos.supabase.co/rest/v1/rpc/upsert_page_view",
		(_req, res, ctx) => {
			return res(ctx.status(200), ctx.body("69"));
		}
	),

	rest.post("/api/github/stats", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json({ stars: 96, forks: 96 }));
	}),

	rest.post("/api/page/*", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json({ view_count: 96 }));
	}),
];
