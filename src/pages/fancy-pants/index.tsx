import { NavigationContainer, Typography, NavLink, ChromaHighlight } from "@/components/FancyPants";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { WithoutNavbar } from "@/layouts/WIthoutNavbar";
import { FullWidthWrapper, Space } from "@/styles/layouts";

const FancyPants = () => (
	<>
		<DocumentHead title="Fancy Pants" description="Sreetam's fancy-shmancy landing page" />
		<FullWidthWrapper>
			<div style={{ padding: "0 25px" }}>
				<NavigationContainer>
					<NavLink href="/">Home</NavLink>
				</NavigationContainer>
				<Typography $large>
					<ChromaHighlight>Sreetam Das</ChromaHighlight>
					<br />
					is a <ChromaHighlight>Front-end Engineer</ChromaHighlight>
					<br />
					working{" "}
					<ChromaHighlight link>
						<a href="https://remote.com" target="_blank" rel="noreferrer">
							@Remote
						</a>
					</ChromaHighlight>{" "}
					who loves
					<br />
					<ChromaHighlight>React</ChromaHighlight> and <ChromaHighlight>TypeScript</ChromaHighlight>
				</Typography>
			</div>
		</FullWidthWrapper>
		<Space />

		<ViewsCounter />
	</>
);

FancyPants.Layout = WithoutNavbar;
export default FancyPants;
