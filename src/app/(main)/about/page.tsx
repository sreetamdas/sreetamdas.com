import { notFound } from "next/navigation";

import { SocialLinks } from "./SocialLinks";

import { SITE_TITLE_APPEND } from "@/config";
import { MDXContent } from "@/lib/components/MDX";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { FoobarEntry } from "@/lib/domains/foobar/Entry.client";
import { allPages } from "contentlayer/generated";

export const runtime = "edge";
export const metadata = {
	title: `About ${SITE_TITLE_APPEND}`,
};

export default function AboutPage() {
	const post = allPages.find((page) => page.page_path === "/about");

	if (!post) notFound();

	return (
		<>
			<h1 className="pb-20 pt-10 font-serif text-8xl">/about</h1>
			<MDXContent code={post.body.code} components={{ SocialLinks }} />
			<ViewsCounter slug="/about" />
			<FoobarEntry />
		</>
	);
}
