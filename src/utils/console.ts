import { IS_DEV } from "@/config";

export function logConsoleMessages() {
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
		`        %c${CONSOLE_GREETING}`,
		"font-size: 1.5em; font-family: monospace; font-weight: bold;"
	);
	// eslint-disable-next-line no-console
	console.log(`%c${CONSOLE_MESSAGE}`, "font-size: 1.1em; font-family: monospace");

	// eslint-disable-next-line no-console
	console.groupCollapsed("need a hint?");
	// eslint-disable-next-line no-console
	console.log(`%c${CONSOLE_X}`, "font-family: monospace");
	// eslint-disable-next-line no-console
	console.groupEnd();

	dog("Hello", "there!");
}

/**
 * `dog`: development-only `console.log`
 * @param messages to be logged only during dev
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dog(...messages: Array<any>): void {
	if (IS_DEV) {
		// eslint-disable-next-line no-console
		console.log(
			"%cdev%c🐶",
			`font-family: monospace;
			color: indianred;
			background-color: #eee;
			border-radius: 2px;
			padding: 2px;
			margin-right: 2px;
			font-size: 1.1em`,
			`font-family: unset;
			color: unset;
			background-color: unset;
			border: unset
			font-size: 1.2em`,
			...messages
		);
	}
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

If you complete them all, lemme know, bouquets and brickbats alike :)
To start, how /about you get to know me better?


Cheers, Good Luck, and most importantly, Have Fun!`;
const CONSOLE_X = `storytime!

I loved playing video games since I was a kid, and one of my all time favorites was Age of Empires III. Sometimes (read: almost every single time) when I'd get stuck or was at a disadvantages against NPCs, I'd just go ahead and use the inbuilt cheats! (remember Medium Rare Please?)

Anyway, cheats might not work (yet) on here, but "revealing the map" will guide you to what you seek :D


Please don't hesitate reaching out for more hints!
`;
