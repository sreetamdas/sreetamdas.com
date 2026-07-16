import { isRealtimeClientId } from "@/lib/domains/realtime/client-id";

export const PRESENCE_CLIENT_ID_PARAM = "clientId";
export const PRESENCE_HUNTER_PARAM = "hunter";
export const PRESENCE_CLIENT_ID_STORAGE_KEY = "sreetamdas:presence-client-id";

export type PresenceServerMessage = {
	type: "count";
	count: number;
	hunters?: number;
};

export const isPresenceClientId = isRealtimeClientId;

export function isPresenceServerMessage(value: unknown): value is PresenceServerMessage {
	if (typeof value !== "object" || value === null) return false;
	if (!("type" in value)) return false;

	if (value.type !== "count") return false;
	if (!("count" in value)) return false;
	if (typeof value.count !== "number" || !Number.isFinite(value.count) || value.count < 0) {
		return false;
	}
	if (!("hunters" in value) || value.hunters === undefined) return true;
	return typeof value.hunters === "number" && Number.isFinite(value.hunters) && value.hunters >= 0;
}
