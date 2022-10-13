import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (supabaseUrl === "" || supabaseAnonKey === "") {
	throw new Error("This project needs Supabase to be set-up in order to run properly.", {
		cause: "Missing env variables Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
	});
}

export const SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
