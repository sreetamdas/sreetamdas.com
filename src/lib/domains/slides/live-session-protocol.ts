/**
 * Wire protocol for live slide sessions. Both the browser client and the
 * Durable Object validate these messages, so the shared contract lives outside
 * either adapter.
 */
import { SLIDE_REACTION_EMOJIS } from "./reactions";

export type SlideSessionRole = "master" | "viewer";

/** Trusted role header set by the session API route and read by the Durable Object. */
export const SLIDE_SESSION_ROLE_HEADER = "x-sreetamdas-slide-role";

export type SlideSessionPosition = {
	slide: number;
	step: number;
	updatedAt: number;
};

export type SlidePoll = {
	id: string;
	question: string;
	open: boolean;
	slide: number | null;
	selectedOptionId: string | null;
	options: Array<{
		id: string;
		label: string;
		votes: number;
	}>;
};

export type SlideSessionSnapshot = {
	type: "snapshot";
	position: SlideSessionPosition;
	poll: SlidePoll | null;
	viewers: number;
	masters: number;
};

export type SlideSessionReaction = {
	type: "reaction";
	id: string;
	emoji: string;
	createdAt: number;
};

export type SetSlideMessage = { type: "set-slide"; slide: number; step: number };
export type CreatePollMessage = {
	type: "create-poll";
	question: string;
	options: Array<string>;
	slide?: number | null;
};
export type VoteMessage = { type: "vote"; pollId: string; optionId: string };
export type ClosePollMessage = { type: "close-poll" };
export type ResetPollMessage = { type: "reset-poll" };
export type ReactionMessage = { type: "reaction"; emoji: string };

export type SlideSessionOutgoingMessage =
	| SetSlideMessage
	| CreatePollMessage
	| VoteMessage
	| ClosePollMessage
	| ResetPollMessage
	| ReactionMessage;

export function isSlideSessionSnapshot(value: unknown): value is SlideSessionSnapshot {
	if (typeof value !== "object" || value === null) return false;
	if (!("type" in value) || value.type !== "snapshot") return false;
	if (!("position" in value) || !isPosition(value.position)) return false;
	if (!("poll" in value) || (value.poll !== null && !isPoll(value.poll))) return false;
	return (
		"viewers" in value &&
		"masters" in value &&
		typeof value.viewers === "number" &&
		typeof value.masters === "number"
	);
}

export function isSlideSessionReaction(value: unknown): value is SlideSessionReaction {
	return (
		typeof value === "object" &&
		value !== null &&
		"type" in value &&
		value.type === "reaction" &&
		"id" in value &&
		"emoji" in value &&
		"createdAt" in value &&
		typeof value.id === "string" &&
		typeof value.emoji === "string" &&
		typeof value.createdAt === "number" &&
		SLIDE_REACTION_EMOJIS.some((emoji) => emoji === value.emoji)
	);
}

export function isSetSlideMessage(value: unknown): value is SetSlideMessage {
	return (
		typeof value === "object" &&
		value !== null &&
		"type" in value &&
		value.type === "set-slide" &&
		"slide" in value &&
		"step" in value &&
		isSlideIndex(value.slide) &&
		isSlideIndex(value.step)
	);
}

export function isCreatePollMessage(value: unknown): value is CreatePollMessage {
	return (
		typeof value === "object" &&
		value !== null &&
		"type" in value &&
		value.type === "create-poll" &&
		"question" in value &&
		"options" in value &&
		typeof value.question === "string" &&
		Array.isArray(value.options) &&
		value.options.every((option) => typeof option === "string") &&
		(!("slide" in value) || isPollSlideScope(value.slide))
	);
}

export function isVoteMessage(value: unknown): value is VoteMessage {
	return (
		typeof value === "object" &&
		value !== null &&
		"type" in value &&
		value.type === "vote" &&
		"pollId" in value &&
		"optionId" in value &&
		typeof value.pollId === "string" &&
		typeof value.optionId === "string"
	);
}

export function isClosePollMessage(value: unknown): value is ClosePollMessage {
	return (
		typeof value === "object" && value !== null && "type" in value && value.type === "close-poll"
	);
}

export function isResetPollMessage(value: unknown): value is ResetPollMessage {
	return (
		typeof value === "object" && value !== null && "type" in value && value.type === "reset-poll"
	);
}

export function isReactionMessage(value: unknown): value is ReactionMessage {
	return (
		typeof value === "object" &&
		value !== null &&
		"type" in value &&
		value.type === "reaction" &&
		"emoji" in value &&
		typeof value.emoji === "string" &&
		SLIDE_REACTION_EMOJIS.some((emoji) => emoji === value.emoji)
	);
}

function isPosition(value: unknown): value is SlideSessionPosition {
	return (
		typeof value === "object" &&
		value !== null &&
		"slide" in value &&
		"step" in value &&
		"updatedAt" in value &&
		typeof value.slide === "number" &&
		typeof value.step === "number" &&
		typeof value.updatedAt === "number"
	);
}

function isPoll(value: unknown): value is SlidePoll {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		"question" in value &&
		"open" in value &&
		"slide" in value &&
		"selectedOptionId" in value &&
		"options" in value &&
		typeof value.id === "string" &&
		typeof value.question === "string" &&
		typeof value.open === "boolean" &&
		(value.slide === null || typeof value.slide === "number") &&
		(value.selectedOptionId === null || typeof value.selectedOptionId === "string") &&
		Array.isArray(value.options) &&
		value.options.every(isPollOption)
	);
}

function isPollOption(value: unknown): value is SlidePoll["options"][number] {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		"label" in value &&
		"votes" in value &&
		typeof value.id === "string" &&
		typeof value.label === "string" &&
		typeof value.votes === "number"
	);
}

function isPollSlideScope(value: unknown): value is number | null {
	return value === null || isSlideIndex(value);
}

function isSlideIndex(value: unknown): value is number {
	return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
