import { Text, Title, LinkTo } from "components/styled/blog";
import { Fragment } from "react";
import { ReallyBigTitle } from "components/styled/Layouts";

const Custom404 = () => {
	return (
		<Fragment>
			<ReallyBigTitle>404!</ReallyBigTitle>
			<Title>Page not found</Title>
			<Text style={{ textAlign: "center" }}>
				<LinkTo href="/">Go back home</LinkTo>
				<br />
				<span>
					or check out{" "}
					<a
						href="https://www.theguardian.com/lifeandstyle/gallery/2018/jul/18/dog-photographer-of-the-year-2018-in-pictures"
						target="_blank"
						rel="noopener noreferrer"
					>
						the winners of Dog Photographer of the Year 2018, from
						The Guardian
					</a>
				</span>
			</Text>
		</Fragment>
	);
};

export default Custom404;
