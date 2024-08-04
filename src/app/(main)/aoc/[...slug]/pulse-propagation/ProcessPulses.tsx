import { Code } from "@/lib/components/Typography";
import { MagicMove } from "@/lib/domains/shiki/MagicMove";

type ProcessPulsesProps = {
	second_stage?: boolean;
};
export const ProcessPulses = (_props: ProcessPulsesProps) => (
	<MagicMove stages={stages} lang="elixir" file_name="process_pulses.ex" />
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
       [{module, pulse, sender} | rest_pulses],
       modules_map
     ) do
end
`,
	},
	{
		label: "Get module from map",
		code: `
defp process_pulse(
       [{module, pulse, sender} | rest_pulses],
       modules_map
     ) do
  modules_map
  # Get and update key, in one pass
  |> Map.get_and_update(module, fn module_details -> {nil, nil} end)
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
       [{module, pulse, sender} | rest_pulses],
       modules_map
     ) do
  modules_map
  |> Map.get_and_update(module, fn
    # flip-flop module, when in :off state
    {:flip, dest_mods, :off} when pulse == :low ->
      dest_mods
	end)
end
`,
	},
	{
		label: (
			<>
				<Code>:high</Code> pulse for all <Code>dest_mods</Code>
			</>
		),
		code: `
defp process_pulse(
       [{module, pulse, sender} | rest_pulses],
       modules_map
     ) do
  modules_map
  |> Map.get_and_update(module, fn
    # flip-flop module, when in :off state
    {:flip, dest_mods, :off} when pulse == :low ->
      dest_mods
      # send :high pulse to all destination modules
      |> Enum.map(&{&1, :high, module})
	end)
end
`,
	},
	{
		label: (
			<>
				Update <Code>module</Code> to <Code>:on</Code> state
			</>
		),
		code: `
defp process_pulse(
       [{module, pulse, sender} | rest_pulses],
       modules_map
     ) do
  modules_map
  |> Map.get_and_update(module, fn
    # flip-flop module, when in :off state
    {:flip, dest_mods, :off} when pulse == :low ->
      dest_mods
      # send :high pulse to all destination modules
      |> Enum.map(&{&1, :high, module})
      # second tuple element is updated key value in map
      |> then(&{&1, {:flip, dest_mods, :on}})
	end)
end
`,
	},
	{
		label: (
			<>
				Process flip-flop modules in <Code>:on</Code> state
			</>
		),
		code: `
defp process_pulse(
       [{module, pulse, sender} | rest_pulses],
       modules_map
     ) do
  modules_map
  |> Map.get_and_update(module, fn
    # flip-flop module, when in :off state
    {:flip, dest_mods, :off} when pulse == :low ->
      dest_mods
      # send :high pulse to all destination modules
      |> Enum.map(&{&1, :high, module})
      # second tuple element is updated key value in map
      |> then(&{&1, {:flip, dest_mods, :on}})

    # flip-flop modules, when in :on state
    {:flip, dest_mods, :on} when pulse == :low ->
      dest_mods
      |> Enum.map(&{&1, :low, module})
      |> then(&{&1, {:flip, dest_mods, :off}})
	end)
end
`,
	},
	{
		label: (
			<>
				Pattern match <Code>:conj</Code> module
			</>
		),
		code: `
defp process_pulse(
       [{module, pulse, sender} | rest_pulses],
       modules_map
     ) do
  modules_map
  |> Map.get_and_update(module, fn
    # flip-flop module, when in :off state
    {:flip, dest_mods, :off} when pulse == :low ->
      dest_mods
      # send :high pulse to all destination modules
      |> Enum.map(&{&1, :high, module})
      # second tuple element is updated key value in map
      |> then(&{&1, {:flip, dest_mods, :on}})

    # flip-flop modules, when in :on state
    {:flip, dest_mods, :on} when pulse == :low ->
      dest_mods
      |> Enum.map(&{&1, :low, module})
      |> then(&{&1, {:flip, dest_mods, :off}})

    # conjunction module
    {:conj, dest_mods, inputs} ->
      inputs
  end)
end
`,
	},
	{
		label: (
			<>
				Update <Code>inputs</Code> map with pulse
			</>
		),
		code: `
defp process_pulse(
       [{module, pulse, sender} | rest_pulses],
       modules_map
     ) do
  modules_map
  |> Map.get_and_update(module, fn
    # flip-flop module, when in :off state
    {:flip, dest_mods, :off} when pulse == :low ->
      dest_mods
      # send :high pulse to all destination modules
      |> Enum.map(&{&1, :high, module})
      # second tuple element is updated key value in map
      |> then(&{&1, {:flip, dest_mods, :on}})

    # flip-flop modules, when in :on state
    {:flip, dest_mods, :on} when pulse == :low ->
      dest_mods
      |> Enum.map(&{&1, :low, module})
      |> then(&{&1, {:flip, dest_mods, :off}})

    # conjunction module
    {:conj, dest_mods, inputs} ->
      inputs
      |> Map.put(sender, pulse)
  end)
end
`,
	},
	{
		label: (
			<>
				Check if inputs are all <Code>:high</Code>
			</>
		),
		code: `
defp process_pulse(
       [{module, pulse, sender} | rest_pulses],
       modules_map
     ) do
  modules_map
  |> Map.get_and_update(module, fn
    # flip-flop module, when in :off state
    {:flip, dest_mods, :off} when pulse == :low ->
      dest_mods
      # send :high pulse to all destination modules
      |> Enum.map(&{&1, :high, module})
      # second tuple element is updated key value in map
      |> then(&{&1, {:flip, dest_mods, :on}})

    # flip-flop modules, when in :on state
    {:flip, dest_mods, :on} when pulse == :low ->
      dest_mods
      |> Enum.map(&{&1, :low, module})
      |> then(&{&1, {:flip, dest_mods, :off}})

    # conjunction module
    {:conj, dest_mods, inputs} ->
      inputs
      |> Map.put(sender, pulse)
  end)
end

# ? at the end denotes the function will return a boolean value
defp check_if_all_inputs_high?(map) do
  map
  |> Map.values()
  |> Enum.all?(&(&1 == :high))
end
`,
	},
	{
		label: (
			<>
				<Code>:low</Code> pulse for all <Code>dest_mods</Code>
			</>
		),
		code: `
defp process_pulse(
       [{module, pulse, sender} | rest_pulses],
       modules_map
     ) do
  modules_map
  |> Map.get_and_update(module, fn
    # flip-flop module, when in :off state
    {:flip, dest_mods, :off} when pulse == :low ->
      dest_mods
      # send :high pulse to all destination modules
      |> Enum.map(&{&1, :high, module})
      # second tuple element is updated key value in map
      |> then(&{&1, {:flip, dest_mods, :on}})

    # flip-flop modules, when in :on state
    {:flip, dest_mods, :on} when pulse == :low ->
      dest_mods
      |> Enum.map(&{&1, :low, module})
      |> then(&{&1, {:flip, dest_mods, :off}})

    # conjunction module
    {:conj, dest_mods, inputs} ->
      inputs
      |> Map.put(sender, pulse)
      |> then(fn updated_inputs ->
        cond do
          check_if_all_inputs_high?(updated_inputs) ->
            dest_mods
            |> Enum.map(&{&1, :low, module})
        end
      end)
  end)
end

# ? at the end denotes the function will return a boolean value
defp check_if_all_inputs_high?(map) do
  map
  |> Map.values()
  |> Enum.all?(&(&1 == :high))
end
`,
	},
	{
		label: (
			<>
				Otherwise, <Code>:low</Code> pulse
			</>
		),
		code: `
defp process_pulse(
       [{module, pulse, sender} | rest_pulses],
       modules_map
     ) do
  modules_map
  |> Map.get_and_update(module, fn
    # flip-flop module, when in :off state
    {:flip, dest_mods, :off} when pulse == :low ->
      dest_mods
      # send :high pulse to all destination modules
      |> Enum.map(&{&1, :high, module})
      # second tuple element is updated key value in map
      |> then(&{&1, {:flip, dest_mods, :on}})

    # flip-flop modules, when in :on state
    {:flip, dest_mods, :on} when pulse == :low ->
      dest_mods
      |> Enum.map(&{&1, :low, module})
      |> then(&{&1, {:flip, dest_mods, :off}})

    # conjunction module
    {:conj, dest_mods, inputs} ->
      inputs
      |> Map.put(sender, pulse)
      |> then(fn updated_inputs ->
        cond do
          check_if_all_inputs_high?(updated_inputs) ->
            dest_mods
            |> Enum.map(&{&1, :low, module})

          true ->
            dest_mods
            |> Enum.map(&{&1, :high, module})
        end
      end)
  end)
end

# ? at the end denotes the function will return a boolean value
defp check_if_all_inputs_high?(map) do
  map
  |> Map.values()
  |> Enum.all?(&(&1 == :high))
end
`,
	},
	{
		label: (
			<>
				Update map with <Code>updated_inputs</Code>
			</>
		),
		code: `
defp process_pulse(
       [{module, pulse, sender} | rest_pulses],
       modules_map
     ) do
  modules_map
  |> Map.get_and_update(module, fn
    # flip-flop module, when in :off state
    {:flip, dest_mods, :off} when pulse == :low ->
      dest_mods
      # send :high pulse to all destination modules
      |> Enum.map(&{&1, :high, module})
      # second tuple element is updated key value in map
      |> then(&{&1, {:flip, dest_mods, :on}})

    # flip-flop modules, when in :on state
    {:flip, dest_mods, :on} when pulse == :low ->
      dest_mods
      |> Enum.map(&{&1, :low, module})
      |> then(&{&1, {:flip, dest_mods, :off}})

    # conjunction module
    {:conj, dest_mods, inputs} ->
      inputs
      |> Map.put(sender, pulse)
      |> then(fn updated_inputs ->
        cond do
          check_if_all_inputs_high?(updated_inputs) ->
            dest_mods
            |> Enum.map(&{&1, :low, module})

          true ->
            dest_mods
            |> Enum.map(&{&1, :high, module})
        end
        |> then(&{&1, {:conj, dest_mods, updated_inputs}})
      end)
  end)
end

# ? at the end denotes the function will return a boolean value
defp check_if_all_inputs_high?(map) do
  map
  |> Map.values()
  |> Enum.all?(&(&1 == :high))
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
