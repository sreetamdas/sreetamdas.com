import React, { useContext, useEffect } from "react";
import { ThemeContext } from "styled-components";

import { Highlighted, Typography } from "components/FancyPants";
import { FullWidth } from "styles/layouts";
import { random, useInterval, useTimeout } from "utils/hooks";

const FancyPants = () => {
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
				<Typography>
					<Highlighted>Sreetam Das</Highlighted>
					<br />
					is a <Highlighted>Frontend Engineer</Highlighted>
					<br />
					working{" "}
					<Highlighted link>
						<a
							href="https://remote.com"
							target="_blank"
							rel="noreferrer"
						>
							@Remote
						</a>{" "}
					</Highlighted>
					who loves <Highlighted>React</Highlighted> and{" "}
					<Highlighted>TypeScript</Highlighted>
				</Typography>
			</div>
		</FullWidth>
	);
};

export default FancyPants;
