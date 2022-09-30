import { useEffect } from "react";

import { DocumentHead } from "@/components/shared/seo";
import { useFoobarStore, FOOBAR_PAGES, FoobarPage } from "@/domains/Foobar";
import { useCustomPlausible } from "@/domains/Plausible";
import { Center, Space } from "@/styles/layouts";
import { ReallyBigTitle, Title, Paragraph, LinkTo } from "@/styles/typography";

export type T404PageMessage = {
	message?: string;
};
const Custom404 = ({ message }: T404PageMessage) => {
	const { setFoobarData, completed } = useFoobarStore((state) => ({
		completed: state.foobarData.completed,
		setFoobarData: state.setFoobarData,
	}));
	const plausibleEvent = useCustomPlausible();

	useEffect(() => {
		const updatedPages: Array<FoobarPage> = [...completed];

		if (!updatedPages.includes(FOOBAR_PAGES.notFound)) {
			updatedPages.push(FOOBAR_PAGES.notFound);
			setFoobarData({
				completed: updatedPages,
			});
		}
	}, [completed, setFoobarData]);

	function handleDogLinkClick() {
		const updatedPages: Array<FoobarPage> = [...completed];
		if (!updatedPages.includes(FOOBAR_PAGES.dogs)) {
			updatedPages.push(FOOBAR_PAGES.dogs);
			plausibleEvent("foobar", { props: { achievement: FOOBAR_PAGES.dogs } });
			setFoobarData({
				completed: updatedPages,
			});
		}
	}
	return (
		<>
			<DocumentHead title="404!" description="Ugh, you're in the wrong place :/" noIndex />
			<Center>
				<ReallyBigTitle>404!</ReallyBigTitle>
				<Title $resetLineHeight>Page not found :(</Title>
				<Space $size={50} />
				<Title $size={1.5} $resetLineHeight>
					<LinkTo href="/">Go back home</LinkTo>
				</Title>
				<Paragraph style={{ textAlign: "center" }}>
					or check out{" "}
					<LinkTo
						href="https://www.theguardian.com/lifeandstyle/gallery/2018/jul/18/dog-photographer-of-the-year-2018-in-pictures"
						target="_blank"
						onClick={handleDogLinkClick}
					>
						the winners of Dog Photographer of the Year 2018
						<br />
						from The Guardian
					</LinkTo>
				</Paragraph>
				{message ? (
					<>
						<Space />
						<Paragraph>
							<i style={{ fontWeight: 100, fontSize: "12px" }}>{message}</i>
						</Paragraph>
					</>
				) : null}
			</Center>
		</>
	);
};

export default Custom404;
