import { Fragment } from "react";

import { LiveCode } from "components/MDXLiveCode";
import { DocumentHead } from "components/shared/seo";
import { Title } from "styles/typography";

const Playground = () => {
	return (
		<Fragment>
			<DocumentHead title="Playground 🥳" />

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
