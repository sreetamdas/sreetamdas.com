import { type StateCreator } from "zustand";

export type ColorSchemeSliceType = {
	colorScheme: "light" | "dark" | "system" | undefined;
	setColorScheme: (data: NonNullable<ColorSchemeSliceType["colorScheme"]>) => void;
};
export const createColorSchemeSlice: StateCreator<ColorSchemeSliceType> = (set) => ({
	colorScheme: undefined,
	setColorScheme: (nextColorScheme) => set({ colorScheme: nextColorScheme }),
});
