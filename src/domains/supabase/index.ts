import { createClient } from "@supabase/supabase-js";

import { randomAlphanumeric } from "@/utils/hooks";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

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
