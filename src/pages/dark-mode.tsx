import { useContext, useEffect } from "react";
import styled, { ThemeContext } from "styled-components";

export const DarkMode = () => {
	const { changeThemeVariant } = useContext(ThemeContext);

	useEffect(() => {
		changeThemeVariant("dark");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <DarkModeWrapper>Lorem Ipsum</DarkModeWrapper>;
};

export default DarkMode;

const DarkModeWrapper = styled.div`
	background-color: black;
	color: black;
`;
