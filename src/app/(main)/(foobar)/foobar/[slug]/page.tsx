import { notFound } from "next/navigation";

import { FOOBAR_PAGES } from "@/lib/domains/foobar/flags";

type PageParams = {
	params: { slug: string };
};
export default function FoobarCompletedPage({ params: { slug } }: PageParams) {
	const allFoobarPageSlugs = getAllFoobarPageSlugs();

	// FIXME expand string union
	// @ts-expect-error expand string union
	if (!allFoobarPageSlugs.includes(slug)) {
		notFound();
	}

	return <h1 className="font-heading font-serif text-8xl">/{slug}</h1>;
}

export function generateStaticParams() {
	const allPages = getAllFoobarPageSlugs();
	const paths = allPages.map((slug) => ({ slug }));

	return paths;
}

function getAllFoobarPageSlugs() {
	return Object.values(FOOBAR_PAGES);
}
