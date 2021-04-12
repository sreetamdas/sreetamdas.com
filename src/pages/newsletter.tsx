import Head from "next/head";
import { Fragment } from "react";

import { Newsletter } from "components/blog/Newsletter";

const Index = () => {
	return (
		<Fragment>
			<Head>
				<title>Newsletter &mdash; Sreetam Das</title>
			</Head>
			<Newsletter />
		</Fragment>
	);
};

export default Index;
