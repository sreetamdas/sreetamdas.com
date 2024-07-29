"use client";
import "shiki-magic-move/dist/style.css";

import { useEffect, useState } from "react";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import { ShikiMagicMove } from "shiki-magic-move/react";

import { getSlimKarmaHighlighter } from "@/lib/domains/shiki";
import { type KarmaHighlighter } from "@/lib/domains/shiki/highlighter";

export const ParseInput = () => {
	const [currentStageIndex, setCurrentStageIndex] = useState(0);
	const [highlighter, setHighlighter] = useState<KarmaHighlighter>();

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
		setCurrentStageIndex((i) => Math.min(i + 1, stages.length - 1));
	}

	return (
		<figure className="my-10">
			<div className="flex justify-between gap-2">
				<button
					className="group flex items-center gap-x-1 rounded-global bg-primary/20 px-4 py-1 text-xs text-foreground transition-[color,background-color] hover:bg-primary/25"
					onClick={moveBackward}
				>
					<FaLongArrowAltLeft
						aria-label="Previous step"
						className="text-primary/50 transition-[color] group-hover:text-primary"
					/>
					<span className="sr-only sm:not-sr-only">Previous</span>
				</button>
				<figcaption className="flex items-center font-serif max-sm:text-sm">
					{stages[currentStageIndex].label}
				</figcaption>
				<button
					className="group flex items-center gap-x-1 rounded-global bg-primary/20 px-4 py-1 text-xs text-foreground transition-[color,background-color] hover:bg-primary/25"
					onClick={moveForward}
				>
					<span className="sr-only sm:not-sr-only">Next</span>
					<FaLongArrowAltRight
						aria-label="Next step"
						className="text-primary/50 transition-[color] group-hover:text-primary"
					/>
				</button>
			</div>
			<div className="my-2 flex flex-col">
				<div className="-ml-4 -mr-5 grid grid-flow-col overflow-x-scroll rounded-tl-global rounded-tr-global bg-karma-background pl-2 pr-2 sm:-ml-12 sm:pl-12 sm:pr-5">
					<span className="justify-self-start rounded-t-global py-1 font-mono text-zinc-400 max-sm:text-xs">
						parse_input.ex
					</span>

					<span className="justify-self-end rounded-t-global py-1 font-mono text-zinc-400 max-sm:text-xs">
						elixir
					</span>
				</div>
				{highlighter && (
					<ShikiMagicMove
						lang="elixir"
						theme="karma"
						highlighter={highlighter}
						code={stages[currentStageIndex].code.trim()}
						options={{ duration: 300, stagger: 0.3, lineNumbers: true }}
						className="-ml-12 -mr-5 overflow-x-scroll rounded-bl-global rounded-br-global p-5 text-xs max-sm:-ml-4 max-sm:px-2 sm:text-sm [&>.shiki-magic-move-line-number]:mr-2 [&>.shiki-magic-move-line-number]:w-[1.5rem] [&>.shiki-magic-move-line-number]:whitespace-nowrap [&>.shiki-magic-move-line-number]:pr-2 [&>.shiki-magic-move-line-number]:text-right max-sm:[&>.shiki-magic-move-line-number]:hidden"
					/>
				)}
			</div>
		</figure>
	);
};

const stages = [
	{
		label: "Split input into lines",
		code: `
defp parse_input(input) do
  input
  |> String.split("\\n")
end`,
	},
	{
		label: "iterate through each line",
		code: `
defp parse_input(input) do
  input
  |> String.split("\\n")
  |> Enum.map(fn line -> line end)
end`,
	},
	{
		label: "Pattern match each line",
		code: `
defp parse_input(input) do
  input
  |> String.split("\\n")
  |> Enum.map(fn line ->
    case line do
      "%" <> str -> line
    end
  end)
end`,
	},
	{
		label: "Pattern match in the anonymous function itself",
		code: `
defp parse_input(input) do
  input
  |> String.split("\\n")
  |> Enum.map(fn
    "%" <> str -> str
  end)
end`,
	},
	{
		label: "if starts with `%`, flip-flop",
		code: `

defp parse_input(input) do
  input
  |> String.split("\\n")
  |> Enum.map(fn
    "%" <> str ->
      # flip-flop
      [mod, dest_raw] = String.split(str, " -> ")

      dest = String.split(dest_raw, ", ", trim: true)

      {mod, {:flip, dest, :off}}
  end)
end`,
	},
	{
		label: "if starts with `&`, conjunction",
		code: `
defp parse_input(input) do
  input
  |> String.split("\\n")
  |> Enum.map(fn
    "%" <> str ->
      # flip-flop
      [mod, dest_raw] = String.split(str, " -> ")

      dest = String.split(dest_raw, ", ", trim: true)

      {mod, {:flip, dest, :off}}

    "&" <> str ->
      # conjunction
      [mod, dest_raw] = String.split(str, " -> ")

      dest = String.split(dest_raw, ", ", trim: true)

      {mod, {:conj, dest, %{}}}
  end)
end`,
	},
	{
		label: "broadcaster, output",
		code: `
defp parse_input(input) do
  input
  |> String.split("\\n")
  |> Enum.map(fn
    "%" <> str ->
      # flip-flop
      [mod, dest_raw] = String.split(str, " -> ")

      dest = String.split(dest_raw, ", ", trim: true)

      {mod, {:flip, dest, :off}}

    "&" <> str ->
      # conjunction
      [mod, dest_raw] = String.split(str, " -> ")

      dest = String.split(dest_raw, ", ", trim: true)

      {mod, {:conj, dest, %{}}}

    "broadcaster -> " <> starter_mods ->
      starter_mods
      |> String.split(", ")
      |> then(&{"broadcast", &1})
  end)
end`,
	},
];
