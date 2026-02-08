import { IS_DEV } from "@/config";

export type PageViewCount = {
  view_count: number;
};

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  import.meta.env.VITE_SUPABASE_URL ??
  "";

const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "";

const SUPABASE_ENABLED = SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";

export const SUPABASE_API_BASE_URL = `${SUPABASE_URL}/rest/v1`;

const supabase_headers = {
  apiKey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

/**
 * Get page view_count
 * @param slug page slug
 * @returns Get page view_count
 */
export async function getPageViews(slug: string): Promise<PageViewCount> {
  if (!SUPABASE_ENABLED) {
    throw new Error("Supabase is not initialized", {
      cause: {
        url: SUPABASE_URL,
        key: SUPABASE_ANON_KEY,
      },
    });
  }

  const params = new URLSearchParams({
    slug: `eq.${slug}`,
    select: "view_count",
    limit: "1",
  });

  // eslint-disable-next-line no-console
  console.log("GET", slug);

  const request = await fetch(
    `${SUPABASE_API_BASE_URL}/page_details?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...supabase_headers,
      },
      ...(!IS_DEV && { cache: "no-store" }),
    },
  );

  const response = (await request.json()) as Array<PageViewCount>;
  const data = response[0];

  if (typeof data === "undefined") {
    throw new Error("Page has not been added to the database yet", {
      cause: { data: "undefined" },
    });
  }

  return data;
}

/**
 * Upsert page view_count
 * @param slug page slug
 * @returns upserted page view_count after incrementing
 */
export async function upsertPageViews(slug: string): Promise<PageViewCount> {
  if (!SUPABASE_ENABLED) {
    console.error({
      url: SUPABASE_URL,
      key: SUPABASE_ANON_KEY,
    });

    throw new Error("Supabase is not initialized", {
      cause: {
        url: SUPABASE_URL,
        key: SUPABASE_ANON_KEY,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log("UPSERT", slug);

  const request = await fetch(`${SUPABASE_API_BASE_URL}/rpc/upsert_page_view`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...supabase_headers,
    },
    cache: "no-store",
    body: JSON.stringify({
      page_slug: slug,
    }),
  });

  const view_count = (await request.json()) as number;

  if (typeof view_count === "undefined") {
    throw new Error("Page has not been added to the database yet", {
      cause: { view_count: "undefined" },
    });
  }

  return { view_count };
}
