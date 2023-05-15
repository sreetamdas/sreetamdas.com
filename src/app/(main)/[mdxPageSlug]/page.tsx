import { promises as fs } from "fs";
import path from "path";

import { Suspense } from "react";

import type { MDXPagePaths } from "./MDXPage";
import { getComponentFromSlug } from "./MDXPage";

export const dynamicParams = false;

export async function generateStaticParams() {
	const MDX_PAGES_DIR = path.resolve(process.cwd(), "src", "app", "(main)", "[mdxPageSlug]");
	const files = (await fs.readdir(MDX_PAGES_DIR)).filter((file) => file.endsWith(".mdx"));

	const params = files.map((fileName) => {
		const pageName = fileName.replace(/\.mdx?$/, "");
		return {
			mdxPageSlug: pageName,
		};
	});

	return params;
}

type PageParamsType = {
	params: {
		mdxPageSlug: MDXPagePaths;
	};
};

export default async function MDXContentPage({ params: { mdxPageSlug: slug } }: PageParamsType) {
	const { default: MDXContent, title } = await getComponentFromSlug(slug);

	return (
		<Suspense fallback={<p>Loading...</p>}>
			<h1 className="font-heading py-10 font-serif text-8xl">/{title.toLowerCase()}</h1>
			<MDXContent />
		</Suspense>
	);
}
