import { ImArrowUpRight2 } from "react-icons/im";

import { SITE_TITLE_APPEND } from "@/config";
import { ChameleonHighlight } from "@/lib/components/Typography.client";

export const metadata = {
	title: `Fancy Pants ${SITE_TITLE_APPEND}`,
	description: "Sreetam Das' fancy-shmancy landing page",
};

export default function FancyPantsPage() {
	// TODO Set dark mode

	return (
		<section className="p-10">
			<h1 className="-tracking-[0.065em] font-black font-mono leading-normal [font-size:clamp(4rem,_10vw,_10rem)]">
				<ChameleonHighlight>Sreetam Das</ChameleonHighlight>
			</h1>
			<p className="w-3/4 font-serif text-7xl leading-normal">
				is a{" "}
				<ChameleonHighlight className="-tracking-[0.065em] font-black font-mono">
					Senior Software Tinkerer
				</ChameleonHighlight>
				<br />
				working{" "}
				<ChameleonHighlight className="-tracking-[0.065em] font-black font-mono">
					<a
						href="https://remote.com"
						target="_blank"
						rel="noreferrer"
						className="visited:no-underline hover:underline hover:decoration-current hover:decoration-solid focus-visible:outline-dashed focus-visible:outline-8 focus-visible:outline-secondary"
					>
						@Remote<span className="sr-only">(opens in a new tab)</span>
						<ImArrowUpRight2 className="inline-block text-3xl" aria-label="opens in a new tab" />
					</a>
				</ChameleonHighlight>{" "}
				who loves{" "}
				<ChameleonHighlight className="-tracking-[0.065em] font-black font-mono">
					React
				</ChameleonHighlight>
				,{" "}
				<ChameleonHighlight className="-tracking-[0.065em] font-black font-mono">
					TypeScript
				</ChameleonHighlight>
				,{" "}
				<ChameleonHighlight className="-tracking-[0.065em] font-black font-mono">
					Elixir
				</ChameleonHighlight>
				,{" "}
				<ChameleonHighlight className="-tracking-[0.065em] font-black font-mono">
					Svelte
				</ChameleonHighlight>{" "}
				and <br />
				<ChameleonHighlight className="-tracking-[0.065em] font-black font-mono">
					Mechanical keyboards
				</ChameleonHighlight>
				.
			</p>
		</section>
	);
}
