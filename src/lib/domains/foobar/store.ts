import { merge } from "lodash-es";
import { type StateCreator } from "zustand";

import { type FoobarPageSlug } from "./flags";

export type FoobarDataType = {
	visited_pages: Array<string>;
	konami: boolean;
	unlocked: boolean;
	completed: Array<FoobarPageSlug>;
	all_achievements: boolean;
};

export const initialFoobarData: FoobarDataType = {
	visited_pages: [],
	konami: false,
	unlocked: false,
	completed: [],
	all_achievements: false,
};

export type FoobarSchrodingerProps = {
	completedPage: FoobarPageSlug;
};

export type FoobarSliceType = {
	foobar_data: FoobarDataType;
	setFoobarData: (data: Partial<FoobarDataType>) => void;
	_hasHydrated: boolean;
	setHasHydrated: (hasHydrated: boolean) => void;
};
export const createFoobarSlice: StateCreator<FoobarSliceType> = (set, _get) => ({
	foobar_data: initialFoobarData,
	setFoobarData: (data) => set((state) => ({ foobar_data: merge(state.foobar_data, data) })),
	_hasHydrated: false,
	setHasHydrated: (state) => {
		set({
			_hasHydrated: state,
		});
	},
});
