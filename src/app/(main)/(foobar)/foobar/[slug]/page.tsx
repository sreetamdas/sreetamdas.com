import { notFound } from "next/navigation";

import { FoobarSchrodinger } from "@/lib/domains/foobar/Dashboard.client";
import { FOOBAR_FLAGS, type FoobaFlagPageSlug } from "@/lib/domains/foobar/flags";

export const dynamicParams = false;

export function generateStaticParams() {
	const all_foobar_pages_slugs = getAllFoobarPagesSlugs();
	const paths = all_foobar_pages_slugs.map((slug) => ({ slug }));

	return paths;
}

type PageParams = {
	params: { slug: Exclude<FoobaFlagPageSlug, "/"> };
};
export default function FoobarCompletedPage({ params: { slug } }: PageParams) {
	const all_foobar_pages_slugs = getAllFoobarPagesSlugs();

	if (!all_foobar_pages_slugs.includes(slug)) {
		notFound();
	}

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
