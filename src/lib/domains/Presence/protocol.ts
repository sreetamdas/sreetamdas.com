export const PRESENCE_CLIENT_ID_PARAM = "clientId";
export const PRESENCE_CLIENT_ID_STORAGE_KEY = "sreetamdas:presence-client-id";

export type PresenceServerMessage =
	| {
			type: "count";
			count: number;
	  }
	| {
			type: "ping";
	  };

export function isPresenceClientId(value: unknown): value is string {
	if (typeof value !== "string") return false;
	return /^[A-Za-z0-9_-]{8,80}$/.test(value);
}

export function isPresenceServerMessage(value: unknown): value is PresenceServerMessage {
	if (typeof value !== "object" || value === null) return false;
	if (!("type" in value)) return false;

	if (value.type === "ping") return true;
	if (value.type !== "count") return false;
	if (!("count" in value)) return false;
	return typeof value.count === "number" && Number.isFinite(value.count) && value.count >= 0;
}
