import axios from "axios";

import { PostDetails } from "@/typings/blog";

/**
 * Upsert page views using `/api/page/add-view`
 * @param path page pathname
 * @returns page views
 */
export async function updateAndGetViewCount(path: string) {
	return (
		await axios.post<Pick<PostDetails, "view_count">>("/api/page/add-view", {
			page_slug: path,
		})
	).data;
}

/**
 * Get page views using `/api/page/get-views`
 * @param path page pathname
 * @returns page views
 */
export async function getViewCount(path: string) {
	return (
		await axios.get<Pick<PostDetails, "view_count">>("/api/page/get-views", {
			params: { slug: path },
		})
	).data;
}
