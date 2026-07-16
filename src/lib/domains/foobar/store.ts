/**
 * Foobar state slice persisted by the global Zustand store. Updates are partial
 * and merged into the existing progress object so achievement effects can mark
 * one field without replacing the rest of the player's local progress.
 */
import { type StateCreator } from "zustand";

import {
	FOOBAR_ACHIEVEMENTS,
	type FoobarAchievement,
	type FoobarClueId,
	isFoobarAchievement,
	isFoobarClueId,
} from "./catalog";
import { type FoobaFlagPageSlug } from "./flags";

export type FoobarClueSeen = {
	id: FoobarClueId;
	seen_at: number | null;
};

export type FoobarDataType = {
	visited_pages: Array<string>;
	konami: boolean;
	unlocked: boolean;
	completed: Array<FoobarAchievement>;
	all_achievements: boolean;
	clues_seen: Array<FoobarClueSeen>;
};

export const initialFoobarData: FoobarDataType = {
	visited_pages: [],
	konami: false,
	unlocked: false,
	completed: [],
	all_achievements: false,
	clues_seen: [],
};

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
	return typeof value === "object" && value !== null;
}

function uniqueStrings(value: unknown): Array<string> {
	if (!Array.isArray(value)) {
		return [];
	}

	return [...new Set(value.filter((item): item is string => typeof item === "string"))];
}

export function normalizeFoobarData(value: unknown): FoobarDataType {
	if (!isRecord(value)) {
		return { ...initialFoobarData };
	}

	const completed = uniqueStrings(value.completed).filter(isFoobarAchievement);
	const cluesSeen: Array<FoobarClueSeen> = [];
	const clueIds = new Set<FoobarClueId>();

	if (Array.isArray(value.clues_seen)) {
		for (const entry of value.clues_seen) {
			if (
				!isRecord(entry) ||
				!isFoobarClueId(entry.id) ||
				(entry.seen_at !== null &&
					(typeof entry.seen_at !== "number" || !Number.isFinite(entry.seen_at))) ||
				clueIds.has(entry.id)
			) {
				continue;
			}

			clueIds.add(entry.id);
			cluesSeen.push({ id: entry.id, seen_at: entry.seen_at });
		}
	}

	for (const achievement of completed) {
		const completionId = FOOBAR_ACHIEVEMENTS[achievement].completion.id;
		if (!clueIds.has(completionId)) {
			clueIds.add(completionId);
			cluesSeen.push({ id: completionId, seen_at: null });
		}
	}

	return {
		visited_pages: uniqueStrings(value.visited_pages),
		konami: typeof value.konami === "boolean" ? value.konami : initialFoobarData.konami,
		unlocked: typeof value.unlocked === "boolean" ? value.unlocked : initialFoobarData.unlocked,
		completed,
		all_achievements:
			typeof value.all_achievements === "boolean"
				? value.all_achievements
				: initialFoobarData.all_achievements,
		clues_seen: cluesSeen,
	};
}

export type FoobarSchrodingerProps = {
	completed_page: FoobaFlagPageSlug;
};

export type FoobarSliceType = {
	foobar_data: FoobarDataType;
	setFoobarData: (data: Partial<FoobarDataType>) => void;
	recordFoobarClue: (id: FoobarClueId) => void;
	completeFoobarFlag: (flag: FoobarAchievement) => void;
	_hasHydrated: boolean;
	setHasHydrated: (hasHydrated: boolean) => void;
};
export const createFoobarSlice: StateCreator<FoobarSliceType> = (set, _get) => ({
	foobar_data: initialFoobarData,
	setFoobarData: (data) => set((state) => ({ foobar_data: { ...state.foobar_data, ...data } })),
	recordFoobarClue: (id) =>
		set((state) => {
			if (state.foobar_data.clues_seen.some((clue) => clue.id === id)) {
				return state;
			}

			return {
				foobar_data: {
					...state.foobar_data,
					clues_seen: [...state.foobar_data.clues_seen, { id, seen_at: Date.now() }],
				},
			};
		}),
	completeFoobarFlag: (flag) =>
		set((state) => {
			const completionId = FOOBAR_ACHIEVEMENTS[flag].completion.id;
			const hasFlag = state.foobar_data.completed.includes(flag);
			const hasClue = state.foobar_data.clues_seen.some((clue) => clue.id === completionId);

			if (hasFlag && hasClue) {
				return state;
			}

			return {
				foobar_data: {
					...state.foobar_data,
					completed: hasFlag ? state.foobar_data.completed : [...state.foobar_data.completed, flag],
					clues_seen: hasClue
						? state.foobar_data.clues_seen
						: [...state.foobar_data.clues_seen, { id: completionId, seen_at: Date.now() }],
				},
			};
		}),
	_hasHydrated: false,
	setHasHydrated: (state) => {
		set({
			_hasHydrated: state,
		});
	},
});
