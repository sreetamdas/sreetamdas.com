export function isRealtimeClientId(value: unknown): value is string {
	if (typeof value !== "string") return false;
	return /^[A-Za-z0-9_-]{8,80}$/.test(value);
}
