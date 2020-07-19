import { Title } from "components/styled/blog";
import { GetServerSideProps } from "next";

const Index = () => {
	return <Title>X marks the spot</Title>;
};

export default Index;
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	res.setHeader("x-foobar", "https://sreetamdas.com/foobar/headers");
	return {
		props: {},
	};
};
