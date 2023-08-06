"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import GlobalNotFound from "@/app/not-found";
import { IS_DEV } from "@/config";
import { useCustomPlausible } from "@/lib/domains/Plausible";
import { ShowCompletedBadges } from "@/lib/domains/foobar/badges";
import {
	type FoobarPageSlug,
	initialFoobarData,
	type FoobarSchrodingerProps,
} from "@/lib/domains/foobar/flags";
import { useGlobalStore } from "@/lib/domains/global";
import { useHasMounted } from "@/lib/helpers/hooks";

/**
 * Foobar page, that is only shown once foobar is unlocked
 * @param completedPage foobar page that is being currently accessed
 */
export const FoobarDashboard = ({ completedPage }: FoobarSchrodingerProps) => {
	const router = useRouter();
	const plausibleEvent = useCustomPlausible();
	const { foobarData, setFoobarData } = useGlobalStore((state) => ({
		foobarData: state.foobarData,
		setFoobarData: state.setFoobarData,
	}));

	function handleUserIsOffline() {
		router.push("/foobar/offline");
	}

	useEffect(() => {
		// window.addEventListener("keydown", handleGotoToggle);
		window.addEventListener("offline", handleUserIsOffline);

		return () => {
			// window.removeEventListener("keydown", handleGotoToggle);
			window.removeEventListener("offline", handleUserIsOffline);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function handleClearFoobarData() {
		plausibleEvent("foobar", { props: { achievement: "restart" } });
		setFoobarData(initialFoobarData);
		// eslint-disable-next-line no-console
		console.log("cleared");
	}

	return (
		<>
			<UnlockedAchievementBanner completedPage={completedPage} />
			<ShowCompletedBadges
				completed={foobarData.completed}
				allAchievements={foobarData.allAchievements}
			/>
			<button
				className="rounded-global border-2 border-solid border-primary bg-background px-6 py-1 text-sm text-foreground transition-[color,background-color] hover:bg-primary hover:text-background"
				onClick={handleClearFoobarData}
			>
				Clear everything and Restart
			</button>
			{/* <Center>
				<SupportSreetamDas />
			</Center> */}
			{IS_DEV && (
				<pre className="mx-0.5 rounded bg-foreground/10 p-6 font-mono text-sm transition-[color,background-color] dark:bg-foreground/20">
					<h2>DEV</h2>
					{JSON.stringify(foobarData, null, 2)}
				</pre>
			)}
			{/* <Terminal {...{ visible: terminalVisible, toggleTerminal }} /> */}
			{/* {!terminalVisible && <KonamiWrapper />} */}
			<XMarksTheSpot foobar="/foobar/devtools" />
		</>
	);
};

const UnlockedAchievementBanner = ({ completedPage }: FoobarSchrodingerProps) =>
	completedPage && completedPage !== "/" ? (
		<h1>
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
		</h1>
	) : null;

const XMarksTheSpot = (_props: { foobar: string }) => null;

const FoobarButLocked = () => (
	<GlobalNotFound
		message={<p className="pt-5 text-center text-xs">psst, you should check the console!</p>}
	/>
);

export const FoobarSchrodinger = ({ completedPage }: FoobarSchrodingerProps) => {
	const { unlocked, setFoobarData, completed } = useGlobalStore((state) => ({
		unlocked: state.foobarData.unlocked,
		completed: state.foobarData.completed,
		setFoobarData: state.setFoobarData,
	}));
	const hasMounted = useHasMounted();
	const plausibleEvent = useCustomPlausible();

	useEffect(() => {
		if (completedPage && !completed?.includes(completedPage)) {
			const updatedPages: Array<FoobarPageSlug> = [...completed];
			updatedPages.push(completedPage);

			plausibleEvent("foobar", { props: { achievement: completedPage } });
			setFoobarData({
				completed: updatedPages,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [completed, completedPage]);

	if (!hasMounted) return null;
	if (!unlocked) return <FoobarButLocked />;

	return <FoobarDashboard completedPage={completedPage} />;
};
