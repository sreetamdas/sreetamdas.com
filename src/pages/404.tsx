import React, { Fragment, useContext, useEffect } from "react";

import { FoobarContext } from "components/foobar";
import { DocumentHead } from "components/shared/seo";
import { Center, Space } from "styles/layouts";
import { ReallyBigTitle, Title, Paragraph, LinkTo } from "styles/typography";
import { FOOBAR_PAGES, TFoobarPage } from "typings/console";

export type T404PageMessage = {
	message?: string;
};
const Custom404 = ({ message }: T404PageMessage) => {
	const { updateFoobarDataPartially, completed } = useContext(FoobarContext);

	useEffect(() => {
		const updatedPages: Array<TFoobarPage> = [...completed];

		if (!updatedPages.includes(FOOBAR_PAGES.notFound)) {
			updatedPages.push(FOOBAR_PAGES.notFound);
			updateFoobarDataPartially({
				completed: updatedPages,
			});
		}
	}, [completed, updateFoobarDataPartially]);

	const handleDogLinkClick = () => {
		const updatedPages: Array<TFoobarPage> = [...completed];
		if (!updatedPages.includes(FOOBAR_PAGES.dogs)) {
			updatedPages.push(FOOBAR_PAGES.dogs);
			updateFoobarDataPartially({
				completed: updatedPages,
			});
		}
	};
	return (
		<Fragment>
			<DocumentHead title="404!" description="Ugh, you're in the wrong place :/" noIndex />
			<Center>
				<ReallyBigTitle>404!</ReallyBigTitle>
				<Title resetLineHeight>Page not found :(</Title>
				<Space size={50} />
				<Title size={1.5} resetLineHeight>
					<LinkTo href="/">Go back home</LinkTo>
				</Title>
				<Paragraph style={{ textAlign: "center" }}>
					or check out{" "}
					<a
						href="https://www.theguardian.com/lifeandstyle/gallery/2018/jul/18/dog-photographer-of-the-year-2018-in-pictures"
						target="_blank"
						rel="noopener noreferrer"
						onClick={handleDogLinkClick}
					>
						the winners of Dog Photographer of the Year 2018
						<br />
						from The Guardian
					</a>
				</Paragraph>
				{message ? (
					<Fragment>
						<Space />
						<Paragraph>
							<i style={{ fontWeight: 100, fontSize: "12px" }}>{message}</i>
						</Paragraph>
					</Fragment>
				) : null}
			</Center>
		</Fragment>
	);
};

export default Custom404;
