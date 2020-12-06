import Head from "next/head";
import { useRouter } from "next/router";
import React, { useContext, useState, useEffect, Fragment } from "react";

import { FoobarContext, initialFoobarData } from "components/foobar";
import { ShowCompletedBadges } from "components/foobar/badges";
import { KonamiWrapper } from "components/foobar/konami";
import { Terminal } from "components/foobar/terminal";
import Custom404 from "pages/404";
import { StyledPre, Button } from "styles/blog";
import { Layout, Space, Center } from "styles/layouts";
import { SupportSreetamDas } from "styles/special";
import { StyledLink, Title } from "styles/typography";
import { dog } from "utils/console";

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
			<Head>
				<title>Foobar &mdash; Sreetam Das</title>
			</Head>
			<Layout>
				{completedPage && completedPage !== "/" && (
					<Title>
						You&apos;ve unlocked <code>{completedPage}</code>!
					</Title>
				)}
				<Space size={50} />
				<Title>Hello Beautiful Nerd!</Title>
				Here is where you can track all of your completed challenges on
				my website.
				<br />
				Feel free to{" "}
				<StyledLink
					href="https://twitter.com/_SreetamDas"
					target="_blank"
					rel="noreferrer noopener"
				>
					reach out to me
				</StyledLink>{" "}
				if you&apos;d like a clue or have any feedback!
				<Space />
				Here are your completed challenges:
				<ShowCompletedBadges />
				<Space size={20} />
				<Button onClick={handleClearFoobarData}>
					Clear everything and Restart
				</Button>
				<Space />
				<Center>
					<SupportSreetamDas />
				</Center>
				{process.env.NODE_ENV === "development" && (
					<Fragment>
						<Space />
						<StyledPre>
							<Title>DEV</Title>
							{JSON.stringify(foobarObject, null, 2)}
						</StyledPre>
					</Fragment>
				)}
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

/**
 * Foobar page, that is only shown once foobar is unlocked
 * @param completedPage foobar page that is being currently accessed
 */
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
					<Foobar {...{ completedPage }} />
				) : (
					<FoobarButLocked />
				)
			) : null}
		</Fragment>
	);
};
