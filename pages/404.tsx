import { Text, Title, LinkTo } from "styles/blog";
import { Fragment } from "react";
import { ReallyBigTitle, Space } from "styles/layouts";
import Head from "next/head";

export type T404PageMessage = {
	message?: string;
};
const Custom404 = ({ message }: T404PageMessage) => {
	return (
		<Fragment>
			<Head>
				<title>404!</title>
			</Head>
			<ReallyBigTitle>404!</ReallyBigTitle>
			<Title>Page not found</Title>
			<Text style={{ textAlign: "center" }}>
				<LinkTo href="/">Go back home</LinkTo>
				<br />
				or check out{" "}
				<a
					href="https://www.theguardian.com/lifeandstyle/gallery/2018/jul/18/dog-photographer-of-the-year-2018-in-pictures"
					target="_blank"
					rel="noopener noreferrer"
				>
					the winners of Dog Photographer of the Year 2018, from The
					Guardian
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
		</Fragment>
	);
};

export default Custom404;
