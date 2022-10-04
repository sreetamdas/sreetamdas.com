import { IS_DEV } from "@/config";

/**
 * `dog`: development-only `console.log`
 * @param messages to be logged only during dev
 */
export function dog(...messages: Array<unknown>): void {
	if (IS_DEV) {
		// eslint-disable-next-line no-console
		console.log(
			"%cdev%c🐶 ==>",
			`font-family: monospace;
			color: indianred;
			background-color: #eee;
			border-radius: 2px;
			padding: 2px;
			margin-right: 2px;
			font-size: 1.1em`,
			`font-family: unset;
			color: unset;
			background-color: unset;
			border: unset
			font-size: 1.2em`,
			...messages
		);
	}
}
