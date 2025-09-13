import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { createRouter } from "./router";

export default createStartHandler({
	createRouter,
})(defaultStreamHandler);

console.log(">>>> server", import.meta.env.DEV);

if (!process.env.VELITE_STARTED && import.meta.env.DEV) {
	process.env.VELITE_STARTED = "1";
  console.log(">>>> building");
  
	const { build } = await import("velite");
	await build({
		watch: import.meta.env.DEV,
		clean: !import.meta.env.DEV,
		config: ".config/velite.config.ts",
	});
}
