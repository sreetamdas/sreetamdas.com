"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { isUndefined } from "lodash-es";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import GlobalNotFound from "@/app/not-found";
import { IS_DEV } from "@/config";
import { Code } from "@/lib/components/Typography";
import { useCustomPlausible } from "@/lib/domains/Plausible";
import { ShowCompletedBadges } from "@/lib/domains/foobar/badges";
import { FOOBAR_FLAGS } from "@/lib/domains/foobar/flags";
import { type FoobarSchrodingerProps, initialFoobarData } from "@/lib/domains/foobar/store";
import { useGlobalStore } from "@/lib/domains/global";
import { useHasMounted } from "@/lib/helpers/hooks";

/**
 * Foobar page, that is only shown once foobar is unlocked
 * @param completed_page foobar page that is being currently accessed
 */
export const FoobarDashboard = ({ completed_page }: FoobarSchrodingerProps) => {
	const router = useRouter();
	const plausibleEvent = useCustomPlausible();
	const { foobar_data, setFoobarData } = useGlobalStore((state) => ({
		foobar_data: state.foobar_data,
		setFoobarData: state.setFoobarData,
	}));

	function handleUserIsOffline() {
		// TODO look into typedRoutes not working properly
		router.push("/foobar/offline" as Route);
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: needed
	useEffect(() => {
		window.addEventListener("offline", handleUserIsOffline);

		return () => {
			window.removeEventListener("offline", handleUserIsOffline);
		};
	}, []);

	function handleClearFoobarData() {
		plausibleEvent("foobar", { props: { achievement: "restart" } });
		setFoobarData(initialFoobarData);
		// biome-ignore lint/suspicious/noConsoleLog: needed
		console.log("cleared");
	}

	return (
		<>
			<UnlockedAchievementBanner completed_page={completed_page} />
			{IS_DEV && (
				<pre className="my-5 rounded-global bg-foreground/10 p-6 font-mono text-sm transition-colors dark:bg-foreground/20">
					<h2 className="font-bold text-4xl">DEV</h2>
					{JSON.stringify(foobar_data, null, 2)}
				</pre>
			)}
			<ShowCompletedBadges
				completed={foobar_data.completed}
				all_achievements={foobar_data.all_achievements}
			/>
			<ResetFoobar handleClearFoobarData={handleClearFoobarData} />
			{/* <Center>
				<SupportSreetamDas />
			</Center> */}
			{/* <Terminal {...{ visible: terminalVisible, toggleTerminal }} /> */}
			{/* {!terminalVisible && <KonamiWrapper />} */}
			<XMarksTheSpot foobar="/foobar/devtools" />
		</>
	);
};

const UnlockedAchievementBanner = ({ completed_page }: FoobarSchrodingerProps) =>
	completed_page && completed_page !== "/" ? (
		<h1 className="pt-20 pb-5 text-center font-bold text-6xl leading-normal">
			— You&apos;ve unlocked —
			<br />
			<span role="img" aria-label="sparkle">
				✨
			</span>{" "}
			<Code className="text-5xl">{completed_page}</Code>{" "}
			<span role="img" aria-label="sparkle">
				✨
			</span>
		</h1>
	) : null;

const XMarksTheSpot = (_: { foobar: string }) => null;

const ResetFoobar = ({ handleClearFoobarData }: { handleClearFoobarData: () => void }) => (
	<AlertDialogPrimitive.Root>
		<AlertDialogPrimitive.Trigger asChild>
			<button
				className="rounded-global border-2 border-primary border-solid bg-background px-6 py-1 text-foreground text-sm transition-[color,background-color] hover:bg-primary hover:text-background"
				type="button"
			>
				Clear everything and Restart
			</button>
		</AlertDialogPrimitive.Trigger>
		<AlertDialogPrimitive.Portal>
			<AlertDialogPrimitive.Overlay className="fixed inset-0 bg-slate-950/40 data-[state=open]:animate-overlayShow" />
			<AlertDialogPrimitive.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-global bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow">
				<AlertDialogPrimitive.Title className="m-0 font-medium text-[17px] text-slate-950">
					Are you absolutely sure?
				</AlertDialogPrimitive.Title>
				<AlertDialogPrimitive.Description className="mt-4 mb-5 text-[15px] text-zinc-500 leading-normal">
					This action cannot be undone.
					<br />
					This will reset your <Code>/foobar</Code> progress.
				</AlertDialogPrimitive.Description>
				<div className="flex justify-end gap-[25px]">
					<AlertDialogPrimitive.Cancel asChild>
						<button
							className="inline-flex h-[35px] items-center justify-center rounded-global bg-zinc-100 px-[15px] font-medium text-zinc-500 leading-none outline-none hover:bg-zinc-200 focus:shadow-[0_0_0_2px] focus:shadow-zinc-300"
							type="button"
						>
							Cancel
						</button>
					</AlertDialogPrimitive.Cancel>
					<AlertDialogPrimitive.Action asChild>
						<button
							className="inline-flex h-[35px] items-center justify-center rounded-global bg-red-100 px-[15px] font-medium text-red-700 leading-none outline-none hover:bg-red-200 focus:shadow-[0_0_0_2px] focus:shadow-red-300"
							onClick={handleClearFoobarData}
							type="button"
						>
							Yes, delete account
						</button>
					</AlertDialogPrimitive.Action>
				</div>
			</AlertDialogPrimitive.Content>
		</AlertDialogPrimitive.Portal>
	</AlertDialogPrimitive.Root>
);

const FoobarButLocked = () => (
	<GlobalNotFound
		message={<p className="pt-5 text-center text-xs">psst, you should check the console!</p>}
	/>
);

export const FoobarSchrodinger = ({ completed_page }: FoobarSchrodingerProps) => {
	const { unlocked, setFoobarData, completed } = useGlobalStore((state) => ({
		unlocked: state.foobar_data.unlocked,
		completed: state.foobar_data.completed,
		setFoobarData: state.setFoobarData,
	}));
	const has_mounted = useHasMounted();
	const plausibleEvent = useCustomPlausible();

	// biome-ignore lint/correctness/useExhaustiveDependencies: needed
	useEffect(() => {
		if (completed_page) {
			const completed_flag = Object.values(FOOBAR_FLAGS).find((flag_props) => {
				if ("slug" in flag_props) {
					return flag_props.slug === completed_page;
				}
				return false;
			})?.name;

			if (!isUndefined(completed_flag) && !completed?.includes(completed_flag)) {
				plausibleEvent("foobar", { props: { achievement: completed_flag } });
				setFoobarData({
					completed: completed.concat([completed_flag]),
				});
			}
		}
	}, [completed, completed_page]);

	if (!has_mounted) return null;
	if (!unlocked) return <FoobarButLocked />;

	return <FoobarDashboard completed_page={completed_page} />;
};
