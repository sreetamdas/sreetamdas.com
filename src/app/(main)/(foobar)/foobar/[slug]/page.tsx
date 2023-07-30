import { notFound } from "next/navigation";

import { FOOBAR_PAGES } from "@/lib/domains/foobar/flags";

type PageParams = {
	params: { slug: string };
};
export default function FoobarCompletedPage({ params: { slug } }: PageParams) {
	const all_foobar_pages_slugs = getAllFoobarPagesSlugs();

	// FIXME expand string union
	// @ts-expect-error expand string union
	if (!all_foobar_pages_slugs.includes(slug)) {
		notFound();
	}

	return <h1 className="font-heading font-serif text-8xl">/{slug}</h1>;
}

export function generateStaticParams() {
	const all_foobar_pages_slugs = getAllFoobarPagesSlugs();
	const paths = all_foobar_pages_slugs.map((slug) => ({ slug }));

	return paths;
}

function getAllFoobarPagesSlugs() {
	return Object.values(FOOBAR_PAGES);
}
