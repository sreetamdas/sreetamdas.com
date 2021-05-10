import { Fragment } from "react";

import {
	NavigationContainer,
	Typography,
	NavLink,
	ChromaHighlight,
} from "components/FancyPants";
import { DocumentHead } from "components/shared/seo";
import { FullWidth, Space } from "styles/layouts";

const FancyPants = () => {
	return (
		<Fragment>
			<DocumentHead title="Fancy Pants" />
			<FullWidth>
				<div style={{ padding: "0 25px" }}>
					<NavigationContainer>
						<NavLink href="/">Home</NavLink>
					</NavigationContainer>
					<Typography $large>
						<Space />
						<ChromaHighlight>Sreetam Das</ChromaHighlight>
						<br />
						is a <ChromaHighlight>Frontend Engineer</ChromaHighlight>
						<br />
						working{" "}
						<ChromaHighlight link>
							<a href="https://remote.com" target="_blank" rel="noreferrer">
								@Remote
							</a>
						</ChromaHighlight>{" "}
						who loves
						<br />
						<ChromaHighlight>React</ChromaHighlight> and{" "}
						<ChromaHighlight>TypeScript</ChromaHighlight>
					</Typography>
				</div>
			</FullWidth>
		</Fragment>
	);
};

export default FancyPants;
