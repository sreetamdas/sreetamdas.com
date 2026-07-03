"use client";

import "@shikijs/magic-move/style.css";
import { ShikiMagicMove } from "@shikijs/magic-move/react";
/**
 * Animated code transitions for slides, powered by shiki-magic-move.
 *
 * `<MagicMoveCode>` takes an ordered list of stages and morphs between them
 * line-by-line as the presenter advances steps. It plugs into the deck's step
 * system the same way `<Steps>` does: it registers `stages.length` steps, and the
 * current step selects which stage is shown. Tokenization reuses the shared Karma
 * Shiki highlighter so colors match the static `<CodeBlock>`s elsewhere.
 *
 * Carries over the original MagicMove preferences: snappy 250ms / no-stagger
 * animation, line numbers, an editor-tab header (file name + language), and an
 * optional per-stage caption.
 */
import { type ReactNode, use, useEffect, useId, useState } from "react";

import { getSlimKarmaHighlighter, type KarmaHighlighter } from "@/lib/domains/shiki/highlighter";
import { cn } from "@/lib/helpers/utils";

import { SlideActiveContext, StepContext } from "./steps.context";

type Stage = {
	code: string;
	/** Optional caption shown under the block for this stage, e.g. "add validateSearch". */
	caption?: ReactNode;
};

type MagicMoveCodeProps = {
	/** Ordered stages. The deck morphs between consecutive entries as steps advance. */
	stages: Array<Stage>;
	lang?: string;
	fileName?: string;
	className?: string;
};

// Snappy, all-at-once morph — the original feel, not a slow cascade.
// `animateContainer: false` keeps the editor box from smoothly resizing
// (the background "growing" horizontally/vertically) between stages — only the
// tokens themselves move/enter/leave.
const MAGIC_MOVE_OPTIONS = {
	duration: 250,
	stagger: 0,
	lineNumbers: true,
	animateContainer: false,
} as const;

export function MagicMoveCode({ stages, lang = "tsx", fileName, className }: MagicMoveCodeProps) {
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

	// Register one step per stage so arrow presses index directly into `stages`.
	useEffect(() => {
		if (active) {
			registerSteps(id, stages.length);
			return () => unregisterSteps(id);
		}
	}, [active, stages.length, id, registerSteps, unregisterSteps]);

	// Only follow the (deck-global) step while THIS slide is active. Every slide
	// is mounted at once and shares one `currentStep`, so an inactive instance
	// would otherwise silently morph along with a different slide and then visibly
	// re-sync back to stage 0 the moment you navigate to it. Pin inactive
	// instances to stage 0 so entering a slide is a no-op (nothing to animate).
	const index = active ? Math.min(Math.max(currentStep, 0), stages.length - 1) : 0;
	const stage = stages[index] ?? stages[0];
	const code = stage?.code.trim() ?? "";

	return (
		<figure className={cn("my-4 ml-12 font-mono text-2xl", className)}>
			{fileName || lang ? (
				<div className="flex justify-between rounded-t-global bg-karma-background px-5 py-1.5 font-mono text-base text-zinc-400">
					<span>{fileName}</span>
					<span>{lang}</span>
				</div>
			) : null}
			{highlighter ? (
				<ShikiMagicMove
					highlighter={highlighter}
					lang={lang}
					theme="karma"
					code={code}
					options={MAGIC_MOVE_OPTIONS}
					className={cn(
						"overflow-x-auto rounded-b-global p-5 leading-relaxed [&_pre]:!bg-transparent",
						"[&_.shiki-magic-move-line-number]:mr-3 [&_.shiki-magic-move-line-number]:inline-block [&_.shiki-magic-move-line-number]:w-8 [&_.shiki-magic-move-line-number]:pr-2 [&_.shiki-magic-move-line-number]:text-right [&_.shiki-magic-move-line-number]:text-zinc-500",
					)}
				/>
			) : (
				<pre className="rounded-b-global p-5 whitespace-pre-wrap text-foreground/80">{code}</pre>
			)}
			{stage?.caption ? (
				<figcaption className="mt-3 font-serif text-xl text-foreground/70">
					{stage.caption}
				</figcaption>
			) : null}
		</figure>
	);
}
