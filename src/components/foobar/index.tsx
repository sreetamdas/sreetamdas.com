import { useRouter } from "next/router";
import React, { useEffect, PropsWithChildren, Fragment, ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { FoobarStoreType, useFoobarStore } from "@/domains/Foobar";
import { Space, Center, WrapperForFooter } from "@/styles/layouts";
import { LinkTo } from "@/styles/typography";
import { TFoobarData, FOOBAR_PAGES } from "@/typings/console";
import { doAsyncThings, logConsoleMessages, IS_DEV } from "@/utils/console";

export const initialFoobarData: TFoobarData = {
	visitedPages: [],
	konami: false,
	unlocked: false,
	completed: [],
	allAchievements: false,
};

function checkIfAllAchievementsAreDone({ completed }: TFoobarData) {
	const allPages = Object.values(FOOBAR_PAGES);
	if (completed.length !== allPages.length) return false;

	return allPages.every((page) => completed.includes(page));
}

const foobarDataSelector = (state: FoobarStoreType) => ({
	foobarStoreData: state.foobarData,
	setFoobarStoreData: state.setFoobarData,
});

const FoobarWrapper = ({ children }: PropsWithChildren<ReactNode>): JSX.Element => {
	const router = useRouter();

	const { foobarStoreData, setFoobarStoreData } = useFoobarStore(foobarDataSelector);

	useEffect(() => {
		// @ts-expect-error add custom function
		window.hack = () => {
			// eslint-disable-next-line no-console
			console.warn("/foobar/hack");
		};

		doAsyncThings();
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

		if (!foobarStoreData.visitedPages?.includes(pageName)) {
			setFoobarStoreData({
				visitedPages: [...foobarStoreData.visitedPages, pageName],
			});
		}

		// for the `navigator` achievement
		if (
			foobarStoreData.visitedPages.length >= 5 &&
			!foobarStoreData.completed.includes(FOOBAR_PAGES.navigator)
		) {
			setFoobarStoreData({
				completed: [...foobarStoreData.completed, FOOBAR_PAGES.navigator],
			});
		}
	}, [foobarStoreData.completed, foobarStoreData.visitedPages, router, setFoobarStoreData]);

	useEffect(() => {
		// for the `completed` achievement
		if (checkIfAllAchievementsAreDone(foobarStoreData)) {
			setFoobarStoreData({
				allAchievements: true,
			});
		}
	}, [foobarStoreData, setFoobarStoreData]);

	return (
		<WrapperForFooter>
			{children}
			<Space />
			<Center>
				<Footer />
				<Space size={10} />
				{foobarStoreData.unlocked && (
					<Fragment>
						<code>
							<LinkTo href="/foobar" style={{ border: "none" }}>
								resume /foobar
							</LinkTo>
						</code>
						<Space size={10} />
					</Fragment>
				)}
			</Center>
		</WrapperForFooter>
	);
};

export { FoobarWrapper };
