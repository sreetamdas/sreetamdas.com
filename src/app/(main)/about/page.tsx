import { notFound } from "next/navigation";

import { SocialLinks } from "./SocialLinks";

import { SITE_TITLE_APPEND } from "@/config";
import { rootPages } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { FoobarEntry } from "@/lib/domains/foobar/Entry.client";

export const metadata = {
	title: `About ${SITE_TITLE_APPEND}`,
};

export default function AboutPage() {
	const post = rootPages.find((page) => page.page_path === "/about");

	if (!post) notFound();

	return (
		<>
			<h1 className="pt-10 pb-20 font-bold font-serif text-8xl tracking-tighter">/about</h1>
			<MDXContent code={post.code} components={{ SocialLinks }} />
			<ViewsCounter slug="/about" />
			<FoobarEntry />
		</>
	);
}
