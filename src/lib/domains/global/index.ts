import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ColorSchemeSliceType, createColorSchemeSlice } from "@/lib/domains/colorScheme/store";
import { createFoobarSlice, FoobarSliceType } from "@/lib/domains/foobar";

type PersistedState = Pick<FoobarSliceType, "foobarData"> &
	Pick<ColorSchemeSliceType, "colorScheme">;
type CombinedState = FoobarSliceType & ColorSchemeSliceType;
export const ZUSTAND_PERSIST_KEY = "zustand-persist";

export const useZustandStore = create<CombinedState>()(
	persist<CombinedState, [], [], PersistedState>(
		(...a) => ({
			...createFoobarSlice(...a),
			...createColorSchemeSlice(...a),
		}),
		{
			name: ZUSTAND_PERSIST_KEY,
			partialize: (state) => ({
				foobarData: state.foobarData,
				colorScheme: state.colorScheme,
			}),
		}
	)
);
