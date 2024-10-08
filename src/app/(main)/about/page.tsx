import { notFound } from "next/navigation";

import { SITE_TITLE_APPEND } from "@/config";
import { rootPages } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { FoobarEntry } from "@/lib/domains/foobar/Entry.client";

import { SocialLinks } from "./SocialLinks";

export const metadata = {
	title: `About ${SITE_TITLE_APPEND}`,
};

export default function AboutPage() {
	const post = rootPages.find((page) => page.page_path === "/about");

	if (!post) notFound();

	return (
		<>
			<h1 className="pb-20 pt-10 font-serif text-8xl font-bold tracking-tighter">/about</h1>
			<MDXContent code={post.code} components={{ SocialLinks }} />
			<ViewsCounter slug="/about" />
			<FoobarEntry />
		</>
	);
}
