import { Client as NotionClient } from "@notionhq/client";
import { type PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { isEmpty, isUndefined } from "lodash-es";
import { Suspense } from "react";

import { Image } from "@/lib/components/Image";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { type KeebDetails, ImgurClient } from "@/lib/domains/Imgur";

const KEEBS_DATABASE_ID = process.env.NOTION_KEEBS_PAGE_ID;

export type KeebDetailsFromNotion = Omit<KeebDetails, "image"> & {
	image: Omit<KeebDetails["image"], "height" | "width">;
};

export default async function KeebsPage() {
	const keebs = await getKeebsFromNotion();

	return (
		<>
			<h1 className="pb-20 pt-10 font-serif text-8xl">/keebs</h1>

			<section className="grid gap-16">
				{keebs.map(({ name, tags, image }) => (
					<article key={name.toLowerCase().replace(" ", "-")} className="grid gap-4">
						<div className="grid grid-flow-col items-center justify-between gap-8">
							<h3 className="pt-0 font-serif text-3xl">{name}</h3>
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

			<Suspense>
				<ViewsCounter slug="/keebs" />
			</Suspense>
		</>
	);
}

const propertiesToRetrieve = ["Name", "Image", "Type"] as const;
type PropertiesToRetrieve = (typeof propertiesToRetrieve)[number];
async function getKeebsFromNotion() {
	const notionClient = new NotionClient({ auth: process.env.NOTION_TOKEN });
	const imgurClient = new ImgurClient({
		client_id: process.env.IMGUR_API_CLIENT_ID,
		album_url: process.env.IMGUR_KEEBS_ALBUM_HASH,
	});

	if (isUndefined(KEEBS_DATABASE_ID) || isEmpty(KEEBS_DATABASE_ID)) {
		throw new Error("Keebs database ID is undefined");
	}

	const { results } = await notionClient.databases.query({
		database_id: KEEBS_DATABASE_ID,
		filter: {
			and: [
				{ property: "Bought", checkbox: { equals: true } },
				{ property: "Type", multi_select: { does_not_contain: "Switches" } },
			],
		},
	});

	const keebsDetailsFormatted = (results as Array<PageObjectResponse>)?.map((keebDetails) => {
		const keebDetailsFormatted = (
			Object.keys(keebDetails.properties) as Array<
				PropertiesToRetrieve | (string & Record<never, never>)
			>
		).reduce((details, property) => {
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
