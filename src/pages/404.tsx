import Head from "next/head";
import React, { Fragment, useContext, useEffect } from "react";

import { FoobarContext } from "components/foobar";
import { FOOBAR_PAGES } from "components/foobar/badges";
import { Center, Space } from "styles/layouts";
import { ReallyBigTitle, Title, Text, LinkTo } from "styles/typography";

export type T404PageMessage = {
	message?: string;
};
const Custom404 = ({ message }: T404PageMessage) => {
	const { updateFoobarDataPartially, completed } = useContext(FoobarContext);

	useEffect(() => {
		const updatedPages: Array<TFoobarPages> = [...completed];

		if (!updatedPages.includes(FOOBAR_PAGES.notFound)) {
			updatedPages.push(FOOBAR_PAGES.notFound);
			updateFoobarDataPartially({
				completed: updatedPages,
			});
		}
	}, [completed, updateFoobarDataPartially]);

	const handleDogLinkClick = () => {
		const updatedPages: Array<TFoobarPages> = [...completed];
		if (!updatedPages.includes(FOOBAR_PAGES.dogs)) {
			updatedPages.push(FOOBAR_PAGES.dogs);
			updateFoobarDataPartially({
				completed: updatedPages,
			});
		}
	};
	return (
		<Fragment>
			<Head>
				<title>404!</title>
			</Head>
			<Center>
				<ReallyBigTitle>404!</ReallyBigTitle>
				<Title resetLineHeight>Page not found</Title>
				<Space size={50} />
				<Title size={1.5} resetLineHeight>
					<LinkTo href="/">Go back home</LinkTo>
				</Title>
				<Text style={{ textAlign: "center" }}>
					or check out{" "}
					<a
						href="https://www.theguardian.com/lifeandstyle/gallery/2018/jul/18/dog-photographer-of-the-year-2018-in-pictures"
						target="_blank"
						rel="noopener noreferrer"
						onClick={handleDogLinkClick}
					>
						the winners of Dog Photographer of the Year 2018, from
						The Guardian
					</a>
				</Text>
				{message ? (
					<Fragment>
						<Space />
						<Text>
							<i style={{ fontWeight: 100, fontSize: "12px" }}>
								{message}
							</i>
						</Text>
					</Fragment>
				) : null}
			</Center>
		</Fragment>
	);
};

export default Custom404;
