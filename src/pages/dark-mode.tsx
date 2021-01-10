import { useContext, useEffect } from "react";
import styled, { ThemeContext } from "styled-components";

export const DarkMode = () => {
	const { changeThemeVariant } = useContext(ThemeContext);

	useEffect(() => {
		changeThemeVariant("dark");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<DarkModeWrapper>
			Lorem Ipsum
			<LightOverlay>some more text</LightOverlay>
		</DarkModeWrapper>
	);
};

export default DarkMode;

const DarkModeWrapper = styled.div`
	background-color: black;
	color: black;
`;

const LightOverlay = styled.div`
	background-image: url("/flashlight.png");
	background-repeat: no-repeat;
	background-image: 500px 500px;
`;
