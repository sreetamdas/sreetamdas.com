import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (supabaseUrl === "" || supabaseAnonKey === "") {
	// throw new Error("This project needs Supabase to be set-up in order to run properly.", {
	// 	cause: "Missing env variables Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
	// });
}

export const supabaseEnabled =
	typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== "undefined" &&
	process.env.NEXT_PUBLIC_SUPABASE_URL !== "" &&
	typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "undefined" &&
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "";

const supabaseClient = supabaseEnabled
	? createClient<Database>(supabaseUrl, supabaseAnonKey)
	: undefined;

type SupabaseClientUnknown =
	| {
			enabled: true;
			supabaseClient: SupabaseClient<Database>;
	  }
	| {
			enabled: false;
			supabaseClient: undefined;
	  };

export function getSupabaseClient(): SupabaseClientUnknown {
	if (supabaseEnabled && typeof supabaseClient !== "undefined") {
		return {
			enabled: true,
			supabaseClient: supabaseClient,
		};
	}
	return {
		enabled: false,
		supabaseClient: undefined,
	};
}
