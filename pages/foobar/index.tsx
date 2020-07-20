import { Title } from "components/styled/blog";
import { GetServerSideProps } from "next";
import { useState, useContext, Fragment, useEffect } from "react";
import { FoobarContext } from "components/console";

/**
 * this page is only "activated" once `X` has been discovered
 */

const Index = () => {
	const foobarObject = useContext(FoobarContext);
	const { unlocked, dataLoaded } = foobarObject;
	const [foobarUnlocked, setFoobarUnlocked] = useState(unlocked);

	useEffect(() => {
		setFoobarUnlocked(unlocked);
	}, [unlocked]);

	return (
		<Fragment>
			{dataLoaded ? (
				foobarUnlocked ? (
					<Foobar {...foobarObject} />
				) : (
					<Title>Ⅹ marks the spot</Title>
				)
			) : null}
		</Fragment>
	);
};

const Foobar = (props: TFoobarContext) => {
	return (
		<Fragment>
			<Title>You&apos;re unlocked!</Title>
			{JSON.stringify(props, null, 2)}
		</Fragment>
	);
};

export default Index;
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	res.setHeader("x-foobar", "https://sreetamdas.com/foobar/headers");
	return {
		props: {},
	};
};
