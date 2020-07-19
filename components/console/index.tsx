/* eslint-disable no-console */
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
			console.log({ data });
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
				console.log("local data from localforage loaded");
				return;
			}
			console.log("no local data");
			return;
		};
		onMountAsync();

		// @ts-expect-error
		window.hack = () => {
			console.log("Hello there!!");
		};

		doAsyncThings();
		console.log(TS_I_LOVE_JS);
		console.log(
			"Hello! If you see this, DM me on Twitter @_SreetamDas / send me an email: sreetam [at] sreetamdas [dot] com\n\nCheers!"
		);
	}, []);

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
			console.log("new");
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

// const TS_I_LOVE_JS = `
// ========================================================================================
// ========================================================================================
// ====             ========      =======      ==========              =======        =====
// =========  =============          ===          ==============  ===========  ======  ====
// =========  ===========             =             ============  ===========  ============
// =========  ==========                             ===========  ============  ===========
// =========  ==========                             ===========  =============  ==========
// =========  ==========                             ===========  ==============  =========
// =========  ===========                           ============  ===============  ========
// =========  =============                       ==============  ================  =======
// =========  ===============                   ================  =================  ======
// =========  =================               ==================  ==================  =====
// =========  ===================           ============  ======  ===================  ====
// =========  =====================       ==============  ======  ===================  ====
// =========  =======================   =================  =====  ===========  ======  ====
// ====             ================== ===================       =============        =====
// ========================================================================================
// ========================================================================================`;

const TS_I_LOVE_JS = `                                                      
             ///////        ,///////                            
            //       //* ///       //                           
            /          ///         ,/                           
            /*       //   //       //                           
            /////////////////////////                           
       ////  //  //,         //.  //  ////                      
     //       ////   ///////   ////       //                    
    //         //   /////////   //         //                   
     ///      ////   ///////   ////      ///                    
        ///////  */*         //   //////*                       
            //  *///////////////*  //                           
            /*       //   //       //                           
           ./          ///         ./                           
            //       //  ///       //                           
             ///////         ///////                            
`;
