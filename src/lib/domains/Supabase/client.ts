import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (supabaseUrl === "" || supabaseAnonKey === "") {
	// TODO Fix error when Supabase is not initialized
	// throw new Error("This project needs Supabase to be set-up in order to run properly.", {
	// 	cause: "Missing env variables Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
	// });
}

export const supabaseEnabled =
	typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== "undefined" &&
	process.env.NEXT_PUBLIC_SUPABASE_URL !== "" &&
	typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "undefined" &&
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "";

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: false,
	},
});
