import { merge } from "lodash-es";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { IS_DEV } from "@/config";
import { type ColorSchemeSliceType, createColorSchemeSlice } from "@/lib/domains/colorScheme/store";
import { createFoobarSlice, type FoobarSliceType } from "@/lib/domains/foobar/store";

type CombinedState = FoobarSliceType & ColorSchemeSliceType;
export const useGlobalStore = create<CombinedState>()(
	persist((...a) => ({ ...createFoobarSlice(...a), ...createColorSchemeSlice(...a) }), {
		name: IS_DEV ? "foobar-zustand-dev" : "foobar-zustand",
		partialize: (state) => ({
			foobar_data: state.foobar_data,
		}),
		merge: (persistedState, currentState) => merge(currentState, persistedState),
		onRehydrateStorage: () => (state) => {
			state?.setHasHydrated(true);
		},
	}),
);
