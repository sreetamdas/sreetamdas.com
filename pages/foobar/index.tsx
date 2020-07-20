import { Title } from "components/styled/blog";
import { GetServerSideProps } from "next";
import { useState, useContext, Fragment, useEffect } from "react";
import { FoobarContext, initialFoobarData } from "components/console";
import Custom404 from "pages/404";
import { dog } from "utils/console";

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
				)
			) : null}
		</Fragment>
	);
};

const Foobar = (props: TFoobarContext) => {
	const { updateFoobarDataPartially } = props;
	const handleClearFoobarData = () => {
		updateFoobarDataPartially(initialFoobarData);
		dog("cleared");
	};
	return (
		<Fragment>
			<Title>You&apos;re unlocked!</Title>
			{JSON.stringify(props, null, 2)}
			<button onClick={handleClearFoobarData}>Restart</button>
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
