import { type SlideSessionPollDefinition } from "@/lib/domains/slides/live-session";

const START_BET_SLIDE_INDEX = 15;
const RENDERING_DIAL_SLIDE_INDEX = 20;

export const tanstackStartLivePolls: Array<SlideSessionPollDefinition> = [
	{
		slide: START_BET_SLIDE_INDEX,
		question: "Have you tried TanStack Start yet?",
		options: ["Yes", "Not yet", "Just here for vibes"],
	},
	{
		slide: RENDERING_DIAL_SLIDE_INDEX,
		question: "Which rendering mode fits your app?",
		options: ["Full SSR", "Data-only", "Client-only"],
	},
];
