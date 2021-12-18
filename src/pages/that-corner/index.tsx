/* eslint-disable react/no-unescaped-entities */
import { Fragment } from "react";

import { FullWidth } from "@/styles/layouts";
import { ReallyBigTitle, Title } from "@/styles/typography";

const Index = () => {
	return (
		<Fragment>
			<FullWidth>
				<div style={{ padding: "0 50px" }}>
					<ReallyBigTitle>
						You've found <br />
						<em>that corner</em>!
					</ReallyBigTitle>
				</div>
			</FullWidth>
			<Title
				style={{
					justifySelf: "end",
					gridColumn: "1 / -1",
					paddingRight: "50px",
				}}
			>
				Check back again soon
				<span role="img" aria-label="lightning">
					⚡️
				</span>
			</Title>
		</Fragment>
	);
};

export default Index;
