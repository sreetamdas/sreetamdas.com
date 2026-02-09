import { FoobarSchrodinger } from "@/lib/domains/foobar/Dashboard.client";
import { type FoobaFlagPageSlug, FOOBAR_FLAGS } from "@/lib/domains/foobar/flags";
import { createFileRoute, notFound } from "@tanstack/react-router";
import z from "zod";

const foobar_routes_schema = z.object({
	slug: z.enum(getAllFoobarPagesSlugs()),
});

export const Route = createFileRoute("/(main)/(foobar)/foobar/$slug")({
	component: FoobarCompletedPage,
	loader: ({ params: { slug } }: { params: { slug: Exclude<FoobaFlagPageSlug, "/"> } }) => {
		const all_foobar_pages_slugs = getAllFoobarPagesSlugs();
		if (!all_foobar_pages_slugs.includes(slug)) {
			notFound();
		}

		return { slug };
	},
	params: {
		parse: (params) => {
			return foobar_routes_schema.parse(params);
		},
	},
});

function FoobarCompletedPage() {
	const { slug } = Route.useLoaderData() as { slug: Exclude<FoobaFlagPageSlug, "/"> };

	return <FoobarSchrodinger completed_page={slug} />;
}

function getAllFoobarPagesSlugs() {
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
