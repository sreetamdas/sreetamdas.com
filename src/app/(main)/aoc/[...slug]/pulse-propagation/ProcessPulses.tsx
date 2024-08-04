import { Code } from "@/lib/components/Typography";
import { MagicMove } from "@/lib/domains/shiki/MagicMove";

type ProcessPulsesProps = {
	second_stage?: boolean;
};
export const ProcessPulses = (_props: ProcessPulsesProps) => (
	<MagicMove stages={stages} lang="elixir" />
);

const stages = [
	{
		label: "Pattern match first pulse in queue",
		code: `
defp process_pulse(pulses) do
  [pulse | rest_pulses] = pulses
end
`,
	},
	{
		label: "Pattern match pulse's target module and pulse",
		code: `
defp process_pulse(pulses) do
  [pulse | rest_pulses] = pulses

  {module, pulse} = pulse
end
`,
	},
	{
		label: "Move pattern match to function",
		code: `
defp process_pulse(
       [{module, pulse} | rest_pulses],
       modules_map
     ) do
end
`,
	},
	{
		label: "Get module from map",
		code: `
defp process_pulse(
       [{module, pulse} | rest_pulses],
       modules_map
     ) do
  modules_map
  |> Map.get_and_update(node, fn module_details -> nil end)
end
`,
	},
	{
		label: (
			<>
				Pattern match <Code>module_details</Code> with guard
			</>
		),
		code: `
defp process_pulse(
       [{module, pulse} | rest_pulses],
       modules_map
     ) do
  modules_map
  |> Map.get_and_update(node, fn 
    {:flip, dest_mods, :off} when signal == :low ->
      dest_mods
	end)
end
`,
	},
	{
		label: "Split input into lines",
		code: `
defp process_pulse([pulse | rest_pulses], modules_map) do
  process_module(pulse, modules_map)
  |> then(fn {next_modules, updated_map} ->
    rest_pulses
    |> add_lists(next_modules)
    |> process_pulse(updated_map, pulse_counts)
  end)
end
`,
	},
];
