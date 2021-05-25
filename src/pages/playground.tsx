import { Fragment } from "react";

import { LiveCode } from "components/MDXLiveCode";
import { Title } from "styles/typography";

const Playground = () => {
	return (
		<Fragment>
			<Title size={5}>
				Playground{" "}
				<span role="img" aria-label="partying-face">
					🥳
				</span>
			</Title>

			<LiveCode />
		</Fragment>
	);
};

export default Playground;
