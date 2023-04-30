// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Hello from Functions!");

serve(async (request: Request) => {
	// This is needed if you're planning to invoke your function from a browser.
	if (request.method === "OPTIONS") {
		console.log("Rcvd OPTIONS");

		return new Response("ok", { headers: corsHeaders });
	}

	try {
		console.log("HELLO! Trying ==>");

		// Create a Supabase client with the Auth context of the logged in user.
		const supabaseClient = createClient(
			// Supabase API URL - env var exported by default.
			Deno.env.get("SUPABASE_URL") ?? "",
			// Supabase API ANON KEY - env var exported by default.
			Deno.env.get("SUPABASE_ANON_KEY") ?? "",
			// Create client with Auth context of the user that called the function.
			// This way your row-level-security (RLS) policies are applied.
			{ global: { headers: { Authorization: request.headers.get("Authorization")! } } }
		);

		const { searchParams } = new URL(request.url);
		const slug = searchParams.get("slug");

		if (slug === null) {
			return Response.json(
				{ error: 'Request is missing required "slug" param' },
				{ headers: corsHeaders, status: 400 }
			);
		} else {
			const { data, error } = await supabaseClient
				.from("page_details")
				.select("view_count")
				.eq("slug", slug)
				.limit(1)
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					// captureException(error);
					return Response.json(
						{
							view_count: 0,
							message: `Page '${slug}' has not been added to Supabase yet`,
						},
						{ status: 200 }
					);
				} else {
					// captureException(error);
					return Response.json(
						{ error, message: Deno.env.get("SUPABASE_URL") },
						{ headers: corsHeaders, status: 500 }
					);
				}
			} else {
				const { view_count } = data;
				return Response.json({ view_count }, { headers: corsHeaders, status: 200 });
			}
		}

		// return new Response(JSON.stringify({ user, data }), {
		// 	headers: { ...corsHeaders, "Content-Type": "application/json" },
		// 	status: 200,
		// });
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			headers: { ...corsHeaders, "Content-Type": "application/json" },
			status: 400,
		});
	}
});
