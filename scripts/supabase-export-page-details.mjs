import { writeFile } from "node:fs/promises";

function getArgValue(flag) {
	const idx = process.argv.indexOf(flag);
	if (idx === -1) return undefined;
	const value = process.argv[idx + 1];
	if (!value || value.startsWith("--")) return undefined;
	return value;
}

const outPath = getArgValue("--out") ?? "./supabase-page_details.json";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY;

if (!SUPABASE_URL) {
	throw new Error("Missing SUPABASE_URL in env");
}

if (!SUPABASE_KEY) {
	throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY) in env");
}

const SUPABASE_API_BASE_URL = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1`;
const supabaseHeaders = {
	apikey: SUPABASE_KEY,
	Authorization: `Bearer ${SUPABASE_KEY}`,
};

const PAGE_SIZE = Number(getArgValue("--page-size") ?? "1000");

async function fetchPage(offset) {
	const params = new URLSearchParams({
		select: "slug,view_count,likes,created_at,updated_at",
		limit: String(PAGE_SIZE),
		offset: String(offset),
		order: "id.asc",
	});

	const res = await fetch(`${SUPABASE_API_BASE_URL}/page_details?${params.toString()}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			...supabaseHeaders,
		},
	});

	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(`Supabase export failed: ${res.status} ${res.statusText}\n${body}`);
	}

	return /** @type {Array<any>} */ (await res.json());
}

/**
 * Exports the entire `page_details` table into a JSON file.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/supabase-export-page-details.mjs --out ./page_details.json
 */
const allRows = [];

for (let offset = 0; ; offset += PAGE_SIZE) {
	const rows = await fetchPage(offset);
	if (rows.length === 0) break;
	allRows.push(...rows);
}

await writeFile(outPath, JSON.stringify(allRows, null, 2) + "\n", "utf8");
console.log(`Exported ${allRows.length} rows to ${outPath}`);
