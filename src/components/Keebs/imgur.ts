import { KeebDetailsFromNotion } from "./notion";
import { KeebDetails } from "./types";

import { getImgurAlbumImages } from "@/domains/Imgur";

const imgurKeebsAlbumHash = "3YgT5kD";

export async function addImgurImagesData(
	imagesData: Array<KeebDetailsFromNotion>
): Promise<Array<KeebDetails | KeebDetailsFromNotion>> {
	/**
	 * We're counting on the fact that all the images for the keebs
	 * are stored in the same imgur album
	 */
	const albumImagesData = await getImgurAlbumImages(imgurKeebsAlbumHash);

	const enrichedImagesData = imagesData.map((imageData) => {
		const { image } = imageData;

		const imgurImage = albumImagesData?.find(({ link }) => link === image.url);
		if (typeof imgurImage !== "undefined") {
			return {
				...imageData,
				image: { ...imageData.image, height: imgurImage.height, width: imgurImage.width },
			} as KeebDetails;
		}

		return imageData;
	});
	return enrichedImagesData;
}
