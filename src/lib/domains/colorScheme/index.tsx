"use client";

import { useZustandStore } from "@/lib/domains/global";

export const ColorSchemeToggle = () => {
	const { colorScheme } = useZustandStore((state) => ({
		colorScheme: state.colorScheme,
		setColorScheme: state.setColorScheme,
	}));

	return <span>{colorScheme}</span>;
};
