import { merge } from "lodash-es";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { IS_DEV } from "@/config";
import { type ColorSchemeSliceType, createColorSchemeSlice } from "@/lib/domains/colorScheme/store";
import { type FoobarSliceType, createFoobarSlice } from "@/lib/domains/foobar/flags";

type CombinedState = FoobarSliceType & ColorSchemeSliceType;
export const useGlobalStore = create<CombinedState>()(
	persist((...a) => ({ ...createFoobarSlice(...a), ...createColorSchemeSlice(...a) }), {
		name: IS_DEV ? "foobar-zustand-dev" : "foobar-zustand",
		partialize: (state) => ({
			foobarData: state.foobarData,
		}),
		merge: (persistedState, currentState) => merge(currentState, persistedState),
		onRehydrateStorage: () => (state) => {
			state?.setHasHydrated(true);
		},
	}),
);
