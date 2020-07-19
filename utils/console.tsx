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
