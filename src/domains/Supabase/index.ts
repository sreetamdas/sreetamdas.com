import { AuthError, createClient, Session, SupabaseClient, User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

import { Database } from "./database.types";

import { OWNER } from "@/config";

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

export const supabaseClient = supabaseEnabled
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

export function useSupabaseSession() {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [error, setError] = useState<AuthError>();
	const [isLoading, setIsLoading] = useState(true);
	const [isAdminUser, setIsAdminUser] = useState<boolean>();
	const { enabled, supabaseClient } = getSupabaseClient();

	useEffect(() => {
		async function getSession() {
			if (!enabled) {
				return;
			}

			const {
				data: { session },
				error,
			} = await supabaseClient.auth.getSession();
			setSession(session);
			setUser(session?.user ?? null);
			setIsAdminUser(session?.user.email === OWNER);

			if (error) {
				setError(error);
				setIsLoading(false);
				return;
			}

			setSession(session);
			setIsLoading(false);

			const {
				data: { subscription },
			} = supabaseClient.auth.onAuthStateChange((event, session) => {
				if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
					setSession(session);
					setUser(session?.user ?? null);
				}

				if (event === "SIGNED_OUT") {
					setSession(null);
					setUser(null);
				}
			});

			return () => {
				subscription.unsubscribe();
			};
		}

		getSession();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { user, session, error, isLoading, isAdminUser };
}
