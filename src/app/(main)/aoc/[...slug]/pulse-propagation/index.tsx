"use client";
import "shiki-magic-move/dist/style.css";

import { useEffect, useState } from "react";
import { ShikiMagicMove } from "shiki-magic-move/react";

import { getSlimKarmaHighlighter } from "@/lib/domains/shiki";
import { type KarmaHighlighter } from "@/lib/domains/shiki/highlighter";

export const ParseInput = () => {
	const [code, setCode] = useState(FIRST);
	const [highlighter, setHighlighter] = useState<KarmaHighlighter>();

	useEffect(() => {
		async function initializeHighlighter() {
			const highlighter = await getSlimKarmaHighlighter();
			setHighlighter(highlighter);
		}
		initializeHighlighter();
	}, []);

	function animate() {
		setCode(SECOND);
	}

	return (
		<div>
			{highlighter && (
				<>
					<ShikiMagicMove
						lang="elixir"
						theme="karma"
						highlighter={highlighter}
						code={code}
						options={{ duration: 800, stagger: 0.3, lineNumbers: true }}
						className="-ml-12 -mr-5 overflow-x-scroll rounded-bl-global rounded-br-global p-5 text-xs max-sm:-ml-4 max-sm:px-2 sm:text-sm max-sm:[&>code>.block>.line]:whitespace-pre-wrap"
					/>
					<button onClick={animate}>Animate</button>
				</>
			)}
		</div>
	);
};

const FIRST = `defmodule PulsePropagation do
  defp parse_input(input) do
    input
    |> String.split("\\n")
    |> dbg()
  end

  def part_1(input) do
    input
    |> parse_input()
  end
end

input = File.read!("input.txt") # Read the local input file, throw error if not present

PulsePropagation.part_1(input)`;

const SECOND = `defmodule PulsePropagation do
  defp parse_input(input) do
    input
    |> String.split("\\n")
    |> Enum.map()
    |> dbg()
  end

  def part_1(input) do
    input
    |> parse_input()
  end
end

input = File.read!("input.txt") # Read the local input file, throw error if not present

PulsePropagation.part_1(input)`;
