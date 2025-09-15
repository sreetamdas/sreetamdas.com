import { Code } from "@/lib/components/Typography";
import { MagicMove } from "@/lib/domains/shiki/MagicMove";

type ProcessPulsesProps = {
	second_stage?: boolean;
};
export const Part1 = (_props: ProcessPulsesProps) => (
	<MagicMove
		stages={stages}
		lang="elixir"
		file_name="part_1.ex"
		// init_index={props.second_stage ? 14 : undefined}
		// last_index={props.second_stage ? undefined : 13}
	/>
);

const stages = [
	{
		label: "Pattern match first pulse in queue",
		code: `
broadcast
|> Enum.map(&{&1, :low, "broadcast"})
|> then(fn init_pulses ->
  init_pulses
  |> process_pulse(parsed)
end)
`,
	},
	{
		label: (
			<>
				Pattern match results of <Code>process_pulse</Code>
			</>
		),
		code: `
broadcast
|> Enum.map(&{&1, :low, "broadcast"})
|> then(fn init_pulses ->
  init_pulses
  |> process_pulse(parsed)
  |> then(fn {updated_map, {updated_low_counts, updated_high_counts}} ->

  end)
end)

`,
	},
];
