import { useRouter } from "next/router";
import React, {
	useEffect,
	useState,
	PropsWithChildren,
	createContext,
	useCallback,
	Fragment,
	ReactNode,
} from "react";

import { Footer } from "components/Footer";
import { Space, Center, WrapperForFooter } from "styles/layouts";
import { LinkTo } from "styles/typography";
import { TFoobarData, TFoobarContext, FOOBAR_PAGES } from "typings/console";
import {
	doAsyncThings,
	loadLocalDataOnMount,
	logConsoleMessages,
	updateLocalData,
	mergeLocalDataIntoStateOnMount,
	mergeDeep,
	IS_DEV,
} from "utils/console";

export const initialFoobarData: TFoobarData = {
	visitedPages: [],
	konami: false,
	unlocked: false,
	completed: [],
	allAchievements: false,
};

// we're gonna hydrate this just below, and <FoobarWrapper /> wraps the entire usable DOM anyway
export const FoobarContext = createContext<TFoobarContext>(
	{} as TFoobarContext
);

const checkIfAllAchievementsAreDone = ({ completed }: TFoobarData) => {
	const allPages = Object.values(FOOBAR_PAGES);
	if (completed.length !== allPages.length) return false;

	return allPages.every((page) => completed.includes(page));
};

const FoobarWrapper = ({
	children,
}: PropsWithChildren<ReactNode>): JSX.Element => {
	const router = useRouter();
	const [dataLoaded, setDataLoaded] = useState(false);
	const [foobarData, setFoobarData] =
		useState<typeof initialFoobarData>(initialFoobarData);

	const updateFoobarDataPartially = useCallback(
		(data: Partial<TFoobarData>, mergeManually = false) => {
			setFoobarData((prevState) => {
				let final: TFoobarData;
				const temp = { ...prevState };
				if (mergeManually)
					final = mergeLocalDataIntoStateOnMount(temp, data as TFoobarData);
				else final = mergeDeep(temp, data);
				return final;
			});
		},
		[]
	);
	const getFoobarContextValue = {
		...foobarData,
		dataLoaded,
		updateFoobarDataPartially,
	};

	useEffect(() => {
		const onMountAsync = async () => {
			const dataFromLocalForage = await loadLocalDataOnMount();
			if (dataFromLocalForage !== null) {
				updateFoobarDataPartially(dataFromLocalForage, true);
				setDataLoaded(true);
				return;
			}
			setDataLoaded(true);
			return;
		};
		onMountAsync();

		// @ts-expect-error add custom function
		window.hack = () => {
			// eslint-disable-next-line no-console
			console.warn("/foobar/hack");
		};

		doAsyncThings();
		!IS_DEV && logConsoleMessages();
	}, [updateFoobarDataPartially]);

	useEffect(() => {
		if (dataLoaded) updateLocalData(foobarData);
		// @ts-expect-error add custom fn
		window.logStatus = () => {
			// eslint-disable-next-line no-console
			console.log(
				"🐶 here's your data:",
				`\n\n${JSON.stringify(foobarData, null, 2)}`
			);
		};
	}, [foobarData, dataLoaded]);

	useEffect(() => {
		const { asPath: path, pathname } = router;
		let pageName = path;
		if (pathname === "/404") pageName = "/404";

		if (!foobarData.visitedPages?.includes(pageName)) {
			updateFoobarDataPartially({
				visitedPages: [...foobarData.visitedPages, pageName],
			});
		}

		// for the `navigator` achievement
		if (
			foobarData.visitedPages.length >= 5 &&
			!foobarData.completed.includes(FOOBAR_PAGES.navigator)
		) {
			updateFoobarDataPartially({
				completed: [...foobarData.completed, FOOBAR_PAGES.navigator],
			});
		}
	}, [
		foobarData.completed,
		foobarData.visitedPages,
		router,
		updateFoobarDataPartially,
	]);

	useEffect(() => {
		// for the `completed` achievement
		if (checkIfAllAchievementsAreDone(foobarData)) {
			updateFoobarDataPartially({
				allAchievements: true,
			});
		}
	}, [foobarData, updateFoobarDataPartially]);

	return (
		<FoobarContext.Provider value={getFoobarContextValue}>
			<WrapperForFooter>
				{children}
				<Space />
				<Center>
					<Footer />
					<Space size={10} />
					{foobarData.unlocked && (
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
		</FoobarContext.Provider>
	);
};

export { FoobarWrapper };
