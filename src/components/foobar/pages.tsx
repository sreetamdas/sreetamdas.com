import { useRouter } from "next/router";
import React, { useContext, useState, useEffect, Fragment } from "react";
import styled from "styled-components";

import { ViewsCounter } from "@/components/ViewsCounter";
import { FoobarContext, initialFoobarData } from "@/components/foobar";
import { ShowCompletedBadges } from "@/components/foobar/badges";
import { KonamiWrapper } from "@/components/foobar/konami";
import { SupportSreetamDas } from "@/components/foobar/styled";
import { Terminal } from "@/components/foobar/terminal";
import { DocumentHead } from "@/components/shared/seo";
import { StyledPre, Button } from "@/styles/blog";
import { Space, Center } from "@/styles/layouts";
import { Title } from "@/styles/typography";
import { TFoobarSchrodingerProps, TFoobarPage } from "@/typings/console";
import { dog } from "@/utils/console";
import Custom404 from "pages/404";

const XMarksTheSpot = (_props: { foobar: string }) => <div />;

const UnlockedBanner = ({ completedPage }: TFoobarSchrodingerProps) =>
	completedPage && completedPage !== "/" ? (
		<CenterUnlockedPage size={3.5}>
			— You&apos;ve unlocked —
			<br />
			<code>
				<span role="img" aria-label="sparkle">
					✨
				</span>{" "}
				{completedPage}{" "}
				<span role="img" aria-label="sparkle">
					✨
				</span>
			</code>
		</CenterUnlockedPage>
	) : null;

const CenterUnlockedPage = styled(Title)`
	text-align: center;
`;

export const Foobar = ({ completedPage, unlocked }: TFoobarSchrodingerProps) => {
	const router = useRouter();
	const foobarContextObj = useContext(FoobarContext);
	const { updateFoobarDataPartially, ...foobarObject } = foobarContextObj;
	const [terminalVisible, setTerminalVisible] = useState(false);

	function handleGotoToggle(event: KeyboardEvent) {
		if (event.key === "Escape") setTerminalVisible(false);
		if (event.metaKey && event.key === "k") {
			event.preventDefault();
			setTerminalVisible(true);
		}
	}

	function handleUserIsOffline() {
		router.push("/foobar/offline");
	}

	useEffect(() => {
		window.addEventListener("keydown", handleGotoToggle);
		window.addEventListener("offline", handleUserIsOffline);

		return () => {
			window.removeEventListener("keydown", handleGotoToggle);
			window.removeEventListener("offline", handleUserIsOffline);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function handleClearFoobarData() {
		updateFoobarDataPartially(initialFoobarData);
		dog("cleared");
	}
	function toggleTerminal() {
		setTerminalVisible((prev) => !prev);
	}

	if (!unlocked) return <FoobarButLocked />;

	return (
		<Fragment>
			<DocumentHead title="Foobar" noIndex />
			<Space size={50} />
			{/* <Title>Hello Beautiful Nerd!</Title> */}
			<UnlockedBanner {...{ completedPage }} />
			<ShowCompletedBadges />
			<Space size={20} />
			<Button onClick={handleClearFoobarData}>Clear everything and Restart</Button>
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
			<ViewsCounter />
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
export const FoobarSchrodinger = ({ completedPage }: TFoobarSchrodingerProps) => {
	const { unlocked, dataLoaded, updateFoobarDataPartially, completed } = useContext(FoobarContext);

	useEffect(() => {
		if (completedPage && !completed?.includes(completedPage)) {
			const updatedPages: Array<TFoobarPage> = [...completed];
			updatedPages.push(completedPage);
			updateFoobarDataPartially({
				completed: updatedPages,
			});
		}
	}, [completed, completedPage, updateFoobarDataPartially]);

	return <Fragment>{dataLoaded ? <Foobar {...{ completedPage, unlocked }} /> : null}</Fragment>;
};
