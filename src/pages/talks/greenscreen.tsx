import React, { useContext, useEffect } from "react";
import { ThemeContext } from "styled-components";

import { GreenScreen } from "components/talks/greenscreen";
import { FullWidth } from "styles/layouts";
import { Title } from "styles/typography";
import { random, useInterval, useTimeout } from "utils/hooks";

const Page = () => {
	let root: HTMLElement;
	const { changeThemeVariant } = useContext(ThemeContext);

	const getNewColor = () => {
		const h = random(1, 360);
		const s = random(80, 90);
		const l = random(50, 60);

		return `hsl(${h}, ${s}%, ${l}%)`;
	};

	const changeColor = () => {
		const newColor = getNewColor();

		if (root === undefined) root = document?.documentElement;
		root.style.setProperty("--color-fancy-pants", newColor);
	};

	useInterval(() => {
		changeColor();
	}, 5000);

	// HACK: begin the color transition, adding it in useMount doesn't set off the CSS transition
	useTimeout(() => {
		changeColor();
	}, 0);

	useEffect(() => {
		changeThemeVariant("dark");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<FullWidth>
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
		</FullWidth>
	);
};

export default Page;
