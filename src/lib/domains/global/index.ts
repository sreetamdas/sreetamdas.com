/* eslint-disable no-console */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { IS_DEV } from "@/config";
import { ColorSchemeSliceType, createColorSchemeSlice } from "@/lib/domains/colorScheme/store";
import { createFoobarSlice, FoobarSliceType } from "@/lib/domains/foobar/flags";

type CombinedState = FoobarSliceType & ColorSchemeSliceType;
export const useBoundStore = create<CombinedState>()(
	persist((...a) => ({ ...createFoobarSlice(...a), ...createColorSchemeSlice(...a) }), {
		name: IS_DEV ? "foobar-zustand-dev" : "foobar-zustand",
		partialize: (state) => ({
			foobarData: state.foobarData,
		}),
	})
);
