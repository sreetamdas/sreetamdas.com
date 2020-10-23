import { useRouter } from "next/router";
import { useState, useContext, Fragment, useEffect } from "react";

import { FoobarContext, initialFoobarData } from "components/foobar";
import { Terminal } from "components/foobar/goto";
import { KonamiWrapper } from "components/foobar/konami";
import Custom404 from "pages/404";
import { Title, StyledPre } from "styles/blog";
import { Layout, Space } from "styles/layouts";
import { SupportSreetamDas } from "styles/special";
import { dog } from "utils/console";

export const FOOBAR_PAGES = {
	sourceCode: "source-code",
	headers: "headers",
	DNS_TXT: "dns-txt",
	easterEgg: "easter-egg",
	index: "/",
	devtools: "devtools",
	navigator: "navigator",
	konami: "konami",
	offline: "offline",
	hack: "hack",
} as const;

/**
 * this page is only "activated" once `X` has been discovered
 */

const Index = () => <FoobarSchrodinger completedPage="/" />;

export default Index;

const XMarksTheSpot = (_props: { foobar: string }) => <div />;

export const Foobar = ({ completedPage }: TFoobarSchrodingerProps) => {
	const router = useRouter();
	const foobarContextObj = useContext(FoobarContext);
	const { updateFoobarDataPartially, ...foobarObject } = foobarContextObj;
	const [terminalVisible, setTerminalVisible] = useState(false);

	const handleGotoToggle = (event: KeyboardEvent) => {
		if (event.key === "Escape") setTerminalVisible(false);
		if (event.key === "/") {
			setTerminalVisible(true);
			event.stopPropagation();
			event.preventDefault();
		}
		if (event.key === "p" && event.metaKey) {
			event.preventDefault();
			setTerminalVisible(true);
		}
		if (
			process.env.NODE_ENV === "development" &&
			event.key === "g" &&
			event.metaKey
		) {
			event.preventDefault();
			dog("dev mode, going to offline-only page");
			handleUserIsOffline();
		}
	};

	const handleUserIsOffline = () => {
		router.push("foobar/offline");
	};

	useEffect(() => {
		window.addEventListener("keydown", handleGotoToggle);
		window.addEventListener("offline", handleUserIsOffline);

		return () => {
			window.removeEventListener("keydown", handleGotoToggle);
			window.removeEventListener("offline", handleUserIsOffline);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleClearFoobarData = () => {
		updateFoobarDataPartially(initialFoobarData);
		dog("cleared");
	};
	const toggleTerminal = () => {
		setTerminalVisible((prev) => !prev);
	};
	return (
		<Fragment>
			<Layout>
				{completedPage && completedPage !== "/" && (
					<Title>
						You&apos;ve unlocked <code>{completedPage}</code>!
					</Title>
				)}
				<Space />
				Here are your completed challenges:
				<StyledPre>{JSON.stringify(foobarObject, null, 2)}</StyledPre>
				<button onClick={handleClearFoobarData}>Restart</button>
				<Space />
				<SupportSreetamDas />
			</Layout>
			<Terminal {...{ visible: terminalVisible, toggleTerminal }} />
			{!terminalVisible && <KonamiWrapper />}
			<XMarksTheSpot foobar={"/foobar/devtools"} />
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
				padding: "50px 0",
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
