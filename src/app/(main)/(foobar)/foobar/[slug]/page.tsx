import { notFound } from "next/navigation";

import { FoobarSchrodinger } from "@/lib/domains/foobar/Dashboard";
import { type FoobarPageSlug, FOOBAR_PAGES } from "@/lib/domains/foobar/flags";

type PageParams = {
	params: { slug: Exclude<FoobarPageSlug, "/"> };
};
export default function FoobarCompletedPage({ params: { slug } }: PageParams) {
	const all_foobar_pages_slugs = getAllFoobarPagesSlugs();

	if (!all_foobar_pages_slugs.includes(slug)) {
		notFound();
	}

	return <FoobarSchrodinger completedPage={slug} />;
}

export function generateStaticParams() {
	const all_foobar_pages_slugs = getAllFoobarPagesSlugs();
	const paths = all_foobar_pages_slugs.map((slug) => ({ slug }));

	return paths;
}

function getAllFoobarPagesSlugs() {
	return Object.values(FOOBAR_PAGES);
}
