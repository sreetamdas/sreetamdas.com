import { Gradient } from "@/lib/components/Typography";

/**
 * Live star-history chart for sreetamdas.com. Rendered as a React component
 * (not through the MDX `img` mapping) so the external chart URL and the
 * dark/light <picture> sources pass straight through untouched.
 */
export function StarHistory() {
	const base =
		"https://api.star-history.com/chart?repos=sreetamdas/sreetamdas.com&type=date&legend=top-left";
	return (
		<picture>
			<source media="(prefers-color-scheme: dark)" srcSet={`${base}&theme=dark`} />
			<img
				alt="Star history of sreetamdas.com — eight years and counting"
				src={base}
				className="mx-auto max-h-[68vh] w-auto rounded-global"
			/>
		</picture>
	);
}

type Stage = "hello" | "first" | "second" | "final" | "title";
type Props = { stage: Stage };
export function MainTitle({ stage }: Props) {
	const title = (() => {
		switch (stage) {
			case "hello":
				return <>Hello! 👋</>;

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
