/* eslint-disable no-console */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
	doAsyncThings,
	loadLocalDataOnMount,
	checkIfKonamiCodeEntered,
} from "utils/console";

const initialData: TLocalData = {
	visited: false,
	visitedPages: [],
	konami: false,
};

const Console = () => {
	const router = useRouter();
	const [localData, setLocalData] = useState<TLocalData>(initialData);
	const [konamiCodeInput, setKonamiCodeInput] = useState<Array<string>>([]);

	useEffect(() => {
		const onMountAsync = async () => {
			const dataFromLocalForage = await loadLocalDataOnMount();
			if (dataFromLocalForage !== null) {
				setLocalData(dataFromLocalForage);
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
		const check = checkIfKonamiCodeEntered(konamiCodeInput);

		if (check) console.log("konami!");
		else {
			if (konamiCodeInput.length > 10) {
				const updatedKonamiCodeInput = [...konamiCodeInput];
				updatedKonamiCodeInput.shift();
				setKonamiCodeInput(updatedKonamiCodeInput);
			}
		}
	}, [konamiCodeInput]);

	const OnEveryReRender = () => {
		const { pathname, asPath } = router;

		if (!localData.visitedPages.includes(pathname)) {
			console.log("new");
			if (asPath !== "/404") {
				setLocalData({
					...localData,
					visitedPages: [...localData.visitedPages, pathname],
				});
			}
		}
	};

	return null;
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
