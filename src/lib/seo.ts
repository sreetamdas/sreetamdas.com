import { SITE_OG_IMAGE, SITE_URL } from "@/config";
import { normalizePathname } from "@/lib/helpers/utils";

export function absoluteUrl(urlOrPath: string) {
	if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
		return urlOrPath;
	}

	if (urlOrPath.startsWith("//")) {
		return `https:${urlOrPath}`;
	}

	if (urlOrPath.startsWith("/")) {
		return `${SITE_URL}${urlOrPath}`;
	}

	return `${SITE_URL}/${urlOrPath}`;
}

export function canonicalUrl(pathname: string) {
	const normalizedPathname = normalizePathname(pathname);

	if (normalizedPathname === "/") return SITE_URL;
	return absoluteUrl(normalizedPathname);
}

export function defaultOgImageUrl() {
	return absoluteUrl(SITE_OG_IMAGE);
}

/**
 * Derives a plain-text meta description from a Markdown body, used to give each
 * newsletter issue a unique description instead of the generic site one (which
 * Google flags as duplicate/low-value content).
 */
export function excerptFromMarkdown(markdown: string, maxLength = 160): string {
	const text = markdown
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/^\s{0,3}(?:#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
		.replace(/[*_~]+/g, "")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		// Newsletter issues all open with the same "Hello there!" greeting; drop a
		// leading salutation so the description starts with issue-specific content.
		.replace(/^(?:hello|hi|hey)(?:\s+there)?\s*[!.,…]+\s*/i, "");

	if (text.length <= maxLength) return text;

	const truncated = text.slice(0, maxLength);
	const lastSpace = truncated.lastIndexOf(" ");
	const base = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
	return `${base.replace(/[\s.,;:!?-]+$/, "")}…`;
}
