import { createClient } from "@supabase/supabase-js";

import { randomAlphanumeric } from "@/utils/hooks";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export function getSupabaseFileURL(filename: string) {
	return `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}/storage/v1/object/public/${filename}`;
}

type UploadFileToSupabaseProps = { bucket?: string; path?: string; useExactFilename?: boolean };
export async function uploadFileToSupabase(
	image: File,
	{ bucket = "public", path = "/", useExactFilename = false }: UploadFileToSupabaseProps
) {
	const RE_filenameExtension = /(.+)(\.[^.]+?)$/;
	const [, filename, fileExtension] = RE_filenameExtension.exec(image.name) ?? [];

	const filenameToUpload = useExactFilename
		? `${path}${filename}${fileExtension}`
		: `${path}${filename}-${randomAlphanumeric()}${fileExtension}`;

	return await supabaseClient.storage.from(bucket).upload(filenameToUpload, image);
}
