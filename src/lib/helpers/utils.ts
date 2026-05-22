import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<ClassValue>) {
	return twMerge(clsx(inputs));
}

export async function handleFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
	const response = await fetch(input, init);

	if (response.ok) {
		return await response.json();
	}

	return Promise.reject(await response.json());
}

export type PromiseSettled<T> = Promise<
	| {
			data: T;
			error: undefined;
	  }
	| {
			data: undefined;
			error: string;
	  }
>;
export async function wrapPromise<T>(promise: Promise<T>): PromiseSettled<T> {
	// @ts-expect-error TS complains but this is correct
	return Promise.allSettled([promise]).then(([{ value, reason }]) => ({
		data: value,
		error: reason,
	}));
}

export function readEnvString(env: CloudflareEnv, keys: ReadonlyArray<string>): string | undefined {
	for (const [key, value] of Object.entries(env)) {
		if (keys.includes(key) && typeof value === "string" && value.length > 0) {
			return value;
		}
	}
	return undefined;
}
