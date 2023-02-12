/* eslint-disable no-console */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ColorSchemeSliceType, createColorSchemeSlice } from "@/lib/domains/colorScheme/store";
import { createFoobarSlice, FoobarSliceType } from "@/lib/domains/foobar";

type CombinedState = FoobarSliceType & ColorSchemeSliceType;
export const useBoundStore = create<CombinedState>()(
	persist((...a) => ({ ...createFoobarSlice(...a), ...createColorSchemeSlice(...a) }), {
		name: "persisted-data",
		partialize: (state) => ({
			foobarData: state.foobarData,
		}),
	})
);
