import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styled from "styled-components";

import { SupportSreetamDas, FoobarHintWrapper } from "./styled";

import { Button } from "@/components/Button";
import { ViewsCounter } from "@/components/ViewsCounter";
import { ShowCompletedBadges } from "@/components/foobar/badges";
import { KonamiWrapper } from "@/components/foobar/konami";
import { Terminal } from "@/components/foobar/terminal";
import { DocumentHead } from "@/components/shared/seo";
import {
	useFoobarStore,
	FoobarSchrodingerProps,
	FoobarPage,
	initialFoobarData,
} from "@/domains/Foobar";
import { StyledPre } from "@/styles/blog";
import { Space, Center } from "@/styles/layouts";
import { Title } from "@/styles/typography";
import { dog } from "@/utils/helpers";
import { useHasMounted } from "@/utils/hooks";
import Custom404 from "pages/404";

const XMarksTheSpot = (_props: { foobar: string }) => <div />;

const UnlockedBanner = ({ completedPage }: FoobarSchrodingerProps) =>
	completedPage && completedPage !== "/" ? (
		<CenterUnlockedPage $size={3.5}>
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

export const Foobar = ({ completedPage, unlocked }: FoobarSchrodingerProps) => {
	const router = useRouter();

	const { foobarData, setFoobarData } = useFoobarStore((state) => ({
		foobarData: state.foobarData,
		setFoobarData: state.setFoobarData,
	}));
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
		setFoobarData(initialFoobarData);
		dog("cleared");
	}
	function toggleTerminal() {
		setTerminalVisible((prev) => !prev);
	}
	const hasMounted = useHasMounted();

	if (!hasMounted) return null;
	if (!unlocked) return <FoobarButLocked />;

	return (
		<>
			<DocumentHead title="Foobar" noIndex />
			<Space $size={50} />
			{/* <Title>Hello Beautiful Nerd!</Title> */}
			<UnlockedBanner {...{ completedPage }} />
			<ShowCompletedBadges />
			<Space $size={20} />
			<Button onClick={handleClearFoobarData}>Clear everything and Restart</Button>
			<Space />
			<Center>
				<SupportSreetamDas />
			</Center>
			{process.env.NODE_ENV === "development" && (
				<>
					<Space />
					<StyledPre>
						<Title>DEV</Title>
						{JSON.stringify(foobarData, null, 2)}
					</StyledPre>
				</>
			)}
			<Terminal {...{ visible: terminalVisible, toggleTerminal }} />
			{!terminalVisible && <KonamiWrapper />}
			<XMarksTheSpot foobar={"/foobar/devtools"} />
			<ViewsCounter />
		</>
	);
};

export const FoobarButLocked = () => (
	<>
		<Custom404 />
		<FoobarHintWrapper>
			<small>
				<code>
					<em>psst, you should check the console!</em>
				</code>
			</small>
		</FoobarHintWrapper>
	</>
);

/**
 * Foobar page, that is only shown once foobar is unlocked
 * @param completedPage foobar page that is being currently accessed
 */
export const FoobarSchrodinger = ({ completedPage }: FoobarSchrodingerProps) => {
	const { unlocked, setFoobarData, completed } = useFoobarStore((state) => ({
		unlocked: state.foobarData.unlocked,
		completed: state.foobarData.completed,
		setFoobarData: state.setFoobarData,
	}));

	useEffect(() => {
		if (completedPage && !completed?.includes(completedPage)) {
			const updatedPages: Array<FoobarPage> = [...completed];
			updatedPages.push(completedPage);
			setFoobarData({
				completed: updatedPages,
			});
		}
	}, [completed, completedPage, setFoobarData]);

	return <Foobar {...{ completedPage, unlocked }} />;
};
