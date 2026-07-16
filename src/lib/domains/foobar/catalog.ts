/**
 * Pure story and progression metadata for Foobar achievements. Persisted clue
 * IDs are resolved against this catalogue so stale or malformed values stay inert.
 */
export const FOOBAR_TIERS = {
	discovery: {
		label: "Warmup / Discovery",
		difficulty: 1,
		description: "The site has started leaving fingerprints.",
	},
	browser: {
		label: "Browser Goblin",
		difficulty: 2,
		description: "Look behind the browser's polite surface.",
	},
	archaeology: {
		label: "Site Archaeology",
		difficulty: 3,
		description: "Wrong turns and old corners still tell stories.",
	},
	protocol: {
		label: "Protocol / Web Weirdness",
		difficulty: 4,
		description: "The web speaks below the page.",
	},
	meta: {
		label: "Meta / Endgame",
		difficulty: 5,
		description: "Read the map as a whole.",
	},
} as const;

export type FoobarTier = keyof typeof FOOBAR_TIERS;

export const FOOBAR_TIER_ORDER: ReadonlyArray<FoobarTier> = [
	"discovery",
	"browser",
	"archaeology",
	"protocol",
	"meta",
];

export const FOOBAR_ACHIEVEMENTS = {
	unlocked: {
		tier: "discovery",
		difficulty: 1,
		completion: { id: "unlocked:completed", note: "You found the first door." },
		hints: [
			{ id: "unlocked:hint:1", text: "The map begins somewhere personal." },
			{
				id: "unlocked:hint:2",
				text: "The console points toward a page about the site's author.",
			},
			{
				id: "unlocked:hint:3",
				text: "Look carefully around /about for a hidden Roman numeral.",
			},
			{ id: "unlocked:hint:4", text: "Find and activate the hidden X on /about." },
		],
	},
	"source-code": {
		tier: "discovery",
		difficulty: 1,
		completion: {
			id: "source-code:completed",
			note: "You found a note beneath the paint.",
		},
		hints: [
			{
				id: "source-code:hint:1",
				text: "Rendered pages hide how they were assembled.",
			},
			{
				id: "source-code:hint:2",
				text: "Ask the browser for the original document, not the Elements panel.",
			},
			{
				id: "source-code:hint:3",
				text: "Use View Page Source and search for foobar.",
			},
			{
				id: "source-code:hint:4",
				text: "Follow the /foobar/source-code path embedded in the page source.",
			},
		],
	},
	headers: {
		tier: "discovery",
		difficulty: 1,
		completion: {
			id: "headers:completed",
			note: "The server spoke before the page did.",
		},
		hints: [
			{
				id: "headers:hint:1",
				text: "The server may be saying more than the page does.",
			},
			{
				id: "headers:hint:2",
				text: "Inspect the response headers for a Foobar page.",
			},
			{ id: "headers:hint:3", text: "Look for the x-foobar response header." },
			{
				id: "headers:hint:4",
				text: "Follow the /foobar/headers value exposed by x-foobar.",
			},
		],
	},
	localforage: {
		tier: "discovery",
		difficulty: 1,
		completion: {
			id: "localforage:completed",
			note: "The browser opened its small box of secrets.",
		},
		hints: [
			{
				id: "localforage:hint:1",
				text: "The browser remembers more than your progress.",
			},
			{
				id: "localforage:hint:2",
				text: "Inspect this site's local storage in developer tools.",
			},
			{ id: "localforage:hint:3", text: "Look for a key named foobar." },
			{
				id: "localforage:hint:4",
				text: "Open the /foobar/localforage path stored under foobar.",
			},
		],
	},
	teapot: {
		tier: "discovery",
		difficulty: 1,
		completion: { id: "teapot:completed", note: "The server refused, but politely." },
		hints: [
			{ id: "teapot:hint:1", text: "Not every machine agrees to make coffee." },
			{
				id: "teapot:hint:2",
				text: "There is a small API route with an unusual HTTP status.",
			},
			{ id: "teapot:hint:3", text: "Ask /api/coffee to brew something." },
			{
				id: "teapot:hint:4",
				text: "Visit /api/coffee, then follow its Foobar clue.",
			},
		],
	},
	devtools: {
		tier: "browser",
		difficulty: 2,
		completion: {
			id: "devtools:completed",
			note: "You looked behind the stage curtain.",
		},
		hints: [
			{
				id: "devtools:hint:1",
				text: "Some props only exist behind the rendered page.",
			},
			{
				id: "devtools:hint:2",
				text: "Inspect the Foobar dashboard with browser developer tools.",
			},
			{
				id: "devtools:hint:3",
				text: "Look for a hidden component or DOM clue near the dashboard.",
			},
			{
				id: "devtools:hint:4",
				text: "Find the clue that points to /foobar/devtools.",
			},
		],
	},
	hack: {
		tier: "browser",
		difficulty: 2,
		completion: { id: "hack:completed", note: "The console opened its trapdoor." },
		hints: [
			{
				id: "hack:hint:1",
				text: "A familiar word has been attached to the browser.",
			},
			{
				id: "hack:hint:2",
				text: "Open the console and inspect functions exposed on window.",
			},
			{ id: "hack:hint:3", text: "Call the function named hack." },
			{
				id: "hack:hint:4",
				text: "Run window.hack() and follow /foobar/hack.",
			},
		],
	},
	offline: {
		tier: "browser",
		difficulty: 2,
		completion: {
			id: "offline:completed",
			note: "The site remembered you after the network left.",
		},
		hints: [
			{ id: "offline:hint:1", text: "What remains when the wire goes quiet?" },
			{
				id: "offline:hint:2",
				text: "Developer tools can simulate losing the network.",
			},
			{
				id: "offline:hint:3",
				text: "Stay on a Foobar page and switch the browser network to Offline.",
			},
			{
				id: "offline:hint:4",
				text: "Trigger the browser's offline event while viewing /foobar.",
			},
		],
	},
	navigator: {
		tier: "browser",
		difficulty: 2,
		completion: {
			id: "navigator:completed",
			note: "You drew enough of the map to be recognized.",
		},
		hints: [
			{ id: "navigator:hint:1", text: "Explorers earn their name by moving." },
			{
				id: "navigator:hint:2",
				text: "The site remembers distinct pages in this browser.",
			},
			{
				id: "navigator:hint:3",
				text: "Visit several different pages across the site.",
			},
			{ id: "navigator:hint:4", text: "Visit at least five unique paths." },
		],
	},
	"easter-egg": {
		tier: "browser",
		difficulty: 2,
		completion: {
			id: "easter-egg:completed",
			note: "A decoration turned out to be a switch.",
		},
		hints: [
			{
				id: "easter-egg:hint:1",
				text: "One ordinary social detail is less ordinary than it looks.",
			},
			{
				id: "easter-egg:hint:2",
				text: "Explore the social links on the About page.",
			},
			{
				id: "easter-egg:hint:3",
				text: "Try the link whose icon suggests an egg-shaped surprise.",
			},
			{
				id: "easter-egg:hint:4",
				text: "Find the hidden social interaction that leads to /foobar/easter-egg.",
			},
		],
	},
	konami: {
		tier: "browser",
		difficulty: 2,
		completion: { id: "konami:completed", note: "An old cheat code still worked here." },
		hints: [
			{ id: "konami:hint:1", text: "Old games taught players a famous sequence." },
			{
				id: "konami:hint:2",
				text: "Use the keyboard sequence commonly called the Konami code.",
			},
			{
				id: "konami:hint:3",
				text: "Begin with up, up, down, down, left, right, left, right.",
			},
			{
				id: "konami:hint:4",
				text: "Enter ↑ ↑ ↓ ↓ ← → ← → B A while the site is focused.",
			},
		],
	},
	error404: {
		tier: "archaeology",
		difficulty: 3,
		completion: { id: "error404:completed", note: "A wrong turn was still a turn." },
		hints: [
			{
				id: "error404:hint:1",
				text: "Maps become interesting at their missing edges.",
			},
			{
				id: "error404:hint:2",
				text: "Ask the site for a page that does not exist.",
			},
			{ id: "error404:hint:3", text: "Reach the site's custom 404 screen." },
			{
				id: "error404:hint:4",
				text: "Visit any nonexistent path and inspect the 404 page.",
			},
		],
	},
	dogs: {
		tier: "archaeology",
		difficulty: 3,
		completion: {
			id: "dogs:completed",
			note: "The guard dogs were friendlier than they looked.",
		},
		hints: [
			{
				id: "dogs:hint:1",
				text: "The wrong-turn page offers a surprisingly friendly detour.",
			},
			{ id: "dogs:hint:2", text: "Read every link on the custom 404 page." },
			{
				id: "dogs:hint:3",
				text: "One link leaves the site to visit award-winning dogs.",
			},
			{
				id: "dogs:hint:4",
				text: "Click the Dog Photographer of the Year link on a 404 page.",
			},
		],
	},
	"dns-txt": {
		tier: "protocol",
		difficulty: 4,
		completion: {
			id: "dns-txt:completed",
			note: "You read the old phonebook beneath the site.",
		},
		hints: [
			{ id: "dns-txt:hint:1", text: "The clue lives below HTTP." },
			{
				id: "dns-txt:hint:2",
				text: "Ask DNS for text attached to the site's domain.",
			},
			{ id: "dns-txt:hint:3", text: "Query TXT records for sreetamdas.com." },
			{
				id: "dns-txt:hint:4",
				text: "Run dig TXT sreetamdas.com and follow the Foobar value.",
			},
		],
	},
	campfire: {
		tier: "browser",
		difficulty: 2,
		completion: {
			id: "campfire:completed",
			note: "Another hunter stepped into the firelight.",
		},
		hints: [
			{ id: "campfire:hint:1", text: "Some discoveries need company." },
			{
				id: "campfire:hint:2",
				text: "The site can notice when more than one hunter is awake.",
			},
			{
				id: "campfire:hint:3",
				text: "Keep Foobar unlocked while another person visits the site.",
			},
			{
				id: "campfire:hint:4",
				text: "Two distinct Foobar-unlocked browsers must be online together.",
			},
		],
	},
	"print-preview": {
		tier: "browser",
		difficulty: 2,
		completion: { id: "print-preview:completed", note: "The paper version kept a secret." },
		hints: [
			{ id: "print-preview:hint:1", text: "Some ink only appears before printing." },
			{ id: "print-preview:hint:2", text: "Ask the browser for a print preview of Foobar." },
			{ id: "print-preview:hint:3", text: "Look for a note that is hidden on screen." },
			{
				id: "print-preview:hint:4",
				text: "Open print preview on /foobar and follow /foobar/print-preview.",
			},
		],
	},
	"paper-trail": {
		tier: "archaeology",
		difficulty: 3,
		completion: { id: "paper-trail:completed", note: "The crawlers left a paper trail." },
		hints: [
			{ id: "paper-trail:hint:1", text: "Machines are given house rules too." },
			{
				id: "paper-trail:hint:2",
				text: "Inspect the site's crawler and security text files.",
			},
			{ id: "paper-trail:hint:3", text: "Read /robots.txt or /.well-known/security.txt." },
			{
				id: "paper-trail:hint:4",
				text: "Follow the note pointing to /foobar/paper-trail.",
			},
		],
	},
	"feed-reader": {
		tier: "archaeology",
		difficulty: 3,
		completion: { id: "feed-reader:completed", note: "You read between the feed lines." },
		hints: [
			{ id: "feed-reader:hint:1", text: "The blog speaks to machines as well as people." },
			{ id: "feed-reader:hint:2", text: "Find the site's RSS feed and inspect its XML." },
			{ id: "feed-reader:hint:3", text: "Search /rss/feed.xml for a Foobar comment." },
			{ id: "feed-reader:hint:4", text: "Follow /foobar/feed-reader from the RSS source." },
		],
	},
	"og-qr": {
		tier: "archaeology",
		difficulty: 3,
		completion: { id: "og-qr:completed", note: "The social card answered a scanner." },
		hints: [
			{ id: "og-qr:hint:1", text: "Shared pages carry a picture most visitors never open." },
			{ id: "og-qr:hint:2", text: "Inspect the site's Open Graph image." },
			{ id: "og-qr:hint:3", text: "Look closely for a small square code in /og-image.png." },
			{ id: "og-qr:hint:4", text: "Scan the QR code and follow /foobar/og-qr." },
		],
	},
	"cookie-jar": {
		tier: "protocol",
		difficulty: 4,
		completion: { id: "cookie-jar:completed", note: "You changed the label on the jar." },
		hints: [
			{ id: "cookie-jar:hint:1", text: "A sealed jar arrives with the response." },
			{ id: "cookie-jar:hint:2", text: "Visit /api/foobar/cookie and inspect its cookie." },
			{ id: "cookie-jar:hint:3", text: "Edit foobar-cookie in browser storage." },
			{
				id: "cookie-jar:hint:4",
				text: "Change foobar-cookie to open-sesame, then reload /api/foobar/cookie.",
			},
		],
	},
	"service-worker": {
		tier: "protocol",
		difficulty: 4,
		completion: { id: "service-worker:completed", note: "A worker replied without the network." },
		hints: [
			{ id: "service-worker:hint:1", text: "An invisible worker watches one unusual request." },
			{
				id: "service-worker:hint:2",
				text: "Inspect registered workers in browser Application tools.",
			},
			{ id: "service-worker:hint:3", text: "Read /foobar-sw.js or fetch its private clue path." },
			{
				id: "service-worker:hint:4",
				text: "After the worker controls the page, fetch /foobar/service-worker-clue.",
			},
		],
	},
	completed: {
		tier: "meta",
		difficulty: 5,
		completion: {
			id: "completed:completed",
			note: "You learned the site's hidden language.",
		},
		hints: [],
	},
} as const;

export type FoobarAchievement = keyof typeof FOOBAR_ACHIEVEMENTS;

export const FOOBAR_TEASERS = {
	unlocked: "The map begins somewhere personal.",
	"source-code": "The paint is not the page.",
	headers: "The server speaks before the document.",
	localforage: "The browser keeps a small box of secrets.",
	teapot: "Some machines refuse to make coffee.",
	devtools: "A prop is waiting behind the stage curtain.",
	hack: "A familiar word is attached to the browser.",
	offline: "See what remains when the wire goes quiet.",
	navigator: "Explorers earn their name by moving.",
	"easter-egg": "One social detail is not what it claims.",
	konami: "Old games taught players a famous rhythm.",
	error404: "Missing edges still belong to the map.",
	dogs: "The wrong-turn page offers a friendly detour.",
	"dns-txt": "A clue lives below HTTP.",
	campfire: "A small fire burns brighter with company.",
	"print-preview": "Not every note is meant for a screen.",
	"paper-trail": "Even crawlers are handed house rules.",
	"feed-reader": "The blog has a voice for machines.",
	"og-qr": "A social card contains more than a picture.",
	"cookie-jar": "A sealed jar arrives with the response.",
	"service-worker": "An invisible worker knows one private path.",
	completed: "Read the whole map as one language.",
} satisfies Record<FoobarAchievement, string>;

type FoobarAchievementMetadata = (typeof FOOBAR_ACHIEVEMENTS)[FoobarAchievement];

export type FoobarClueId =
	| FoobarAchievementMetadata["completion"]["id"]
	| FoobarAchievementMetadata["hints"][number]["id"];

export type FoobarClue = {
	id: FoobarClueId;
	achievement: FoobarAchievement;
	kind: "completion" | "hint";
	text: string;
};

export function isFoobarAchievement(value: unknown): value is FoobarAchievement {
	return typeof value === "string" && Object.hasOwn(FOOBAR_ACHIEVEMENTS, value);
}

export const FOOBAR_REQUIRED_ACHIEVEMENTS: ReadonlyArray<FoobarAchievement> = Object.keys(
	FOOBAR_ACHIEVEMENTS,
)
	.filter(isFoobarAchievement)
	.filter((achievement) => achievement !== "completed");

export function hasCompletedFoobar(completed: ReadonlyArray<FoobarAchievement>) {
	return FOOBAR_REQUIRED_ACHIEVEMENTS.every((achievement) => completed.includes(achievement));
}

export function getFoobarClue(value: unknown): FoobarClue | undefined {
	if (typeof value !== "string") {
		return undefined;
	}

	for (const key of Object.keys(FOOBAR_ACHIEVEMENTS)) {
		if (!isFoobarAchievement(key)) {
			continue;
		}

		const achievement = FOOBAR_ACHIEVEMENTS[key];
		if (achievement.completion.id === value) {
			return {
				id: achievement.completion.id,
				achievement: key,
				kind: "completion",
				text: achievement.completion.note,
			};
		}

		for (const hint of achievement.hints) {
			if (hint.id === value) {
				return { id: hint.id, achievement: key, kind: "hint", text: hint.text };
			}
		}
	}

	return undefined;
}

export function isFoobarClueId(value: unknown): value is FoobarClueId {
	return getFoobarClue(value) !== undefined;
}
