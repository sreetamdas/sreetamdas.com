import { FoobarStoreType, FOOBAR_PAGES } from "./";

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

export function checkIfKonamiCodeEntered(codes: Array<string>) {
	const joinedCodes = codes.join(""),
		konamiCodeJoined = KONAMI_CODE.join("");
	return joinedCodes === konamiCodeJoined;
}

export function handleKonami(
	konamiCodeInput: Array<string>,
	{
		foobarData: { konami, unlocked, completed },
		setFoobarData,
	}: {
		foobarData: Pick<FoobarStoreType["foobarData"], "completed" | "konami" | "unlocked">;
	} & Pick<FoobarStoreType, "setFoobarData">
) {
	const didInputKonamiCode = unlocked && checkIfKonamiCodeEntered(konamiCodeInput);
	let updatedKonamiCodeInput: Array<string> | null = null;

	if (didInputKonamiCode) {
		const completedCopy = [...completed];
		completedCopy.push(FOOBAR_PAGES.konami);
		setFoobarData({
			konami: !konami,
			completed: completedCopy,
		});
	} else {
		if (konamiCodeInput.length > 10) {
			updatedKonamiCodeInput = [...konamiCodeInput];
			updatedKonamiCodeInput.shift();
		}
	}

	return updatedKonamiCodeInput;
}
