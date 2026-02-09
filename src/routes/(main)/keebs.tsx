import { type PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { isEmpty, isUndefined } from "lodash-es";

import { SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";
import { Image } from "@/lib/components/Image";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { ImgurClient, type KeebDetails } from "@/lib/domains/Imgur";
import { NotionClient } from "@/lib/domains/Notion";
import { createFileRoute } from "@tanstack/react-router";

const KEEBS_DATABASE_ID =
	process.env.VITE_NOTION_KEEBS_PAGE_ID ??
	process.env.NOTION_KEEBS_PAGE_ID ??
	import.meta.env.VITE_NOTION_KEEBS_PAGE_ID;

const NOTION_TOKEN =
	process.env.VITE_NOTION_TOKEN ?? process.env.NOTION_TOKEN ?? import.meta.env.VITE_NOTION_TOKEN;
const IMGUR_API_CLIENT_ID =
	process.env.VITE_IMGUR_API_CLIENT_ID ??
	process.env.IMGUR_API_CLIENT_ID ??
	import.meta.env.VITE_IMGUR_API_CLIENT_ID;
const IMGUR_KEEBS_ALBUM_HASH =
	process.env.VITE_IMGUR_KEEBS_ALBUM_HASH ??
	process.env.IMGUR_KEEBS_ALBUM_HASH ??
	import.meta.env.VITE_IMGUR_KEEBS_ALBUM_HASH;

export const Route = createFileRoute("/(main)/keebs")({
	component: KeebsPage,
	loader: async () => {
		const keebs = await getKeebsFromNotion();
		return { keebs };
	},
	head: () => ({
		links: [{ rel: "canonical", href: canonicalUrl("/keebs") }],
		meta: (() => {
			const title = `Keebs ${SITE_TITLE_APPEND}`;
			const description = "A collection of my mechanical keyboards";
			const canonical = canonicalUrl("/keebs");
			const ogImage = defaultOgImageUrl();

			return [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: canonical },
				{ property: "og:image", content: ogImage },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: ogImage },
			];
		})(),
	}),
});

export type KeebDetailsFromNotion = Omit<KeebDetails, "image"> & {
	image: Omit<KeebDetails["image"], "height" | "width">;
};

async function KeebsPage() {
	const { keebs } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">/keebs</h1>
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
										className="rounded-global bg-primary text-background px-2 py-0 font-mono text-sm"
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

			<ViewsCounter />
		</>
	);
}

const propertiesToRetrieve = ["Name", "Type", "Image"];
async function getKeebsFromNotion(): Promise<Array<KeebDetails | KeebDetailsFromNotion>> {
	if (
		isUndefined(KEEBS_DATABASE_ID) ||
		isEmpty(KEEBS_DATABASE_ID) ||
		isUndefined(NOTION_TOKEN) ||
		isEmpty(NOTION_TOKEN) ||
		isUndefined(IMGUR_API_CLIENT_ID) ||
		isEmpty(IMGUR_API_CLIENT_ID) ||
		isUndefined(IMGUR_KEEBS_ALBUM_HASH) ||
		isEmpty(IMGUR_KEEBS_ALBUM_HASH)
	) {
		return [];
	}

	const notionClient = new NotionClient({ token: NOTION_TOKEN });
	const imgurClient = new ImgurClient({
		client_id: IMGUR_API_CLIENT_ID,
		album_url: IMGUR_KEEBS_ALBUM_HASH,
	});

	let results: Awaited<ReturnType<typeof notionClient.queryDatabase>>["results"] = [];
	try {
		const response = await notionClient.queryDatabase(KEEBS_DATABASE_ID, {
			filter: {
				and: [
					{ property: "Bought", checkbox: { equals: true } },
					{ property: "Type", multi_select: { does_not_contain: "Switches" } },
				],
			},
			filter_properties: propertiesToRetrieve,
		});
		results = response.results;
	} catch {
		return [];
	}

	const keebsDetailsFormatted = results?.map((keebDetails) => {
		const keebDetailsFormatted = Object.keys(keebDetails.properties).reduce((details, property) => {
			const propertyValue = keebDetails.properties[property];

			if (propertyValue.type === "title") {
				details.name = getTitlePlainText(propertyValue);
			}
			if (propertyValue?.type === "files") {
				details.image = { url: getFiles(propertyValue)[0] };
			}
			if (propertyValue?.type === "multi_select") {
				details.tags = getMultiSelectNames(propertyValue);
			}

			return details;
		}, {} as KeebDetailsFromNotion);

		return keebDetailsFormatted;
	});

	return await imgurClient.addImgurImagesData(keebsDetailsFormatted);
}

type PageObjectResponseProperty =
	PageObjectResponse["properties"][keyof PageObjectResponse["properties"]];
function getTitlePlainText(input: Extract<PageObjectResponseProperty, { type: "title" }>) {
	return input.title[0].plain_text;
}

function getMultiSelectNames(input: Extract<PageObjectResponseProperty, { type: "multi_select" }>) {
	return input.multi_select.map(({ name }) => ({ name }));
}

function getFiles(input: Extract<PageObjectResponseProperty, { type: "files" }>) {
	return input.files.map((item) => item.name);
}
