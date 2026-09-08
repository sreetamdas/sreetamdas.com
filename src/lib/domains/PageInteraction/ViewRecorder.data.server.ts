/** Server-only request facts and content allowlist; no D1 access until every guard accepts. */
import "@tanstack/react-start/server-only";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";

import { getDb } from "@/db";
import { upsertPageViews } from "@/lib/domains/PageViews";

import { type PagePathnamePayload } from "./shared";
import { isKnownViewPage } from "./ViewRecorder.pages.server";
import { recordPageView } from "./ViewRecorder.server";

export async function recordPageViewInDb(data: PagePathnamePayload) {
	return recordPageView(data, getRequest(), env, isKnownViewPage, async (slug) => {
		await upsertPageViews(getDb(), slug);
	});
}
