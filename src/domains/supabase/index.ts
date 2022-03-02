import { randomAlphanumeric } from "@/utils/hooks";
import { supabaseClient } from "@/utils/supabaseClient";

export function getSupabaseFileURL(filename: string) {
	return `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}/storage/v1/object/public/${filename}`;
}

type UploadFileToSupabaseProps = { bucket?: string; path?: string; exactFilename?: boolean };
export async function uploadFileToSupabase(
	image: File,
	{ bucket = "public", path = "/", exactFilename = false }: UploadFileToSupabaseProps
) {
	const filename = exactFilename
		? `${path}${image.name}`
		: `${path}${image.name}-${randomAlphanumeric()}`;

	return await supabaseClient.storage.from(bucket).upload(filename, image);
}
