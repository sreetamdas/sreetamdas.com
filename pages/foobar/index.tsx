import { Title, StyledPre } from "components/styled/blog";
import { GetServerSideProps } from "next";
import { useState, useContext, Fragment, useEffect } from "react";
import { FoobarContext, initialFoobarData } from "components/console";
import Custom404 from "pages/404";
import { dog } from "utils/console";
import { Layout, Space } from "components/styled/Layouts";
import { SupportSreetamDas } from "components/styled/special";

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

export const Foobar = ({ completedPage }: TFoobarSchrodingerProps) => {
	const foobarContextObj = useContext(FoobarContext);
	const { updateFoobarDataPartially, ...foobarObject } = foobarContextObj;

	const handleClearFoobarData = () => {
		updateFoobarDataPartially(initialFoobarData);
		dog("cleared");
	};
	return (
		<Fragment>
			<Layout>
				{completedPage && (
					<Title>
						You&apos;ve unlocked <code>{completedPage}</code>!
					</Title>
				)}
				Here are your completed challenges:
				<Space />
				<StyledPre>{JSON.stringify(foobarObject, null, 2)}</StyledPre>
				<button onClick={handleClearFoobarData}>Restart</button>
				<Space />
				<SupportSreetamDas />
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

export const FoobarSchrodinger = ({
	completedPage,
}: TFoobarSchrodingerProps) => {
	const foobarObject = useContext(FoobarContext);
	const {
		unlocked,
		dataLoaded,
		updateFoobarDataPartially,
		completed,
	} = foobarObject;
	const [foobarUnlocked, setFoobarUnlocked] = useState(unlocked);

	useEffect(() => {
		if (completedPage && !completed?.includes(completedPage)) {
			const updatedPages: Array<TFoobarPages> = [...completed];
			updatedPages.push(completedPage);
			updateFoobarDataPartially({
				completed: updatedPages,
			});
		}
	}, [completed, completedPage, updateFoobarDataPartially]);
	useEffect(() => {
		setFoobarUnlocked(unlocked);
	}, [unlocked]);

	return (
		<Fragment>
			{dataLoaded ? (
				foobarUnlocked ? (
					<Fragment>
						<Foobar {...{ completedPage }} />
					</Fragment>
				) : (
					<FoobarButLocked />
				)
			) : null}
		</Fragment>
	);
};
