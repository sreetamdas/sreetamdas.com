import { Fragment } from "react";

import { Newsletter } from "components/blog/Newsletter";
import { DocumentHead } from "components/shared/seo";

const Index = () => {
	return (
		<Fragment>
			<DocumentHead title="Newsletter" />
			<Newsletter />
		</Fragment>
	);
};

export default Index;
