/// <reference types="vite/client" />

interface ViteTypeOptions {
	// By adding this line, you can make the type of ImportMetaEnv strict
	// to disallow unknown keys.
	strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
	readonly VITE_BUTTONDOWN_API_KEY: string;
	readonly VITE_GITHUB_RWC_GIST_ID: string;
	readonly VITE_GITHUB_TOKEN: string;
	readonly VITE_IMGUR_API_CLIENT_ID: string;
	readonly VITE_IMGUR_KEEBS_ALBUM_HASH: string;
	readonly VITE_NOTION_KEEBS_PAGE_ID: string;
	readonly VITE_NOTION_TOKEN: string;
	readonly VITE_SENTRY_DSN: string;
	readonly VITE_SITE_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
