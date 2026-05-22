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

function firstStringValue(
	source: Record<string, unknown>,
	keys: ReadonlyArray<string>,
): string | undefined {
	return keys.reduce<string | undefined>((found, key) => {
		if (found !== undefined) return found;
		const value = source[key];
		return typeof value === "string" && value.length > 0 ? value : found;
	}, undefined);
}

export function readEnvString(env: CloudflareEnv, keys: ReadonlyArray<string>): string | undefined {
	return (
		firstStringValue(env as unknown as Record<string, unknown>, keys) ??
		firstStringValue(process.env as Record<string, unknown>, keys)
	);
}
