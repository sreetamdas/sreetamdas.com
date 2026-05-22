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
	const values = env as unknown as Record<string, unknown>;
	for (const key of keys) {
		const value = values[key];
		if (typeof value === "string" && value.length > 0) {
			return value;
		}
	}
	// Fallback to process.env for build-time / prerender environments
	for (const key of keys) {
		const value = process.env[key];
		if (typeof value === "string" && value.length > 0) {
			return value;
		}
	}
	return undefined;
}
