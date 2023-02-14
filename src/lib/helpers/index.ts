import { IS_DEV } from "@/config";

export type SeverityLevel = "error" | "warning";

type MessageOrSeverity = SeverityLevel | unknown;

/**
 * development-only `console.log()`
 * @param message
 * @param optionalParams
 */
export function dog(messageOrSeverity?: MessageOrSeverity, ...optionalParams: unknown[]) {
	if (IS_DEV) {
		let fn,
			sev,
			message = optionalParams;
		switch (messageOrSeverity) {
			case "error":
				// eslint-disable-next-line no-console
				fn = console.error;
				sev = "ERROR";
				break;
			case "warn":
				// eslint-disable-next-line no-console
				fn = console.warn;
				sev = "WARN";
				break;
			default:
				message = [messageOrSeverity, ...optionalParams];
				// eslint-disable-next-line no-console
				fn = console.log;
				break;
		}

		fn.call(console, `${typeof sev !== "undefined" ? `[${sev}] ` : ""}🐶 ==>`, ...message);
	}
}
