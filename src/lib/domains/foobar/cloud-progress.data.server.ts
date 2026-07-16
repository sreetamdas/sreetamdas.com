/**
 * D1 persistence for optional authenticated Foobar progress. All writes merge
 * with the stored copy, so late tabs and devices cannot erase discoveries.
 */
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

import { and, asc, count, eq, isNotNull, sql } from "drizzle-orm";

import * as schema from "@/db/schema";
import { authUser, foobarProgress } from "@/db/schema";

import { mergeFoobarProgress } from "./cloud-progress";
import { normalizeFoobarData, type FoobarDataType } from "./store";

export type FoobarProgressDb = BaseSQLiteDatabase<"sync" | "async", unknown, typeof schema>;

export type FoobarCloudProgress = {
	progress: FoobarDataType;
	completedAt: number | null;
	publicProfile: boolean;
	certificateId: string | null;
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
	const rows = await db
		.select()
		.from(foobarProgress)
		.where(eq(foobarProgress.userId, userId))
		.limit(1);
	const row = rows[0];
	if (!row) return null;

	return {
		progress: parseProgress(row.progressJson),
		completedAt: row.completedAt,
		publicProfile: row.publicProfile,
		certificateId: row.certificateId,
	};
}

export async function syncFoobarProgress(
	db: FoobarProgressDb,
	userId: string,
	incoming: unknown,
	now = Date.now(),
	createCertificateId: () => string = crypto.randomUUID,
): Promise<FoobarCloudProgress> {
	const stored = await loadFoobarProgress(db, userId);
	const progress = mergeFoobarProgress(incoming, stored?.progress);
	const completedAt = stored?.completedAt ?? (progress.all_achievements ? now : null);
	const certificateId =
		stored?.certificateId ?? (progress.all_achievements ? createCertificateId() : null);

	const rows = await db
		.insert(foobarProgress)
		.values({
			userId,
			progressJson: JSON.stringify(progress),
			completedAt,
			certificateId,
			createdAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: foobarProgress.userId,
			set: {
				progressJson: JSON.stringify(progress),
				completedAt: sql`coalesce(${foobarProgress.completedAt}, excluded.completed_at)`,
				certificateId: sql`coalesce(${foobarProgress.certificateId}, excluded.certificate_id)`,
				updatedAt: now,
			},
		})
		.returning();
	const row = rows[0];
	if (!row) throw new Error("Failed to sync Foobar progress");

	return {
		progress: parseProgress(row.progressJson),
		completedAt: row.completedAt,
		publicProfile: row.publicProfile,
		certificateId: row.certificateId,
	};
}

export async function setFoobarPublicProfile(
	db: FoobarProgressDb,
	userId: string,
	publicProfile: boolean,
): Promise<boolean> {
	const rows = await db
		.update(foobarProgress)
		.set({ publicProfile, updatedAt: Date.now() })
		.where(eq(foobarProgress.userId, userId))
		.returning({ publicProfile: foobarProgress.publicProfile });
	return rows[0]?.publicProfile ?? false;
}

export async function resetFoobarProgress(db: FoobarProgressDb, userId: string): Promise<void> {
	await db.delete(foobarProgress).where(eq(foobarProgress.userId, userId));
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
