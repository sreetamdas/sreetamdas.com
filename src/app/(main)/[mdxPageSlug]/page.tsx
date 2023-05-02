import { promises as fs } from "fs";
import path from "path";

import type dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ViewsCounter } from "@/lib/components/ViewsCounter";

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

type MDXContentFrontmatterType = {
	title: string;
	description: string;
	published: boolean;
	updatedAt: string;
};
type PageParamsType = {
	params: {
		mdxPageSlug: string;
	};
};
export default async function MDXContentPage({ params: { mdxPageSlug: slug } }: PageParamsType) {
	const {
		default: MDXContent,
		title,
		// description,
		published,
		updatedAt,
	} = (await import("./credits.mdx")) as unknown as {
		default: ReturnType<typeof dynamic>;
	} & MDXContentFrontmatterType;

	if (!published) {
		notFound();
	}

	return (
		<Suspense fallback={<p>Loading...</p>}>
			<h1 className="font-heading py-10 font-serif text-8xl">/{title.toLowerCase()}</h1>
			<MDXContent />
			<p className="flex justify-center pb-10 pt-20 text-sm italic">Last updated: {updatedAt}</p>
			{/* @ts-expect-error Async Server Component */}
			<ViewsCounter slug={`/${slug}`} />
		</Suspense>
	);
}
