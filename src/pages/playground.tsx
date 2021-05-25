import { Fragment } from "react";

import { LiveCode } from "components/MDXLiveCode";
import { Title } from "styles/typography";

const Playground = () => {
	return (
		<Fragment>
			<Title>Playground</Title>

			<LiveCode />
		</Fragment>
	);
};

export default Playground;
