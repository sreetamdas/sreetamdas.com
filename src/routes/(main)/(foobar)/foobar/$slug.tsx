/**
 * Dynamic achievement route for /foobar. Valid slugs are derived from
 * FOOBAR_FLAGS so the challenge catalogue is the single source of truth for
 * route availability, dashboard badges, and completion tracking.
 */
import { createFileRoute, notFound } from "@tanstack/react-router";

import { FoobarSchrodinger } from "@/lib/domains/foobar/DashboardClient";
import { type FoobaFlagPageSlug, FOOBAR_FLAGS } from "@/lib/domains/foobar/flags";

export const Route = createFileRoute("/(main)/(foobar)/foobar/$slug")({
	component: FoobarCompletedPage,
	staleTime: 1000 * 60 * 60 * 24,
	params: {
		parse: (params) => {
			if (!isFoobarPageSlug(params.slug)) {
				throw notFound();
			}

			return { slug: params.slug };
		},
	},
	loader: ({ params: { slug } }) => {
		return { slug };
	},
});

function FoobarCompletedPage() {
	const { slug } = Route.useLoaderData();

	return <FoobarSchrodinger completed_page={slug} />;
}

function isFoobarPageSlug(slug: string): slug is Exclude<FoobaFlagPageSlug, "/"> {
	const all_foobar_pages_slugs: readonly string[] = getAllFoobarPagesSlugs();
	return all_foobar_pages_slugs.includes(slug);
}

function getAllFoobarPagesSlugs(): Array<Exclude<FoobaFlagPageSlug, "/">> {
	return Object.values(FOOBAR_FLAGS).flatMap((challenge_obj) => {
		if ("slug" in challenge_obj) {
			if (challenge_obj.slug === "/") {
				return [];
			}
			return challenge_obj.slug;
		}
		return [];
	});
}
