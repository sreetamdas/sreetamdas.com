import Head from "next/head";
import { useRouter } from "next/router";
import React, { useContext, useState, useEffect, Fragment } from "react";

import { FoobarContext, initialFoobarData } from "components/foobar";
import { ShowCompletedBadges } from "components/foobar/badges";
import { KonamiWrapper } from "components/foobar/konami";
import { Terminal } from "components/foobar/terminal";
import Custom404 from "pages/404";
import { StyledPre, Button } from "styles/blog";
import { Space, Center } from "styles/layouts";
import { SupportSreetamDas } from "styles/special";
import { Paragraph, StyledLink, Title } from "styles/typography";
import { TFoobarSchrodingerProps, TFoobarPage } from "typings/console";
import { dog } from "utils/console";

const XMarksTheSpot = (_props: { foobar: string }) => <div />;

const UnlockedBanner = ({ completedPage }: TFoobarSchrodingerProps) =>
	completedPage && completedPage !== "/" ? (
		<Fragment>
			<Space />
			<Title size={2}>
				You&apos;ve unlocked{" "}
				<span role="img" aria-label="sparkle">
					✨
				</span>{" "}
				<code>{completedPage}</code>{" "}
				<span role="img" aria-label="sparkle">
					✨
				</span>
			</Title>
			<Space />
		</Fragment>
	) : null;

export const Foobar = ({
	completedPage,
	unlocked,
}: TFoobarSchrodingerProps) => {
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
		router.push("/foobar/offline");
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

	if (!unlocked) return <FoobarButLocked />;

	return (
		<Fragment>
			<Head>
				<title>Foobar &mdash; Sreetam Das</title>
			</Head>
			<Space size={50} />
			{/* <Title>Hello Beautiful Nerd!</Title> */}
			<UnlockedBanner {...{ completedPage }} />
			<Paragraph>
				Here is where you can track all of your completed challenges on my
				website.
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
			</Paragraph>
			<Space />
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
	const {
		unlocked,
		dataLoaded,
		updateFoobarDataPartially,
		completed,
	} = useContext(FoobarContext);

	useEffect(() => {
		if (completedPage && !completed?.includes(completedPage)) {
			const updatedPages: Array<TFoobarPage> = [...completed];
			updatedPages.push(completedPage);
			updateFoobarDataPartially({
				completed: updatedPages,
			});
		}
	}, [completed, completedPage, updateFoobarDataPartially]);

	return (
		<Fragment>
			{dataLoaded ? <Foobar {...{ completedPage, unlocked }} /> : null}
		</Fragment>
	);
};
