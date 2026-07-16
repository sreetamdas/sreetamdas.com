/**
 * Deterministic, lossless merge rules for anonymous browser progress and the
 * authenticated D1 copy. Neither side is authoritative: discoveries only move
 * forward, arrays retain first-seen order, and real clue timestamps beat legacy
 * imports without timestamps.
 */
import { normalizeFoobarData, type FoobarClueSeen, type FoobarDataType } from "./store";

function stableUnion<T>(left: ReadonlyArray<T>, right: ReadonlyArray<T>): Array<T> {
	return [...new Set([...left, ...right])];
}

function earlierTimestamp(left: number | null, right: number | null): number | null {
	if (left === null) return right;
	if (right === null) return left;
	return Math.min(left, right);
}

function mergeClues(
	local: ReadonlyArray<FoobarClueSeen>,
	remote: ReadonlyArray<FoobarClueSeen>,
): Array<FoobarClueSeen> {
	const merged = new Map(local.map((clue) => [clue.id, clue]));

	for (const clue of remote) {
		const existing = merged.get(clue.id);
		if (!existing) {
			merged.set(clue.id, clue);
			continue;
		}

		merged.set(clue.id, {
			id: clue.id,
			seen_at: earlierTimestamp(existing.seen_at, clue.seen_at),
		});
	}

	return [...merged.values()];
}

export function mergeFoobarProgress(localValue: unknown, remoteValue: unknown): FoobarDataType {
	const local = normalizeFoobarData(localValue);
	const remote = normalizeFoobarData(remoteValue);

	return normalizeFoobarData({
		visited_pages: stableUnion(local.visited_pages, remote.visited_pages),
		konami: local.konami || remote.konami,
		unlocked: local.unlocked || remote.unlocked,
		completed: stableUnion(local.completed, remote.completed),
		clues_seen: mergeClues(local.clues_seen, remote.clues_seen),
	});
}
