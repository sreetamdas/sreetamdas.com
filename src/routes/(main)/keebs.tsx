import { type PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { isEmpty, isUndefined } from "lodash-es";

import { SITE_TITLE_APPEND } from "@/config";
import { Image } from "@/lib/components/Image";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { ImgurClient, type KeebDetails } from "@/lib/domains/Imgur";
import { NotionClient } from "@/lib/domains/Notion";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

export const Route = createFileRoute("/(main)/keebs")({
	component: KeebsPage,
	staleTime: 1000 * 60 * 15,
	loader: () => getKeebsRenderable(),
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

const getKeebsRenderable = createServerFn({ method: "GET" })
	.middleware([staticFunctionMiddleware])
	.handler(async ({ context }) => {
		const keebs = await getKeebsFromNotion(context.env);
		const Renderable = await renderServerComponent(<KeebsList keebs={keebs} />);

		return { Renderable };
	});

function KeebsPage() {
	const { Renderable } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold">/keebs</h1>
			{Renderable}
			<ViewsCounter />
		</>
	);
}

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
		</>
	);
}

import { readEnvString } from "@/lib/helpers/utils";

const propertiesToRetrieve = ["Name", "Type", "Image"];

async function getKeebsFromNotion(
	env: CloudflareEnv,
): Promise<Array<KeebDetails | KeebDetailsFromNotion>> {
	const keebsDatabaseId = readEnvString(env, ["NOTION_KEEBS_PAGE_ID"]);
	const notionToken = readEnvString(env, ["NOTION_TOKEN"]);
	const imgurApiClientId = readEnvString(env, ["IMGUR_API_CLIENT_ID"]);
	const imgurKeebsAlbumHash = readEnvString(env, ["IMGUR_KEEBS_ALBUM_HASH"]);

	// oxlint-disable-next-line no-console
	console.log("[keebs] env presence", {
		hasKeebsDatabaseId: !isUndefined(keebsDatabaseId) && !isEmpty(keebsDatabaseId),
		hasNotionToken: !isUndefined(notionToken) && !isEmpty(notionToken),
		hasImgurApiClientId: !isUndefined(imgurApiClientId) && !isEmpty(imgurApiClientId),
		hasImgurKeebsAlbumHash: !isUndefined(imgurKeebsAlbumHash) && !isEmpty(imgurKeebsAlbumHash),
	});

	if (isUndefined(keebsDatabaseId) || isEmpty(keebsDatabaseId)) {
		// oxlint-disable-next-line no-console
		console.log("[keebs] missing Notion database id");
		return [];
	}

	if (isUndefined(notionToken) || isEmpty(notionToken)) {
		// oxlint-disable-next-line no-console
		console.log("[keebs] missing Notion token");
		return [];
	}

	const notionClient = new NotionClient({ token: notionToken });

	let results: Awaited<ReturnType<typeof notionClient.queryDatabase>>["results"] = [];
	try {
		const response = await notionClient.queryDatabase(keebsDatabaseId, {
			filter: {
				and: [
					{ property: "Bought", checkbox: { equals: true } },
					{ property: "Type", multi_select: { does_not_contain: "Switches" } },
				],
			},
			filter_properties: propertiesToRetrieve,
		});
		results = response.results;
	} catch (error) {
		// oxlint-disable-next-line no-console
		console.error("[keebs] failed to query Notion", error);
		return [];
	}

	const keebsDetailsFormatted = results
		.map((keebDetails) => {
			const partial = Object.keys(keebDetails.properties).reduce<Partial<KeebDetailsFromNotion>>(
				(details, property) => {
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
				},
				{},
			);

			return partial;
		})
		.filter((entry): entry is KeebDetailsFromNotion => isKeebDetailsFromNotion(entry));

	if (
		isUndefined(imgurApiClientId) ||
		isEmpty(imgurApiClientId) ||
		isUndefined(imgurKeebsAlbumHash) ||
		isEmpty(imgurKeebsAlbumHash)
	) {
		// oxlint-disable-next-line no-console
		console.log("[keebs] skipping Imgur enrichment (missing env)");
		return keebsDetailsFormatted;
	}

	const imgurClient = new ImgurClient({
		client_id: imgurApiClientId,
		album_url: imgurKeebsAlbumHash,
	});

	try {
		return await imgurClient.addImgurImagesData(keebsDetailsFormatted);
	} catch (error) {
		// oxlint-disable-next-line no-console
		console.error("[keebs] failed to enrich images from Imgur", error);
		return keebsDetailsFormatted;
	}
}

type PageObjectResponseProperty =
	PageObjectResponse["properties"][keyof PageObjectResponse["properties"]];
function getTitlePlainText(input: Extract<PageObjectResponseProperty, { type: "title" }>) {
	return input.title[0].plain_text;
}

function isKeebDetailsFromNotion(
	value: Partial<KeebDetailsFromNotion>,
): value is KeebDetailsFromNotion {
	if (typeof value.name !== "string") {
		return false;
	}

	if (!Array.isArray(value.tags)) {
		return false;
	}

	if (
		typeof value.image !== "object" ||
		value.image === null ||
		typeof value.image.url !== "string"
	) {
		return false;
	}

	return true;
}

function getMultiSelectNames(input: Extract<PageObjectResponseProperty, { type: "multi_select" }>) {
	return input.multi_select.map(({ name }) => ({ name }));
}

function getFiles(input: Extract<PageObjectResponseProperty, { type: "files" }>) {
	return input.files
		.map((item) => {
			if (item.type === "external") return item.external.url;
			return item.file.url;
		})
		.filter((value): value is string => typeof value === "string" && value.length > 0);
}
