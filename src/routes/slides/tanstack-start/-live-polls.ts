import { type SlideSessionPollDefinition } from "@/lib/domains/slides/live-session";

const PREMISE_SLIDE_INDEX = 7;
const RENDERING_DIAL_SLIDE_INDEX = 16;

export const tanstackStartLivePolls: Array<SlideSessionPollDefinition> = [
	{
		slide: PREMISE_SLIDE_INDEX,
		question: "Have you tried TanStack Start yet?",
		options: ["Yes", "Not yet", "Just here for vibes"],
	},
	{
		slide: RENDERING_DIAL_SLIDE_INDEX,
		question: "Which rendering knob feels most useful?",
		options: ["Selective SSR", "Deferred hydration", "RSC as data"],
	},
];
