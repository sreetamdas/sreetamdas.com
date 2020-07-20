import { Title } from "components/styled/blog";
import { GetServerSideProps } from "next";
import { useState, useContext, Fragment, useEffect } from "react";
import { FoobarContext, initialFoobarData } from "components/console";
import Custom404 from "pages/404";
import { dog } from "utils/console";
import { Layout } from "components/styled/Layouts";

/**
 * this page is only "activated" once `X` has been discovered
 */

const Index = () => <Foobar />;

export default Index;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	res.setHeader("x-foobar", "https://sreetamdas.com/foobar/headers");
	return {
		props: {},
	};
};

export const Foobar = () => {
	const foobarContextObj = useContext(FoobarContext);
	const { updateFoobarDataPartially, ...foobarObject } = foobarContextObj;

	const handleClearFoobarData = () => {
		updateFoobarDataPartially(initialFoobarData);
		dog("cleared");
	};
	return (
		<Fragment>
			<Layout>
				<Title>You&apos;re unlocked!</Title>
				{JSON.stringify(foobarObject, null, 2)}
				<button onClick={handleClearFoobarData}>Restart</button>
			</Layout>
		</Fragment>
	);
};

export const FoobarButLocked = () => (
	<Fragment>
		<Custom404 />
		<div
			style={{
				position: "absolute",
				bottom: "0",
				left: "0",
				right: "0",
				margin: "auto",
				padding: "15px 0",
				textAlign: "center",
			}}
		>
			<small>
				<code>
					<em>psst, you should check the console!</em>
				</code>
			</small>
		</div>
	</Fragment>
);

export const FoobarSchrodinger = () => {
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
					<Foobar />
				) : (
					<FoobarButLocked />
				)
			) : null}
		</Fragment>
	);
};
