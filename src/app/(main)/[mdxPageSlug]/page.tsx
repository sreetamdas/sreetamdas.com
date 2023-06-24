"use client";

import dynamic from "next/dynamic";
// import { Suspense } from "react";

// export const dynamicParams = false;

// export async function generateStaticParams() {
// 	const MDX_PAGES_DIR = path.resolve(process.cwd(), "src", "app", "(main)", "[mdxPageSlug]");
// 	const files = (await fs.readdir(MDX_PAGES_DIR)).filter((file) => file.endsWith(".mdx"));

// 	const params = files.map((fileName) => {
// 		const pageName = fileName.replace(/\.mdx?$/, "");
// 		return {
// 			mdxPageSlug: pageName,
// 		};
// 	});

// 	return params;
// }

type PageParamsType = {
	params: {
		mdxPageSlug: string;
	};
};

export default async function MDXContentPage({ params: { mdxPageSlug: slug } }: PageParamsType) {
	const MDXContent = dynamic(() => import(`./${slug}.mdx`));

	return <MDXContent />;
}
