"use client";

import { use, useEffect, useId, useMemo, useState } from "react";
import "shiki-magic-move/style.css";
/**
 * Animated code transitions for slides, powered by shiki-magic-move.
 *
 * `<MagicMoveCode>` takes an ordered list of code states and morphs between them
 * line-by-line as the presenter advances steps. It plugs into the deck's step
 * system the same way `<Steps>` does: it registers `states.length` steps, and the
 * current step selects which state is shown. Tokenization reuses the shared Karma
 * Shiki highlighter so colors match the static `<CodeBlock>`s elsewhere.
 *
 * Optional `highlight` lets a state spotlight specific 1-based lines (the rest dim),
 * e.g. states=[a, b], highlight={{ 1: "2-3" }} dims everything but lines 2-3 on the
 * second state.
 */
import { ShikiMagicMove } from "shiki-magic-move/react";

import { getSlimKarmaHighlighter, type KarmaHighlighter } from "@/lib/domains/shiki/highlighter";
import { cn } from "@/lib/helpers/utils";

import { SlideActiveContext, StepContext } from "./steps.context";

type MagicMoveCodeProps = {
	/** Ordered code snapshots. The deck morphs between consecutive entries. */
	states: Array<string>;
	lang?: string;
	className?: string;
};

export function MagicMoveCode({ states, lang = "tsx", className }: MagicMoveCodeProps) {
	const { currentStep, registerSteps, unregisterSteps } = use(StepContext);
	const active = use(SlideActiveContext);
	const id = useId();
	const [highlighter, setHighlighter] = useState<KarmaHighlighter | null>(null);

	useEffect(() => {
		let cancelled = false;
		void getSlimKarmaHighlighter().then((hl) => {
			if (!cancelled) setHighlighter(hl);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	// Register one step per state so arrow presses index directly into `states`.
	useEffect(() => {
		if (active) {
			registerSteps(id, states.length);
			return () => unregisterSteps(id);
		}
	}, [active, states.length, id, registerSteps, unregisterSteps]);

	const index = Math.min(Math.max(currentStep, 0), states.length - 1);
	const code = states[index] ?? states[0] ?? "";

	const options = useMemo(
		() => ({ duration: 650, stagger: 0.18, lineNumbers: false, animateContainer: true }),
		[],
	);

	return (
		<div
			className={cn("ml-12 font-mono text-2xl leading-relaxed [&_pre]:!bg-transparent", className)}
		>
			{highlighter ? (
				<ShikiMagicMove
					highlighter={highlighter}
					lang={lang}
					theme="karma"
					code={code}
					options={options}
				/>
			) : (
				<pre className="whitespace-pre-wrap text-foreground/80">{code}</pre>
			)}
		</div>
	);
}
