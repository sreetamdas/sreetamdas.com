import { useContext, useEffect } from "react";
import { ThemeContext } from "styled-components";

import { ViewsCounter } from "@/components/ViewsCounter";
import { GreenScreen } from "@/components/talks/greenscreen";
import { FullWidthWrapper } from "@/styles/layouts";
import { Title } from "@/styles/typography";

const Page = () => {
	const { changeThemeVariant } = useContext(ThemeContext);

	useEffect(() => {
		changeThemeVariant("dark");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<FullWidthWrapper>
				<div style={{ padding: "0 25px" }}>
					<Title
						style={{
							justifySelf: "end",
							gridColumn: "1 / -1",
							paddingBottom: "50px",
						}}
					>
						Green Screen using React and HTML Elements
					</Title>
					<GreenScreen />
				</div>
			</FullWidthWrapper>
			<ViewsCounter />
		</>
	);
};

export default Page;
