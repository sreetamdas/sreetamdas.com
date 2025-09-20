import { registerGlobalMiddleware } from "@tanstack/react-start";
import { cloudfareMiddleware } from "@/lib/domains/cloudflare/middleware";

registerGlobalMiddleware({
	middleware: [cloudfareMiddleware],
});
