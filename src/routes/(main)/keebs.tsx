import { type PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { isEmpty, isUndefined } from "lodash-es";

import { SITE_TITLE_APPEND } from "@/config";
import { Image } from "@/lib/components/Image";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { ImgurClient, type KeebDetails } from "@/lib/domains/Imgur";
import { NotionClient } from "@/lib/domains/Notion";
import { createFileRoute } from "@tanstack/react-router";

const KEEBS_DATABASE_ID = import.meta.env.VITE_NOTION_KEEBS_PAGE_ID;

export const Route = createFileRoute("/(main)/keebs")({
	component: KeebsPage,
	loader: async () => {
		const keebs = await getKeebsFromNotion();
		return { keebs };
	},
	head: () => ({
		meta: [
			{
				title: `Keebs ${SITE_TITLE_APPEND}`,
			},
			{
				name: "description",
				content: "A collection of my mechanical keyboards",
			},
		],
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
	const notionClient = new NotionClient({ token: import.meta.env.VITE_NOTION_TOKEN });
	const imgurClient = new ImgurClient({
		client_id: import.meta.env.VITE_IMGUR_API_CLIENT_ID,
		album_url: import.meta.env.VITE_IMGUR_KEEBS_ALBUM_HASH,
	});

	if (isUndefined(KEEBS_DATABASE_ID) || isEmpty(KEEBS_DATABASE_ID)) {
		throw new Error("Keebs database ID is undefined");
	}

	const { results } = await notionClient.queryDatabase(KEEBS_DATABASE_ID, {
		filter: {
			and: [
				{ property: "Bought", checkbox: { equals: true } },
				{ property: "Type", multi_select: { does_not_contain: "Switches" } },
			],
		},
		filter_properties: propertiesToRetrieve,
	});

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
