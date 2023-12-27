/**
 * Used for:
 * - Loading keebs' images info from Imgur API
 */

import { isEmpty, isUndefined } from "lodash-es";

import { type KeebDetailsFromNotion } from "@/app/(main)/keebs/page";

export type KeebDetails = {
	name: string;
	tags: Array<{ name: string }>;
	image: {
		url: string;
		height: number;
		width: number;
	};
};

type ImgurClientOptions = {
	client_id?: string;
	base_url?: string;
	album_url?: string;
};
export class ImgurClient {
	private client_id: string;
	base_url: string;
	album_url: string;

	constructor({ base_url = "https://api.imgur.com/3", client_id, album_url }: ImgurClientOptions) {
		if (isUndefined(client_id) || isEmpty(client_id)) {
			throw new Error("Imgur API client ID is missing");
		}
		if (isUndefined(album_url) || isEmpty(album_url)) {
			throw new Error("Imgur target album is undefined");
		}

		this.client_id = client_id;
		this.base_url = base_url;
		this.album_url = album_url;
	}

	async getImgurAlbumImages() {
		const request = await fetch(`${this.base_url}/album/${this.album_url}/images`, {
			method: "GET",
			headers: {
				Authorization: `Client-ID ${this.client_id}`,
			},
			cache: "default",
		});

		const response: ImgurAPIResponse<Array<ImgurImage>> = await request.json();
		return response.data;
	}

	async addImgurImagesData(
		imagesData: Array<KeebDetailsFromNotion>,
	): Promise<Array<KeebDetails | KeebDetailsFromNotion>> {
		const albumImagesData = await this.getImgurAlbumImages();

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
}

interface ImgurImage {
	id: string;
	title: null;
	description: null;
	datetime: number;
	type: string;
	animated: boolean;
	width: number;
	height: number;
	size: number;
	views: number;
	bandwidth: number;
	vote: null;
	favorite: boolean;
	nsfw: null;
	section: null;
	account_url: null;
	account_id: null;
	is_ad: boolean;
	in_most_viral: boolean;
	has_sound: boolean;
	tags: unknown[];
	ad_type: number;
	ad_url: string;
	edited: string;
	in_gallery: boolean;
	deletehash: string;
	name: string;
	link: string;
}

interface ImgurAPIResponse<Type> {
	data: Type;
	status: number;
	success: boolean;
}
