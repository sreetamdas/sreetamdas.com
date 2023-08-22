import { notFound } from "next/navigation";

import { FoobarSchrodinger } from "@/lib/domains/foobar/Dashboard.client";
import { FOOBAR_FLAGS, type FoobaFlagPageSlug } from "@/lib/domains/foobar/flags";

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

export function generateStaticParams() {
	const all_foobar_pages_slugs = getAllFoobarPagesSlugs();
	const paths = all_foobar_pages_slugs.map((slug) => ({ slug }));

	return paths;
}

function getAllFoobarPagesSlugs() {
	return Object.keys(FOOBAR_FLAGS);
}
