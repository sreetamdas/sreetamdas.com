/**
 * Browser-only helpers for /foobar clues and completion checks. These functions
 * intentionally touch localStorage and the console, so keep callers inside
 * client components/effects.
 */
import { FOOBAR_FLAGS } from "@/lib/domains/foobar/flags";

import { type FoobarSliceType } from "./store";

export function checkIfAllAchievementsAreDone(
	completed: FoobarSliceType["foobar_data"]["completed"],
) {
	const all_navigable_flag_pages = Object.values(FOOBAR_FLAGS).flatMap((challenge_obj) => {
		if ("slug" in challenge_obj) {
			return challenge_obj.name;
		}
		return [];
	});

	return all_navigable_flag_pages.every((page) => completed.includes(page));
}

export function addFoobarToLocalStorage() {
	localStorage.setItem("foobar", "/foobar/localforage");
}

export function logConsoleMessages() {
	// eslint-disable-next-line no-console
	console.log(
		`%c${CONSOLE_REACT}`,
		`color: #61DAFB;
		font-weight: bold;
		font-size: 1.1em;
		background-color: black;
		line-height: 1.1`,
	);
	// eslint-disable-next-line no-console
	console.log(
		`        %c${CONSOLE_GREETING}`,
		"font-size: 1.5em; font-family: monospace; font-weight: bold;",
	);

	// eslint-disable-next-line no-console
	console.log(`%c${CONSOLE_MESSAGE}`, "font-size: 1.1em; font-family: monospace");

	// eslint-disable-next-line no-console
	console.groupCollapsed("Need a hint?");
	// eslint-disable-next-line no-console
	console.log(`%c${CONSOLE_X}`, "font-family: monospace");

	// eslint-disable-next-line no-console
	console.groupCollapsed("Need a another hint?");
	// eslint-disable-next-line no-console
	console.log(
		`%c${CONSOLE_X2}`,
		"font-family: monospace",
		"font-weight: bold; font-size: 1.5em;",
		"font-weight: normal; font-size: unset;",
	);

	// eslint-disable-next-line no-console
	console.groupCollapsed("Need some more help?");
	// eslint-disable-next-line no-console
	console.groupCollapsed("Are you sure?\n\n\nTo confirm, you'll need to open this disclosure 👀");
	// eslint-disable-next-line no-console
	console.log(`%c${CONSOLE_X3}`, "font-family: monospace");
	// eslint-disable-next-line no-console
	console.groupEnd();
	// eslint-disable-next-line no-console
	console.groupEnd();
	// eslint-disable-next-line no-console
	console.groupEnd();
	// eslint-disable-next-line no-console
	console.groupEnd();
}

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
You like checking consoles, eh? I like you!

Up for geeking out some more?
I've setup some top-secret pages on here, see if you can catch 'em all!

If you complete them all, lemme know! :)
To start, how /about you get to know me better?


Cheers, Good Luck, and most importantly, Have Fun!`;
const CONSOLE_X = `storytime!

I loved playing video games since I was a kid, and one of my all time favorites was Age of Empires III. Sometimes (read: almost every single time) when I'd get stuck (or was at a disadvantage against NPCs LOL), I'd just go ahead and use the inbuilt cheats!

Anyway, cheats might not work (yet) on here, but "revealing the map" will guide you to what you seek :)

`;
const CONSOLE_X2 = `
The cheat code for "revealing the map" in Age of Empires III was:

%cX marks the spot%c

And that's your clue!
`;
const CONSOLE_X3 = `
Go to /about and look around for the hidden Ⅹ 😉
`;

export const FOOBAR_SOURCE_CODE = `

/**


████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████888████888██████████888█888█████████████████████████████████████████████
████888████888██████████888█888█████████████████████████████████████████████
████888████888██████████888█888█████████████████████████████████████████████
████8888888888██.d88b.██888█888██.d88b.█████████████████████████████████████
████888████888█d8P██Y8b█888█888█d88""88b████████████████████████████████████
████888████888█88888888█888█888█888██888████████████████████████████████████
████888████888█Y8b.█████888█888█Y88..88P████████████████████████████████████
████888████888██"Y8888██888█888██"Y88P"█████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████888888b.██████████████████████████████888████d8b██.d888██████████888████
████888██"88b█████████████████████████████888████Y8P█d88P"███████████888████
████888██.88P█████████████████████████████888████████888█████████████888████
████8888888K.███.d88b.███8888b.██888██888█888888█888█888888█888██888█888████
████888██"Y88b█d8P██Y8b█████"88b█888██888█888████888█888████888██888█888████
████888████888█88888888█.d888888█888██888█888████888█888████888██888█888████
████888███d88P█Y8b.█████888██888█Y88b█888█Y88b.██888█888████Y88b█888█888████
████8888888P"███"Y8888██"Y888888██"Y88888██"Y888█888█888█████"Y88888█888████
████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████888b████888███████████████████████888██888██████████████████████████████
████8888b███888███████████████████████888██888██████████████████████████████
████88888b██888███████████████████████888██888██████████████████████████████
████888Y88b█888██.d88b.██888d888██.d88888██888██████████████████████████████
████888█Y88b888█d8P██Y8b█888P"███d88"█888██888██████████████████████████████
████888██Y88888█88888888█888█████888██888██Y8P██████████████████████████████
████888███Y8888█Y8b.█████888█████Y88b█888███████████████████████████████████
████888████Y888██"Y8888██888██████"Y88888██888██████████████████████████████
████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████(...and robots)█████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████                                               █████████████████████████
████  Welcome to my corner of the internet!        █████████████████████████
████                                               █████████████████████████
████  Here's what you might be looking for:        █████████████████████████
████  /foobar/source-code                          █████████████████████████
████                                               █████████████████████████
████                                               █████████████████████████
████  psst. you might wanna check the console ;)   █████████████████████████
████                                               █████████████████████████
████  GLHF!                                        █████████████████████████
████                                               █████████████████████████
████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████


*/
`;
