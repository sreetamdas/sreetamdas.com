"use client";

/**
 * Registers the classic Konami sequence through TanStack Hotkeys. Keeping the
 * sequence in one hook makes cleanup explicit and keeps browser event matching
 * out of the site-wide Foobar pixel.
 */
import { SequenceManager, type HotkeySequence } from "@tanstack/hotkeys";
import { useEffect } from "react";

export const FOOBAR_KONAMI_SEQUENCE: HotkeySequence = [
	"ArrowUp",
	"ArrowUp",
	"ArrowDown",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"ArrowLeft",
	"ArrowRight",
	"B",
	"A",
];

export function useKonamiAchievement(enabled: boolean, onComplete: () => void) {
	useEffect(() => {
		if (!enabled) return;

		const registration = SequenceManager.getInstance().register(
			FOOBAR_KONAMI_SEQUENCE,
			() => onComplete(),
			{
				ignoreInputs: true,
				conflictBehavior: "replace",
			},
		);

		return () => registration.unregister();
	}, [enabled, onComplete]);
}
