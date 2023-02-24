"use client";

import { useCustomPlausible } from "@/lib/domains/Plausible";
import { DocumentHead } from "@/lib/domains/SEO";
import { ViewsCounter } from "@/lib/domains/Supabase";
import { FoobarSchrodingerProps, initialFoobarData } from "@/lib/domains/foobar/flags";
import { useBoundStore } from "@/lib/domains/global";

export const FoobarDashboard = ({ completedPage }: FoobarSchrodingerProps) => {
	// const router = useRouter();
	const plausibleEvent = useCustomPlausible();
	const { foobarData, setFoobarData } = useBoundStore((state) => ({
		foobarData: state.foobarData,
		setFoobarData: state.setFoobarData,
	}));

	// function handleUserIsOffline() {
	// 	router.push("/foobar/offline");
	// }

	function handleClearFoobarData() {
		plausibleEvent("foobar", { props: { achievement: "restart" } });
		setFoobarData(initialFoobarData);
		// console.log("cleared");
	}

	return (
		<>
			<DocumentHead title="Foobar" noIndex />
			<UnlockedBanner {...{ completedPage }} />
			{/* <ShowCompletedBadges /> */}

			<button onClick={handleClearFoobarData}>Clear everything and Restart</button>

			{/* <SupportSreetamDas /> */}

			{process.env.NODE_ENV === "development" && (
				<pre>
					<h2>DEV</h2>
					{JSON.stringify(foobarData, null, 2)}
				</pre>
			)}
			{/* {!terminalVisible && <KonamiWrapper />} */}
			{/* <XMarksTheSpot foobar={"/foobar/devtools"} /> */}
			{/* @ts-expect-error async Server Component */}
			<ViewsCounter slug="/foobar" />
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
