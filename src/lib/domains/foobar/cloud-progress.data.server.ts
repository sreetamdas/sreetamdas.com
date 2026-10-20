/**
 * D1 persistence for optional authenticated Foobar progress. All writes merge
 * with the stored copy, so late tabs and devices cannot erase discoveries.
 */
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

import { and, asc, count, eq, isNotNull, sql } from "drizzle-orm";

import * as schema from "@/db/schema";
import { authUser, foobarProgress } from "@/db/schema";

import { mergeFoobarProgress } from "./cloud-progress";
import { recordFoobarCloudOperation } from "./cloud-progress.observability.server";
import { initialFoobarData, normalizeFoobarData, type FoobarDataType } from "./store";

export type FoobarProgressDb = BaseSQLiteDatabase<"sync" | "async", unknown, typeof schema>;

export type FoobarCloudProgress = {
	progress: FoobarDataType;
	completedAt: number | null;
	publicProfile: boolean;
	certificateId: string | null;
};

export type FoobarCloudProgressState = {
	cloud: FoobarCloudProgress | null;
	syncEnabled: boolean;
};

export type FoobarLeaderboardEntry = {
	name: string;
	completedAt: number;
	certificateId: string;
};

export type FoobarCommunity = {
	finisherCount: number;
	leaderboard: Array<FoobarLeaderboardEntry>;
};

export async function loadFoobarProgress(
	db: FoobarProgressDb,
	userId: string,
): Promise<FoobarCloudProgress | null> {
	return (await loadFoobarProgressState(db, userId)).cloud;
}

export async function loadFoobarProgressState(
	db: FoobarProgressDb,
	userId: string,
): Promise<FoobarCloudProgressState> {
	return toProgressState(await loadFoobarProgressRow(db, userId));
}

async function loadFoobarProgressRow(db: FoobarProgressDb, userId: string) {
	const rows = await db
		.select()
		.from(foobarProgress)
		.where(eq(foobarProgress.userId, userId))
		.limit(1);
	return rows[0];
}

function toProgressState(
	row: typeof foobarProgress.$inferSelect | undefined,
): FoobarCloudProgressState {
	if (!row) return { cloud: null, syncEnabled: true };
	if (!row.syncEnabled) return { cloud: null, syncEnabled: false };

	return {
		cloud: {
			progress: parseProgress(row.progressJson),
			completedAt: row.completedAt,
			publicProfile: row.publicProfile,
			certificateId: row.certificateId,
		},
		syncEnabled: true,
	};
}

export async function syncFoobarProgress(
	db: FoobarProgressDb,
	userId: string,
	incoming: unknown,
	now = Date.now(),
	createCertificateId: () => string = crypto.randomUUID,
): Promise<FoobarCloudProgress> {
	return writeFoobarProgress(db, userId, incoming, false, now, createCertificateId);
}

export async function enableFoobarProgress(
	db: FoobarProgressDb,
	userId: string,
	incoming: unknown,
	now = Date.now(),
	createCertificateId: () => string = crypto.randomUUID,
): Promise<FoobarCloudProgress> {
	return writeFoobarProgress(db, userId, incoming, true, now, createCertificateId);
}

const FOOBAR_WRITE_ATTEMPTS = 5;

async function writeFoobarProgress(
	db: FoobarProgressDb,
	userId: string,
	incoming: unknown,
	enableDisabled: boolean,
	now: number,
	createCertificateId: () => string,
): Promise<FoobarCloudProgress> {
	for (let attempt = 0; attempt < FOOBAR_WRITE_ATTEMPTS; attempt += 1) {
		const storedRow = await loadFoobarProgressRow(db, userId);
		const storedState = toProgressState(storedRow);
		if (!enableDisabled && !storedState.syncEnabled) {
			await recordFoobarCloudOperation("rejected_disabled_write");
			throw new Error("Foobar cloud sync is disabled");
		}

		const stored = storedState.cloud;
		const progress = mergeFoobarProgress(incoming, stored?.progress);
		const completedAt = stored?.completedAt ?? (progress.all_achievements ? now : null);
		const certificateId =
			stored?.certificateId ?? (progress.all_achievements ? createCertificateId() : null);
		const progressJson = JSON.stringify(progress);

		const rows = await db
			.insert(foobarProgress)
			.values({
				userId,
				progressJson,
				completedAt,
				certificateId,
				syncEnabled: true,
				createdAt: now,
				updatedAt: now,
			})
			.onConflictDoUpdate({
				target: foobarProgress.userId,
				// Compare-and-swap: only replace the row this merge was computed from.
				// A row inserted after an empty read never matches.
				setWhere: and(
					enableDisabled ? undefined : eq(foobarProgress.syncEnabled, true),
					storedRow ? eq(foobarProgress.progressJson, storedRow.progressJson) : sql`0`,
				),
				set: {
					progressJson,
					completedAt: sql`coalesce(${foobarProgress.completedAt}, excluded.completed_at)`,
					certificateId: sql`coalesce(${foobarProgress.certificateId}, excluded.certificate_id)`,
					syncEnabled: true,
					updatedAt: now,
				},
			})
			.returning();
		const row = rows[0];
		if (!row) continue;
		if (enableDisabled) await recordFoobarCloudOperation("enabled");

		return {
			progress: parseProgress(row.progressJson),
			completedAt: row.completedAt,
			publicProfile: row.publicProfile,
			certificateId: row.certificateId,
		};
	}

	throw new Error("Foobar cloud save kept changing; try again");
}

export async function setFoobarPublicProfile(
	db: FoobarProgressDb,
	userId: string,
	publicProfile: boolean,
): Promise<boolean> {
	const rows = await db
		.update(foobarProgress)
		.set({ publicProfile, updatedAt: Date.now() })
		.where(and(eq(foobarProgress.userId, userId), eq(foobarProgress.syncEnabled, true)))
		.returning({ publicProfile: foobarProgress.publicProfile });
	return rows[0]?.publicProfile ?? false;
}

export async function resetFoobarProgress(db: FoobarProgressDb, userId: string): Promise<void> {
	const now = Date.now();
	await db
		.insert(foobarProgress)
		.values({
			userId,
			progressJson: JSON.stringify(initialFoobarData),
			completedAt: null,
			publicProfile: false,
			syncEnabled: false,
			certificateId: null,
			createdAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: foobarProgress.userId,
			set: {
				progressJson: JSON.stringify(initialFoobarData),
				completedAt: null,
				publicProfile: false,
				syncEnabled: false,
				certificateId: null,
				updatedAt: now,
			},
		});
	await recordFoobarCloudOperation("disabled");
}

export async function getFoobarCommunity(db: FoobarProgressDb): Promise<FoobarCommunity> {
	const [countRows, leaderboardRows] = await Promise.all([
		db.select({ value: count() }).from(foobarProgress).where(isNotNull(foobarProgress.completedAt)),
		db
			.select({
				name: authUser.name,
				completedAt: foobarProgress.completedAt,
				certificateId: foobarProgress.certificateId,
			})
			.from(foobarProgress)
			.innerJoin(authUser, eq(authUser.id, foobarProgress.userId))
			.where(
				and(
					eq(foobarProgress.publicProfile, true),
					isNotNull(foobarProgress.completedAt),
					isNotNull(foobarProgress.certificateId),
				),
			)
			.orderBy(asc(foobarProgress.completedAt))
			.limit(20),
	]);

	const leaderboard = leaderboardRows.flatMap((row) =>
		row.completedAt === null || row.certificateId === null
			? []
			: [{ name: row.name, completedAt: row.completedAt, certificateId: row.certificateId }],
	);

	return { finisherCount: countRows[0]?.value ?? 0, leaderboard };
}

export async function getFoobarCertificate(db: FoobarProgressDb, certificateId: string) {
	const rows = await db
		.select({
			name: authUser.name,
			completedAt: foobarProgress.completedAt,
			certificateId: foobarProgress.certificateId,
		})
		.from(foobarProgress)
		.innerJoin(authUser, eq(authUser.id, foobarProgress.userId))
		.where(eq(foobarProgress.certificateId, certificateId))
		.limit(1);
	const row = rows[0];
	if (!row || row.completedAt === null || row.certificateId === null) return null;
	return { name: row.name, completedAt: row.completedAt, certificateId: row.certificateId };
}

function parseProgress(value: string): FoobarDataType {
	try {
		return normalizeFoobarData(JSON.parse(value));
	} catch {
		return normalizeFoobarData(null);
	}
}
