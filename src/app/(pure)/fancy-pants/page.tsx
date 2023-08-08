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
			<h1 className="font-mono font-black leading-normal -tracking-[0.065em] [font-size:clamp(4rem,_10vw,_10rem)]">
				<ChameleonHighlight>Sreetam Das</ChameleonHighlight>
			</h1>
			<p className="w-3/4 font-serif text-7xl leading-normal">
				is a{" "}
				<ChameleonHighlight className="font-mono font-black -tracking-[0.065em]">
					Senior Software Tinkerer
				</ChameleonHighlight>
				<br />
				working{" "}
				<ChameleonHighlight className="font-mono font-black -tracking-[0.065em]">
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
				<ChameleonHighlight className="font-mono font-black -tracking-[0.065em]">
					React
				</ChameleonHighlight>
				,{" "}
				<ChameleonHighlight className="font-mono font-black -tracking-[0.065em]">
					TypeScript
				</ChameleonHighlight>
				,{" "}
				<ChameleonHighlight className="font-mono font-black -tracking-[0.065em]">
					Elixir
				</ChameleonHighlight>
				,{" "}
				<ChameleonHighlight className="font-mono font-black -tracking-[0.065em]">
					Svelte
				</ChameleonHighlight>{" "}
				and <br />
				<ChameleonHighlight className="font-mono font-black -tracking-[0.065em]">
					Mechanical keyboards
				</ChameleonHighlight>
				.
			</p>
		</section>
	);
}
