"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { isUndefined } from "lodash-es";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import GlobalNotFound from "@/app/not-found";
import { IS_DEV } from "@/config";
import { Code } from "@/lib/components/Typography";
import { ShowCompletedBadges } from "@/lib/domains/foobar/badges";
import { FOOBAR_FLAGS } from "@/lib/domains/foobar/flags";
import { type FoobarSchrodingerProps, initialFoobarData } from "@/lib/domains/foobar/store";
import { useGlobalStore } from "@/lib/domains/global";
import { useCustomPlausible } from "@/lib/domains/Plausible";
import { useHasMounted } from "@/lib/helpers/hooks";

/**
 * Foobar page, that is only shown once foobar is unlocked
 * @param completed_page foobar page that is being currently accessed
 */
export const FoobarDashboard = ({ completed_page }: FoobarSchrodingerProps) => {
	const router = useRouter();
	const plausibleEvent = useCustomPlausible();
	const { foobar_data, setFoobarData } = useGlobalStore(
		useShallow((state) => ({
			foobar_data: state.foobar_data,
			setFoobarData: state.setFoobarData,
		})),
	);

	function handleUserIsOffline() {
		router.push("/foobar/offline");
	}

	useEffect(() => {
		window.addEventListener("offline", handleUserIsOffline);

		return () => {
			window.removeEventListener("offline", handleUserIsOffline);
		};
	}, []);

	function handleClearFoobarData() {
		plausibleEvent("foobar", { props: { achievement: "restart" } });
		setFoobarData(initialFoobarData);

		// eslint-disable-next-line no-console
		console.log("cleared");
	}

	return (
		<>
			<UnlockedAchievementBanner completed_page={completed_page} />
			{IS_DEV && (
				<pre className="my-5 rounded-global bg-foreground/10 p-6 font-mono text-sm transition-colors dark:bg-foreground/20">
					<h2 className="text-4xl font-bold">DEV</h2>
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
		<h1 className="pb-5 pt-20 text-center text-6xl font-bold leading-normal">
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
				className="rounded-global border-2 border-solid border-primary bg-background px-6 py-1 text-sm text-foreground transition-[color,background-color] hover:bg-primary hover:text-background"
				type="button"
			>
				Clear everything and Restart
			</button>
		</AlertDialogPrimitive.Trigger>
		<AlertDialogPrimitive.Portal>
			<AlertDialogPrimitive.Overlay className="fixed inset-0 bg-slate-950/40 data-[state=open]:animate-overlayShow" />
			<AlertDialogPrimitive.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-global bg-white p-[25px] shadow-[hsl(206_22%_7%/35%)_0px_10px_38px_-10px,hsl(206_22%_7%/20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow">
				<AlertDialogPrimitive.Title className="m-0 text-[17px] font-medium text-slate-950">
					Are you absolutely sure?
				</AlertDialogPrimitive.Title>
				<AlertDialogPrimitive.Description className="mb-5 mt-4 text-[15px] leading-normal text-zinc-500">
					This action cannot be undone.
					<br />
					This will reset your <Code>/foobar</Code> progress.
				</AlertDialogPrimitive.Description>
				<div className="flex justify-end gap-[25px]">
					<AlertDialogPrimitive.Cancel asChild>
						<button
							className="inline-flex h-[35px] items-center justify-center rounded-global bg-zinc-100 px-[15px] font-medium leading-none text-zinc-500 outline-none hover:bg-zinc-200 focus:shadow-[0_0_0_2px] focus:shadow-zinc-300"
							type="button"
						>
							Cancel
						</button>
					</AlertDialogPrimitive.Cancel>
					<AlertDialogPrimitive.Action asChild>
						<button
							className="inline-flex h-[35px] items-center justify-center rounded-global bg-red-100 px-[15px] font-medium leading-none text-red-700 outline-none hover:bg-red-200 focus:shadow-[0_0_0_2px] focus:shadow-red-300"
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
		has_layout
	/>
);

export const FoobarSchrodinger = ({ completed_page }: FoobarSchrodingerProps) => {
	const { unlocked, setFoobarData, completed } = useGlobalStore(
		useShallow((state) => ({
			unlocked: state.foobar_data.unlocked,
			completed: state.foobar_data.completed,
			setFoobarData: state.setFoobarData,
		})),
	);
	const has_mounted = useHasMounted();
	const plausibleEvent = useCustomPlausible();

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
