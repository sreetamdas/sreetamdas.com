import { Gradient } from "@/lib/components/Typography";

type Stage = "first" | "second" | "final";
type Props = { stage: Stage };
export function MainTitle({ stage }: Props) {
	const Inner = () => {
		switch (stage) {
			case "first":
				return (
					<>
						React
						<br />
						<br />
						<br />
						TanStack Start
					</>
				);

			case "second":
				return (
					<>
						React
						<br />
						with the server
						<br />
						<br />
						TanStack Start
					</>
				);
			case "final":
				return (
					<>
						React
						<br />
						with the server
						<br />
						without compromise:
						<br />
						TanStack Start
					</>
				);

			default:
				break;
		}
	};

	return (
		<h1 className="pt-10 font-serif text-9xl font-bold text-balance whitespace-pre-line font-stretch-semi-condensed">
			<Gradient>
				<Inner />
			</Gradient>
		</h1>
	);
}
