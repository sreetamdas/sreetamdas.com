import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";

import { ExternalLinksOverlay } from "@/components/Navbar";
import { NewsletterSignup } from "@/components/Newsletter/Signup";
import { ViewsCounter } from "@/components/ViewsCounter";
import { MDXComponents } from "@/components/mdx";
import { DocumentHead } from "@/components/shared/seo";
import { getButtondownSubscriberCount } from "@/domains/Buttondown";
import { useFoobarStore } from "@/domains/Foobar";
import { useCustomPlausible } from "@/domains/Plausible";
import { Center } from "@/styles/layouts";
import { Title, LinkTo } from "@/styles/typography";
import { MDXBundledResultProps } from "@/typings/blog";
import { getMDXFileData } from "@/utils/blog";

type Props = MDXBundledResultProps & {
	subscriberCount: Awaited<ReturnType<typeof getButtondownSubscriberCount>>;
};

const About = ({ code, frontmatter: _, subscriberCount }: Props) => {
	const Component = useMemo(() => getMDXComponent(code), [code]);
	const plausible = useCustomPlausible();
	const { setFoobarData, unlocked } = useFoobarStore((state) => ({
		unlocked: state.foobarData.unlocked,
		setFoobarData: state.setFoobarData,
	}));

	function handleXDiscovery() {
		if (!unlocked) {
			plausible("foobar", { props: { achievement: "/" } });
			setFoobarData({ unlocked: true });
		}
	}

	return (
		<>
			<DocumentHead title="About" />
			<Center>
				<Title $size={5}>/about</Title>
			</Center>

			<Component
				components={{
					ExternalLinksOverlay,
					...MDXComponents,
				}}
			/>

			<ViewsCounter />
			<NewsletterSignup {...{ subscriberCount }} />
			<Center>
				<LinkTo
					href="/foobar"
					data-testid="Ⅹ"
					onClick={handleXDiscovery}
					style={{
						color: "var(--color-background)",
						alignSelf: "center",
						border: "none",
					}}
				>
					Ⅹ
				</LinkTo>
			</Center>
		</>
	);
};

/**
 * maybe take inspiration from how @cassidoo has her website? have multiple
 * "sections" available; so a short one which focuses on just tech, and a longer
 * one that goes into more depth, perhaps even into my origins?
 */

export default About;

export async function getStaticProps() {
	const subscriberCount = await getButtondownSubscriberCount();
	const result = await getMDXFileData("about", { cwd: "content" });

	return {
		props: { ...result, subscriberCount },
	};
}
