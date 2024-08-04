"use client";

import { ReactElement, useEffect, useId, useState } from "react";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import { ShikiMagicMove } from "shiki-magic-move/react";
import { type NonNegativeInteger } from "type-fest";

import { BundledLangs, getSlimKarmaHighlighter, KarmaHighlighter } from "./highlighter";

type MagicMoveProps = {
	stages: Array<{ label: string | ReactElement; code: string }>;
	init_index?: NonNegativeInteger<number>;
	last_index?: NonNegativeInteger<number>;
	file_name?: string;
	lang: BundledLangs;
} & Partial<Pick<Parameters<typeof ShikiMagicMove>[0], "options">>;
export const MagicMove = (props: MagicMoveProps) => {
	const {
		stages,
		init_index = 0,
		last_index = stages.length - 1,
		file_name,
		lang,
		options = { duration: 250, stagger: 0, lineNumbers: true },
	} = props;
	const [current_stage_index, setCurrentStageIndex] = useState(init_index);
	const index_bounds = [0, init_index || stages.length - 1];
	const [highlighter, setHighlighter] = useState<KarmaHighlighter>();
	const unique_id = useId();

	useEffect(() => {
		async function initializeHighlighter() {
			const highlighter = await getSlimKarmaHighlighter();
			setHighlighter(highlighter);
		}
		initializeHighlighter();
	}, []);

	function moveBackward() {
		setCurrentStageIndex((i) => Math.max(i - 1, 0));
	}
	function moveForward() {
		setCurrentStageIndex((i) => Math.min(i + 1, last_index));
	}

	return (
		<figure className="relative my-10">
			<div className="sticky top-[60px] z-10 -mx-4 flex justify-between gap-2 bg-background py-1 text-xs max-sm:px-2 sm:-ml-12 sm:-mr-5 sm:pl-12 sm:pr-5">
				<button
					className="group flex items-center gap-x-1 rounded-global bg-primary/20 px-2 py-1 text-xs text-foreground transition-[color,background-color] enabled:hover:bg-primary/25 disabled:cursor-not-allowed disabled:bg-primary/10 sm:px-4"
					onClick={moveBackward}
					disabled={current_stage_index === index_bounds[0]}
					aria-disabled={current_stage_index === index_bounds[0]}
					aria-describedby="previous-stage-button-disabled-description"
				>
					<span id={`previous-stage-button-disabled-description-${unique_id}`} className="sr-only">
						Currently at first possible stage
					</span>
					<FaLongArrowAltLeft
						aria-label="Previous step"
						className="text-primary/50 transition-[color] group-enabled:group-hover:text-primary"
					/>
					<span className="sr-only sm:not-sr-only">Previous</span>
				</button>
				<figcaption className="flex items-center font-serif max-sm:text-sm">
					{stages[current_stage_index].label}
				</figcaption>
				<button
					className="group flex items-center gap-x-1 rounded-global bg-primary/20 px-2 py-1 text-xs text-foreground transition-[color,background-color] enabled:hover:bg-primary/25 disabled:cursor-not-allowed disabled:bg-primary/10 sm:px-4"
					onClick={moveForward}
					disabled={current_stage_index === index_bounds[1]}
					aria-disabled={current_stage_index === index_bounds[1]}
					aria-describedby="next-stage-button-disabled-description"
				>
					<span id={`next-stage-button-disabled-description-${unique_id}`} className="sr-only">
						Currently at last possible stage
					</span>
					<span className="sr-only sm:not-sr-only">Next</span>
					<FaLongArrowAltRight
						aria-label="Next step"
						className="text-primary/50 transition-[color] group-enabled:group-hover:text-primary"
					/>
				</button>
			</div>
			<div className="my-2 flex flex-col">
				<div className="-mx-4 grid grid-flow-col overflow-x-scroll rounded-tl-global rounded-tr-global bg-karma-background pl-2 pr-2 sm:-ml-12 sm:-mr-5 sm:pl-12 sm:pr-5">
					{file_name ? (
						<span className="justify-self-start rounded-t-global py-1 font-mono text-zinc-400 max-sm:text-xs">
							{file_name}
						</span>
					) : null}

					{lang ? (
						<span className="justify-self-end rounded-t-global py-1 font-mono text-zinc-400 max-sm:text-xs">
							{lang}
						</span>
					) : null}
				</div>
				{highlighter && (
					<ShikiMagicMove
						lang={lang}
						theme="karma"
						highlighter={highlighter}
						code={stages[current_stage_index].code.trim()}
						options={options}
						className="-mx-4 overflow-x-scroll rounded-bl-global rounded-br-global p-5 text-xs max-sm:px-2 sm:-ml-12 sm:-mr-5 sm:text-sm [&>.shiki-magic-move-line-number]:mr-2 [&>.shiki-magic-move-line-number]:w-[1.5rem] [&>.shiki-magic-move-line-number]:whitespace-nowrap [&>.shiki-magic-move-line-number]:pr-2 [&>.shiki-magic-move-line-number]:text-right max-sm:[&>.shiki-magic-move-line-number]:hidden"
					/>
				)}
			</div>
		</figure>
	);
};
