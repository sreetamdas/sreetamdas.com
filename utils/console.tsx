import localforage from "localforage";

export const doAsyncThings = async () => {
	await localforage.setItem("Hello", "there!");
};

export const getDataFromLocalForage = async <T extends unknown>(
	key: string
): Promise<T | null> => {
	try {
		return await localforage.getItem(key);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
		throw new Error("no local data in localforage");
	}
};

export const loadLocalDataOnMount = async (): Promise<TFoobarData | null> => {
	const data = await getDataFromLocalForage<TFoobarData>("top_secret");
	return data;
};

export const KONAMI_CODE: Array<React.KeyboardEvent["key"]> = [
	"ArrowUp",
	"ArrowUp",
	"ArrowDown",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"ArrowLeft",
	"ArrowRight",
	"b",
	"a",
];

export const checkIfKonamiCodeEntered = (codes: Array<string>) => {
	const joinedCodes = codes.join(""),
		konamiCodeJoined = KONAMI_CODE.join("");
	return joinedCodes === konamiCodeJoined;
};

export const handleKonami = (
	konamiCodeInput: Array<string>,
	{ konami, updateFoobarDataFromConsumer }: TFoobarContext
) => {
	const check = checkIfKonamiCodeEntered(konamiCodeInput);
	let updatedKonamiCodeInput: Array<string> | null = null;

	if (check) updateFoobarDataFromConsumer({ konami: !konami });
	else {
		if (konamiCodeInput.length > 10) {
			updatedKonamiCodeInput = [...konamiCodeInput];
			updatedKonamiCodeInput.shift();
		}
	}

	return updatedKonamiCodeInput;
};

export const logConsoleMessages = () => {
	// eslint-disable-next-line no-console
	console.log(
		`%c${CONSOLE_REACT}`,
		`color: #61DAFB;
		font-weight: bold;
		font-size: 1.1em;
		background-color: black;
		line-height: 1.1`
	);
	// eslint-disable-next-line no-console
	console.log(
		`         %c${CONSOLE_GREETING}`,
		"font-size: 1.5em; font-family: monospace; font-weight: bold;"
	);
	// eslint-disable-next-line no-console
	console.log(
		`%c${CONSOLE_MESSAGE}`,
		"font-size: 1.1em; font-family: monospace"
	);
};

type TCustomLogMessages = Array<any>;

/**
 * `dog`: development-only `console.log`
 * @param messages to be logged only during dev
 */
export const dog = (...messages: TCustomLogMessages) => {
	// eslint-disable-next-line no-console
	process.env.NODE_ENV === "development" && console.log(...messages);
};

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

const CONSOLE_REACT = `
                                           
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

const CONSOLE_GREETING = "Hello Beautiful Nerd!";
const CONSOLE_MESSAGE = `
You're one of those people who checks consoles, eh? I like you!

Up for geeking out some more?
I've setup some top-secret pages on here, see if you can catch 'em all!

If you complete them all, lemme know, bouquets and brickbats alike :)
To start, how /about you get to know me better?


Cheers, Good Luck, and most importantly, Have Fun!`;
