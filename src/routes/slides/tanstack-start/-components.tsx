import { Gradient } from "@/lib/components/Typography";

type Stage = "first" | "second" | "final" | "title";
type Props = { stage: Stage };
export function MainTitle({ stage }: Props) {
	const title = (() => {
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
			case "title":
			default:
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
		}
	})();

	return (
		<h1 className="pt-10 font-serif text-9xl font-bold text-balance whitespace-pre-line font-stretch-semi-condensed">
			<Gradient>{title}</Gradient>
		</h1>
	);
}
