import { useRouter } from "next/router";
import React, { useEffect, PropsWithChildren, ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { IS_DEV } from "@/config";
import { FoobarStoreType, useFoobarStore, FOOBAR_PAGES } from "@/domains/Foobar";
import { migrateLocalForageToZustand } from "@/domains/Foobar/helpers";
import { Space, Center, WrapperForFooter } from "@/styles/layouts";
import { LinkTo } from "@/styles/typography";
import { logConsoleMessages } from "@/utils/console";
import { useHasMounted } from "@/utils/hooks";

function checkIfAllAchievementsAreDone(completed: FoobarStoreType["foobarData"]["completed"]) {
	const allPages = Object.values(FOOBAR_PAGES);
	if (completed.length !== allPages.length) return false;

	return allPages.every((page) => completed.includes(page));
}

function addFoobarToLocalStorage() {
	localStorage.setItem("foobar", "/foobar/localforage");
}

const foobarDataSelector = (state: FoobarStoreType) => ({
	foobarStoreData: state.foobarData,
	setFoobarStoreData: state.setFoobarData,
});

const FoobarWrapper = ({ children }: PropsWithChildren<ReactNode>): JSX.Element => {
	const router = useRouter();
	const hasMounted = useHasMounted();

	const { foobarStoreData, setFoobarStoreData } = useFoobarStore(foobarDataSelector);
	const { completed, visitedPages } = foobarStoreData;

	useEffect(() => {
		async function handleMigration() {
			await migrateLocalForageToZustand("foobar-data");
		}
		handleMigration();

		// Add functions for Foobar badges
		addFoobarToLocalStorage();
		// @ts-expect-error add custom function
		window.hack = () => {
			// eslint-disable-next-line no-console
			console.warn("/foobar/hack");
		};

		if (!IS_DEV) logConsoleMessages();
	}, []);

	useEffect(() => {
		// @ts-expect-error add custom fn
		window.logStatus = () => {
			// eslint-disable-next-line no-console
			console.log("🐶 here's your data:", `\n\n${JSON.stringify(foobarStoreData, null, 2)}`);
		};
	}, [foobarStoreData]);

	useEffect(() => {
		const { asPath: path, pathname } = router;
		let pageName = path;
		if (pathname === "/404") pageName = "/404";

		if (!visitedPages?.includes(pageName)) {
			setFoobarStoreData({
				visitedPages: [...visitedPages, pageName],
			});
		}

		// for the `navigator` achievement
		if (visitedPages.length >= 5 && !completed.includes(FOOBAR_PAGES.navigator)) {
			setFoobarStoreData({
				completed: [...completed, FOOBAR_PAGES.navigator],
			});
		}
	}, [completed, visitedPages, router, setFoobarStoreData]);

	useEffect(() => {
		// for the `completed` achievement
		if (checkIfAllAchievementsAreDone(completed)) {
			setFoobarStoreData({
				allAchievements: true,
			});
		}
	}, [completed, setFoobarStoreData]);

	return (
		<WrapperForFooter>
			{children}
			<Space />
			<Center>
				<Footer />
				<Space size={10} />
				{hasMounted && foobarStoreData.unlocked ? (
					<>
						<code>
							<LinkTo href="/foobar" style={{ border: "none" }}>
								resume /foobar
							</LinkTo>
						</code>
						<Space size={10} />
					</>
				) : null}
			</Center>
		</WrapperForFooter>
	);
};

export { FoobarWrapper };
