import { SITE_OG_IMAGE, SITE_URL } from "@/config";

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
	if (pathname === "/") return SITE_URL;
	return absoluteUrl(pathname);
}

export function defaultOgImageUrl() {
	return absoluteUrl(SITE_OG_IMAGE);
}
