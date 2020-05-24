import { Fragment } from "react";
import MDXUses from "content/Uses.mdx";
import { Layout, RemoveBullterFromOL } from "components/Layouts";

const Uses = () => {
	return (
		<Fragment>
			<Layout>
				<RemoveBullterFromOL>
					<MDXUses />
				</RemoveBullterFromOL>
			</Layout>
		</Fragment>
	);
};

export default Uses;
