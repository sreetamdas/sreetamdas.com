import handler from "@tanstack/react-start/server-entry";

export default {
	fetch(request: Request) {
		return handler.fetch(request);
	},
};
if (!process.env.VELITE_STARTED && import.meta.env.DEV) {
	process.env.VELITE_STARTED = "1";

	const { build } = await import("velite");
	await build({
		watch: import.meta.env.DEV,
		clean: !import.meta.env.DEV,
		config: ".config/velite.config.ts",
	});
}
