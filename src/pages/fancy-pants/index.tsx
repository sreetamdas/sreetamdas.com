import React, { useContext, useEffect, Fragment } from "react";
import { ThemeContext } from "styled-components";

import { ReallyBigTitle } from "styles/typography";

const FancyPants = () => {
	const { changeThemeVariant } = useContext(ThemeContext);

	useEffect(() => {
		changeThemeVariant("dark");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Fragment>
			<ReallyBigTitle>Sreetam Das</ReallyBigTitle>
		</Fragment>
	);
};

export default FancyPants;
