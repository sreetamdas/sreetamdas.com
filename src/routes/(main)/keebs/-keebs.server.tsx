import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";

import { Image } from "@/lib/components/Image";
import { type KeebDetails } from "@/lib/domains/Imgur";
import { getKeebsFromNotion, type KeebDetailsFromNotion } from "@/lib/domains/keebs";

export const getKeebsRenderable = createServerFn({ method: "GET" })
	.middleware([staticFunctionMiddleware])
	.handler(async () => {
		const keebs = await getKeebsFromNotion();
		const Renderable = await renderServerComponent(<KeebsList keebs={keebs} />);

		return { Renderable };
	});

function KeebsList({ keebs }: { keebs: Array<KeebDetails | KeebDetailsFromNotion> }) {
	return (
		<>
			{keebs.length === 0 ? (
				<p className="pb-8">Keyboard data is temporarily unavailable in this preview deployment.</p>
			) : null}

			<section className="grid gap-16">
				{keebs.map(({ name, tags, image }) => (
					<article key={name.toLowerCase().replace(" ", "-")} className="grid gap-4">
						<div className="grid grid-flow-col items-center justify-between gap-8">
							<h3 className="pt-0 font-serif text-3xl font-medium tracking-tight">{name}</h3>
							<span className="flex gap-2">
								{tags.map((tag) => (
									<span
										key={tag.name}
										className="rounded-global bg-primary px-2 py-0 font-mono text-sm text-background"
									>
										{tag.name}
									</span>
								))}
							</span>
						</div>
						{image.url ? (
							"height" in image ? (
								<Image src={image.url} alt={name} height={image.height} width={image.width} />
							) : (
								<Image src={image.url} alt={name} />
							)
						) : null}
					</article>
				))}
			</section>
		</>
	);
}
