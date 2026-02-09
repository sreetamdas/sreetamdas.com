import { ImArrowUpRight2 } from "react-icons/im";

import { SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";
import { ChameleonHighlight } from "@/lib/components/Typography.client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(pure)/fancy-pants")({
	component: FancyPantsPage,
	head: () => ({
		links: [{ rel: "canonical", href: canonicalUrl("/fancy-pants") }],
		meta: [
			{
				title: `Fancy Pants ${SITE_TITLE_APPEND}`,
			},
			{
				name: "description",
				content: "Sreetam Das' fancy-shmancy landing page",
			},
			{ property: "og:title", content: `Fancy Pants ${SITE_TITLE_APPEND}` },
			{ property: "og:description", content: "Sreetam Das' fancy-shmancy landing page" },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: canonicalUrl("/fancy-pants") },
			{ property: "og:image", content: defaultOgImageUrl() },
			{ name: "twitter:title", content: `Fancy Pants ${SITE_TITLE_APPEND}` },
			{ name: "twitter:description", content: "Sreetam Das' fancy-shmancy landing page" },
			{ name: "twitter:image", content: defaultOgImageUrl() },
		],
	}),
});

function FancyPantsPage() {
	// TODO Set dark mode

	return (
		<section className="p-10">
			<h1 className="font-mono text-[clamp(4rem,10vw,10rem)] leading-normal font-black -tracking-[0.065em]">
				<ChameleonHighlight>Sreetam Das</ChameleonHighlight>
			</h1>
			<p className="w-3/4 font-serif text-7xl leading-none font-bold tracking-tighter">
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
						className="focus-visible:outline-secondary visited:no-underline hover:underline hover:decoration-current hover:decoration-solid focus-visible:outline-8 focus-visible:outline-dashed"
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
