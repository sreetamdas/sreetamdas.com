/**
 * Global client store. Foobar progress is persisted, but color-scheme is kept
 * as live UI state because the canonical preference is the dedicated
 * `color-scheme` localStorage key read by the blocking root script.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { IS_DEV } from "@/config";
import { type ColorSchemeSliceType, createColorSchemeSlice } from "@/lib/domains/colorScheme/store";
import {
	createFoobarSlice,
	normalizeFoobarData,
	type FoobarSliceType,
} from "@/lib/domains/foobar/store";

type CombinedState = FoobarSliceType & ColorSchemeSliceType;
export const useGlobalStore = create<CombinedState>()(
	persist((...a) => ({ ...createFoobarSlice(...a), ...createColorSchemeSlice(...a) }), {
		name: IS_DEV ? "foobar-zustand-dev" : "foobar-zustand",
		partialize: (state) => ({
			foobar_data: state.foobar_data,
		}),
		merge: (persistedState, currentState) => {
			if (
				typeof persistedState !== "object" ||
				persistedState === null ||
				!("foobar_data" in persistedState)
			) {
				return currentState;
			}

			return {
				...currentState,
				foobar_data: normalizeFoobarData(persistedState.foobar_data),
			};
		},
		onRehydrateStorage: () => (state) => {
			state?.setHasHydrated(true);
		},
	}),
);
