import {
	useEffect,
	useState,
	PropsWithChildren,
	createContext,
	useCallback,
} from "react";
import { useRouter } from "next/router";
import {
	doAsyncThings,
	loadLocalDataOnMount,
	handleKonami,
	logConsoleMessages,
	updateLocalData,
} from "utils/console";

export const initialFoobarData: TFoobarData = {
	visitedPages: [],
	unlocked: false,
};

// we're gonna hydrate this just below, and <Console /> wraps the entire usable DOM anyway
export const FoobarContext = createContext<TFoobarContext>(
	{} as TFoobarContext
);

const Console = ({ children }: PropsWithChildren<{}>): JSX.Element => {
	const router = useRouter();
	const [dataLoaded, setDataLoaded] = useState(false);
	const [foobarData, setFoobarData] = useState<typeof initialFoobarData>(
		initialFoobarData
	);
	const [konamiCodeInput, setKonamiCodeInput] = useState<Array<string>>([]);

	const updateFoobarDataPartially = useCallback(
		(data: Partial<TFoobarData>) => {
			setFoobarData((prevState) => ({ ...prevState, ...data }));
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
				setFoobarData(dataFromLocalForage);
				setDataLoaded(true);
				return;
			}
			setDataLoaded(true);
			return;
		};
		onMountAsync();

		// @ts-expect-error
		window.hack = () => {
			// eslint-disable-next-line no-console
			console.log("Hello there!!");
		};

		doAsyncThings();
		logConsoleMessages();
	}, []);
	useEffect(() => {
		dataLoaded && updateLocalData(foobarData);
		// @ts-expect-error
		window.logStatus = () => {
			// eslint-disable-next-line no-console
			console.log(
				"🐶 here's your data:",
				`\n\n${JSON.stringify(foobarData, null, 2)}`
			);
		};
	}, [foobarData, dataLoaded]);

	const handleKonamiCode = (event: KeyboardEvent) => {
		setKonamiCodeInput((konamiCodeInput) => [
			...konamiCodeInput,
			event.key,
		]);
	};
	useEffect(() => {
		window.addEventListener("keydown", handleKonamiCode);

		return () => window.removeEventListener("keydown", handleKonamiCode);
	}, []);

	useEffect(() => {
		OnEveryReRender();
	});
	useEffect(() => {
		const updated = handleKonami(konamiCodeInput, getFoobarContextValue);
		if (updated) setKonamiCodeInput(updated);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [konamiCodeInput]);

	const OnEveryReRender = () => {
		const { pathname, asPath } = router;

		if (!foobarData.visitedPages?.includes(pathname)) {
			if (asPath !== "/404") {
				updateFoobarDataPartially({
					visitedPages: [...foobarData.visitedPages, pathname],
				});
			}
		}
	};

	return (
		<FoobarContext.Provider value={getFoobarContextValue}>
			{children}
		</FoobarContext.Provider>
	);
};

export { Console };
