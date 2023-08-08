/* eslint-disable no-console */

export function logConsoleMessages() {
	console.log(
		`%c${CONSOLE_REACT}`,
		`color: #61DAFB;
		font-weight: bold;
		font-size: 1.1em;
		background-color: black;
		line-height: 1.1`,
	);
	console.log(
		`        %c${CONSOLE_GREETING}`,
		"font-size: 1.5em; font-family: monospace; font-weight: bold;",
	);

	console.log(`%c${CONSOLE_MESSAGE}`, "font-size: 1.1em; font-family: monospace");

	console.groupCollapsed("Need a hint?");
	console.log(`%c${CONSOLE_X}`, "font-family: monospace");

	console.groupCollapsed("Need a another hint?");
	console.log(
		`%c${CONSOLE_X2}`,
		"font-family: monospace",
		"font-weight: bold; font-size: 1.5em;",
		"font-weight: normal; font-size: unset;",
	);

	console.groupCollapsed("Need some more help?");
	console.groupCollapsed("Are you sure?\n\n\nTo confirm, you'll need to open this disclosure 👀");
	console.log(`%c${CONSOLE_X3}`, "font-family: monospace");

	console.groupEnd();
	console.groupEnd();
	console.groupEnd();
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

I loved playing video games since I was a kid, and one of my all time favorites was Age of Empires III. Sometimes (read: almost every single time) when I'd get stuck (or was at a disadvantage against NPCs LOL), I'd just go ahead and use the inbuilt cheats! (remember Medium Rare Please?)

Anyway, cheats might not work (yet) on here, but "revealing the map" will guide you to what you seek :D

`;
const CONSOLE_X2 = `
The cheat code for "revealing the map" in Age of Empires III was:

%cX marks the spot%c

And that's your clue!
`;
const CONSOLE_X3 = `
Go to /about and look around for the hidden Ⅹ 😉
`;
