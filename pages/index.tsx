import Head from "next/head";
import styled from "styled-components";
import { Fragment } from "react";

const Title = styled.h1`
	font-size: 50px;
`;

const Index = () => {
	return (
		<Fragment>
			<Head>
				<title>Hey! I&apos;m Sreetam Das 👋</title>
			</Head>
			<Title>Hey! I&apos;m Sreetam Das 👋</Title>
		</Fragment>
	);
};

export default Index;
