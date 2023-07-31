"use client";

import { IS_DEV } from "@/config";
import { useCustomPlausible } from "@/lib/domains/Plausible";
import { DocumentHead } from "@/lib/domains/SEO";
import { type FoobarSchrodingerProps, initialFoobarData } from "@/lib/domains/foobar/flags";
import { useGlobalStore } from "@/lib/domains/global";

export const FoobarDashboard = ({ completedPage, unlocked }: FoobarSchrodingerProps) => {
	// const router = useRouter();
	const plausibleEvent = useCustomPlausible();
	const { foobarData, setFoobarData } = useGlobalStore((state) => ({
		foobarData: state.foobarData,
		setFoobarData: state.setFoobarData,
	}));

	// TODO cleanup
	// function handleUserIsOffline() {
	// 	router.push("/foobar/offline");
	// }

	function handleClearFoobarData() {
		plausibleEvent("foobar", { props: { achievement: "restart" } });
		setFoobarData(initialFoobarData);
		// console.log("cleared");
	}
	if (!unlocked) return <div>LOCKED</div>;

	return (
		<>
			<DocumentHead title="Foobar" noIndex />
			<UnlockedBanner {...{ completedPage }} />
			{/* <ShowCompletedBadges /> */}

			<button
				className="rounded-global border-2 border-solid border-primary bg-background px-6 py-1 text-sm text-foreground transition-[color,background-color] hover:bg-primary hover:text-background"
				onClick={handleClearFoobarData}
			>
				Clear everything and Restart
			</button>

			{/* <SupportSreetamDas /> */}

			{IS_DEV && (
				<pre
					className="mx-0.5 rounded bg-foreground/10 p-6 font-mono text-sm 
		transition-[color,background-color] dark:bg-foreground/20"
				>
					<h2>DEV</h2>
					{JSON.stringify(foobarData, null, 2)}
				</pre>
			)}
			{/* {!terminalVisible && <KonamiWrapper />} */}
			{/* <XMarksTheSpot foobar={"/foobar/devtools"} /> */}

			{/* <ViewsCounter slug="/foobar" /> */}
		</>
	);
};

const UnlockedBanner = ({ completedPage }: FoobarSchrodingerProps) =>
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
