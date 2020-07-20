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
} from "utils/console";

const initialData: TFoobarData = {
	visited: false,
	visitedPages: [],
	konami: false,
};

export const FoobarContext = createContext<Partial<TFoobarContext>>({});

const Console = ({ children }: PropsWithChildren<{}>): JSX.Element => {
	const router = useRouter();
	const [foobarData, setFoobarData] = useState<TFoobarData>(initialData);
	const [konamiCodeInput, setKonamiCodeInput] = useState<Array<string>>([]);

	const updateFoobarDataFromConsumer = useCallback(
		(data: Partial<TFoobarData>) => {
			setFoobarData((prevState) => ({ ...prevState, ...data }));
		},
		[]
	);
	const getFoobarContextValue = {
		...foobarData,
		updateFoobarDataFromConsumer,
	};

	useEffect(() => {
		const onMountAsync = async () => {
			const dataFromLocalForage = await loadLocalDataOnMount();
			if (dataFromLocalForage !== null) {
				setFoobarData(dataFromLocalForage);
				return;
			}
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
		// @ts-expect-error
		window.logStatus = () => {
			// eslint-disable-next-line no-console
			console.log(
				"🐶 here's your data:",
				`\n\n${JSON.stringify(foobarData, null, 2)}`
			);
		};
	}, [foobarData]);

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

		if (!foobarData.visitedPages.includes(pathname)) {
			if (asPath !== "/404") {
				setFoobarData({
					...foobarData,
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
