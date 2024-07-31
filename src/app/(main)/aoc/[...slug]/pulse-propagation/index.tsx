"use client";
import "shiki-magic-move/dist/style.css";

import { useEffect, useState } from "react";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import { ShikiMagicMove } from "shiki-magic-move/react";

import { Code } from "@/lib/components/Typography";
import { getSlimKarmaHighlighter } from "@/lib/domains/shiki";
import { type KarmaHighlighter } from "@/lib/domains/shiki/highlighter";

type Props = {
	conjunctionInputsStage?: boolean;
};
export const ParseInput = ({ conjunctionInputsStage: conjInputsStage }: Props) => {
	const [currentStageIndex, setCurrentStageIndex] = useState(conjInputsStage ? 7 : 0);
	const indexBounds = [0, conjInputsStage ? stages.length - 1 : 6];
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
		setCurrentStageIndex((i) => Math.min(i + 1, conjInputsStage ? stages.length - 1 : 6));
	}

	return (
		<figure className="my-10">
			<div className="flex justify-between gap-2">
				<button
					className="group flex items-center gap-x-1 rounded-global bg-primary/20 px-4 py-1 text-xs text-foreground transition-[color,background-color] enabled:hover:bg-primary/25 disabled:cursor-not-allowed disabled:bg-primary/10"
					onClick={moveBackward}
					disabled={currentStageIndex === indexBounds[0]}
					aria-disabled={currentStageIndex === indexBounds[0]}
					aria-describedby="previous-stage-button-disabled-description"
				>
					<span id="previous-stage-button-disabled-description" className="sr-only">
						Currently at first possible stage
					</span>
					<FaLongArrowAltLeft
						aria-label="Previous step"
						className="text-primary/50 transition-[color] enabled:group-hover:text-primary"
					/>
					<span className="sr-only sm:not-sr-only">Previous</span>
				</button>
				<figcaption className="flex items-center font-serif max-sm:text-sm">
					{stages[currentStageIndex].label}
				</figcaption>
				<button
					className="group flex items-center gap-x-1 rounded-global bg-primary/20 px-4 py-1 text-xs text-foreground transition-[color,background-color] enabled:hover:bg-primary/25 disabled:cursor-not-allowed disabled:bg-primary/10"
					onClick={moveForward}
					disabled={currentStageIndex === indexBounds[1]}
					aria-disabled={currentStageIndex === indexBounds[1]}
					aria-describedby="next-stage-button-disabled-description"
				>
					<span id="next-stage-button-disabled-description" className="sr-only">
						Currently at last possible stage
					</span>
					<span className="sr-only sm:not-sr-only">Next</span>
					<FaLongArrowAltRight
						aria-label="Next step"
						className="text-primary/50 transition-[color] enabled:group-hover:text-primary"
					/>
				</button>
			</div>
			<div className="my-2 flex flex-col">
				<div className="-mx-4 grid grid-flow-col overflow-x-scroll rounded-tl-global rounded-tr-global bg-karma-background pl-2 pr-2 sm:-ml-12 sm:-mr-5 sm:pl-12 sm:pr-5">
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
						className="-mx-4 overflow-x-scroll rounded-bl-global rounded-br-global p-5 text-xs max-sm:px-2 sm:-ml-12 sm:-mr-5 sm:text-sm [&>.shiki-magic-move-line-number]:mr-2 [&>.shiki-magic-move-line-number]:w-[1.5rem] [&>.shiki-magic-move-line-number]:whitespace-nowrap [&>.shiki-magic-move-line-number]:pr-2 [&>.shiki-magic-move-line-number]:text-right max-sm:[&>.shiki-magic-move-line-number]:hidden"
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

      # mod name, mod type, outputs, initial state :off
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

      # mod name, mod type, outputs, initial state :off
      {mod, {:flip, dest, :off}}

    "&" <> str ->
      # conjunction
      [mod, dest_raw] = String.split(str, " -> ")

      dest = String.split(dest_raw, ", ", trim: true)

      # mod name, mod type, outputs, inputs empty/unknown
      {mod, {:conj, dest, %{}}}
  end)
end`,
	},
	{
		label: "Handle broadcaster module",
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
	{
		label: "Match list to variable",
		code: `
defp parse_input(input) do
  init_entries = input
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
	{
		label: (
			<>
				Get all <Code>conj</Code> modules
			</>
		),
		code: `
conjs =
  init_entries
  |> Enum.flat_map(fn
    {node, {:conj, _, _}} -> [node]
    _ -> []
  end)`,
	},
	{
		label: "Reduce entries to Map, add base case",
		code: `
conjs =
  init_entries
  |> Enum.flat_map(fn
    {node, {:conj, _, _}} -> [node]
    _ -> []
  end)
  
conjunction_modules_input_map =
  init_entries
  |> Enum.reduce(%{}, fn
    # current value, accumulator
    _, conjs_map ->
      conjs_map
  end)`,
	},
	{
		label: "Pattern match on entry",
		code: `
conjs =
  init_entries
  |> Enum.flat_map(fn
    {node, {:conj, _, _}} -> [node]
    _ -> []
  end)
  
conjunction_modules_input_map =
  init_entries
  |> Enum.reduce(%{}, fn
# since we need to match exactly, we use _ to match 
# ignored variables in our tuple
    {node, {_, destination_modules, _}}, conjs_map ->
      destination_modules

    _, conjs_map ->
      conjs_map
  end)`,
	},
	{
		label: (
			<>
				Filter mods which are a part of <Code>conjs</Code>
			</>
		),
		code: `
conjs =
  init_entries
  |> Enum.flat_map(fn
    {node, {:conj, _, _}} -> [node]
    _ -> []
  end)
  
conjunction_modules_input_map =
  init_entries
  |> Enum.reduce(%{}, fn
    {node, {_, dest_mods, _}}, conjs_map ->
      dest_mods
      |> Enum.filter(&Enum.member?(conjs, &1))

    _, conjs_map ->
      conjs_map
  end)`,
	},
	{
		label: "Pattern match, add base (empty) case",
		code: `
conjs =
  init_entries
  |> Enum.flat_map(fn
    {node, {:conj, _, _}} -> [node]
    _ -> []
  end)
  
conjunction_modules_input_map =
  init_entries
  |> Enum.reduce(%{}, fn
    {node, {_, dest_mods, _}}, conjs_map ->
      dest_mods
      |> Enum.filter(&Enum.member?(conjs, &1))
      |> case do
        [] ->
          conjs_map
      end


    _, conjs_map ->
      conjs_map
  end)`,
	},
	{
		label: (
			<>
				Reduce matched <Code>conj</Code> mods
			</>
		),
		code: `
conjs =
  init_entries
  |> Enum.flat_map(fn
    {node, {:conj, _, _}} -> [node]
    _ -> []
  end)
  
conjunction_modules_input_map =
  init_entries
  |> Enum.reduce(%{}, fn
    {node, {_, dest_mods, _}}, conjs_map ->
      dest_mods
      |> Enum.filter(&Enum.member?(conjs, &1))
      |> case do
        [] ->
          conjs_map

        matches ->
          matches
          |> Enum.reduce(conjs_map, fn
            dest_mod, map ->
              map
          end
      end 


    _, conjs_map ->
      conjs_map
  end)`,
	},
	{
		label: (
			<>
				Update <Code>Map</Code> with init values
			</>
		),
		code: `
conjs =
  init_entries
  |> Enum.flat_map(fn
    {node, {:conj, _, _}} -> [node]
    _ -> []
  end)
  
conjunction_modules_input_map =
  init_entries
  |> Enum.reduce(%{}, fn
    {node, {_, dest_mods, _}}, conjs_map ->
      dest_mods
      |> Enum.filter(&Enum.member?(conjs, &1))
      |> case do
        [] ->
          conjs_map

        matches ->
          matches
          |> Enum.reduce(conjs_map, fn dest_mod, map ->
            map
            |> Map.update(
              dest_mod,
              # default value when dest_mod key is empty
              %{node => :low},
              fn input_mods ->
                input_mods
                # all inputs are initially :low
                |> Map.put(node, :low)
            end)
          end) 
      end 


    _, conjs_map ->
      conjs_map
  end)`,
	},
	{
		label: (
			<>
				Create <Code>Map</Code> from processed list of tuples
			</>
		),
		code: `
conjs =
  init_entries
  |> Enum.flat_map(fn
    {node, {:conj, _, _}} -> [node]
    _ -> []
  end)
  
conjunction_modules_input_map =
  init_entries
  |> Enum.reduce(%{}, fn
    {node, {_, dest_mods, _}}, conjs_map ->
      dest_mods
      |> Enum.filter(&Enum.member?(conjs, &1))
      |> case do
        [] ->
          conjs_map

        matches ->
          matches
          |> Enum.reduce(conjs_map, fn dest_mod, map ->
            map
            |> Map.update(
              dest_mod,
              %{node => :low},
              fn input_mods ->
                input_mods
                |> Map.put(node, :low)
            end)
          end) 
      end 

    _, conjs_map ->
      conjs_map
  end)


init_entries
|> Map.new()`,
	},
	{
		label: <>Merge maps based on keys</>,
		code: `
conjs =
  init_entries
  |> Enum.flat_map(fn
    {node, {:conj, _, _}} -> [node]
    _ -> []
  end)
  
conjunction_modules_input_map =
  init_entries
  |> Enum.reduce(%{}, fn
    {node, {_, dest_mods, _}}, conjs_map ->
      dest_mods
      |> Enum.filter(&Enum.member?(conjs, &1))
      |> case do
        [] ->
          conjs_map

        matches ->
          matches
          |> Enum.reduce(conjs_map, fn dest_mod, map ->
            map
            |> Map.update(
              dest_mod,
              %{node => :low},
              fn input_mods ->
                input_mods
                |> Map.put(node, :low)
            end)
          end) 
      end 

    _, conjs_map ->
      conjs_map
  end)


init_entries
|> Map.new()
|> Map.merge(conjunction_modules_input_map, fn
  # key, map_1 value, map_2 value
  _, {:conj, dest, _}, inputs_map ->
    {:conj, dest, inputs_map}
end)`,
	},
];
