/**
 * Used for:
 * - Loading keebs' images info from Imgur API
 */

import { captureException } from "@sentry/nextjs";
import axios from "axios";

const IMGUR_BASE_URL = "https://api.imgur.com/3";
const IMGUR_API_CLIENT_ID = process.env.IMGUR_API_CLIENT_ID;

export const axiosImgur = axios.create({
	baseURL: IMGUR_BASE_URL,
	headers: {
		Authorization: `Client-ID ${IMGUR_API_CLIENT_ID}`,
	},
});

export interface ImgurImage {
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

export async function getImgurAlbumImages(albumURL: string) {
	try {
		const response = await axiosImgur.get<ImgurAPIResponse<ImgurImage[]>>(
			`/album/${albumURL}/images`
		);

		return response.data.data;
	} catch (error) {
		captureException(error);
	}
}
