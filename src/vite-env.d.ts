/// <reference types="vite/client" />

interface ViteTypeOptions {
	// By adding this line, you can make the type of ImportMetaEnv strict
	// to disallow unknown keys.
	strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
	readonly MODE: string;
	readonly DEV: boolean;
	readonly PROD: boolean;
	readonly BASE_URL: string;
	readonly SSR: boolean;
	readonly VITE_SENTRY_DSN: string;
	readonly VITE_SITE_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
