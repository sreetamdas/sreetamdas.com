import { Center } from "components/styled/Layouts";
import { Title } from "components/styled/blog";
import { useContext, useEffect } from "react";
import { ThemeContext } from "styled-components";

const FancyPants = () => {
	const { changeThemeVariant } = useContext(ThemeContext);

	useEffect(() => {
		changeThemeVariant("dark");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Center>
			<Title>Oooh, ya fancy!</Title>
		</Center>
	);
};

export default FancyPants;
