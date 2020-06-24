import { Text, Title, LinkTo } from "components/styled/blog";
import { Fragment } from "react";

const Custom404 = () => {
	return (
		<Fragment>
			<Title>404 - Page Not Found</Title>
			<Text>
				<LinkTo href="/">Go back home</LinkTo>
			</Text>
		</Fragment>
	);
};

export default Custom404;
