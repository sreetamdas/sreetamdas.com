import { getMDXComponent } from "mdx-bundler/client";
import { InferGetStaticPropsType } from "next";
import { useMemo } from "react";

import { NewsletterSignup } from "@/components/Newsletter/Signup";
import { ViewsCounter } from "@/components/ViewsCounter";
import { MDXComponents } from "@/components/mdx";
import { DocumentHead } from "@/components/shared/seo";
import { getButtondownSubscriberCount } from "@/domains/Buttondown";
import { Center, Space } from "@/styles/layouts";
import { PrimaryGradient, Heavy, Title } from "@/styles/typography";
import { getMDXFileData } from "@/utils/blog";

const Index = ({ code, subscriberCount }: InferGetStaticPropsType<typeof getStaticProps>) => {
	const Component = useMemo(() => getMDXComponent(code), [code]);

	return (
		<>
			<DocumentHead title="Home" />
			<Space $size={25} />
			<Center>
				<Title $size={2.5}>
					Hey, I&apos;m Sreetam Das!{" "}
					<span role="img" aria-label="wave">
						👋
					</span>
				</Title>
			</Center>
			<Space $size={25} />
			<Component
				components={{
					PrimaryGradient,
					Heavy,
					...MDXComponents,
				}}
			/>
			<NewsletterSignup {...{ subscriberCount }} />

			<ViewsCounter hidden />
		</>
	);
};

export default Index;

export async function getStaticProps() {
	const subscriberCount = await getButtondownSubscriberCount();
	const result = await getMDXFileData("introduction", { cwd: "content" });

	return {
		props: { ...result, subscriberCount },
	};
}
