import { sql } from "drizzle-orm";
import { check, index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pageDetails = sqliteTable(
	"page_details",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		slug: text("slug").notNull().unique(),
		viewCount: integer("view_count").notNull().default(0),
		likes: integer("likes").notNull().default(0),
		createdAt: text("created_at")
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: text("updated_at")
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(t) => [
		check("page_details_view_count_nonneg", sql`${t.viewCount} >= 0`),
		check("page_details_likes_nonneg", sql`${t.likes} >= 0`),
	],
);

export const postLikes = sqliteTable(
	"post_likes",
	{
		slug: text("slug").notNull(),
		visitorHash: text("visitor_hash").notNull(),
		ipHash: text("ip_hash"),
		// Counted like era. Do not bump for the cookie migration; bump only with
		// an intentional future identity reset so older rows stop contributing.
		saltVersion: integer("salt_version").notNull().default(1),
		createdAt: text("created_at")
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(t) => [
		primaryKey({ columns: [t.slug, t.visitorHash, t.saltVersion] }),
		index("post_likes_slug_ip_hash_salt_version_idx").on(t.slug, t.ipHash, t.saltVersion),
	],
);

export type PageDetailsRow = typeof pageDetails.$inferSelect;

export const authUser = sqliteTable("user", {
	id: text("id").notNull().primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
	image: text("image"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const authSession = sqliteTable("session", {
	id: text("id").notNull().primaryKey(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => authUser.id, { onDelete: "cascade" }),
});

export const authAccount = sqliteTable("account", {
	id: text("id").notNull().primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => authUser.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const authVerification = sqliteTable("verification", {
	id: text("id").notNull().primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }),
	updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const foobarProgress = sqliteTable(
	"foobar_progress",
	{
		userId: text("user_id")
			.notNull()
			.primaryKey()
			.references(() => authUser.id, { onDelete: "cascade" }),
		progressJson: text("progress_json").notNull(),
		completedAt: integer("completed_at"),
		publicProfile: integer("public_profile", { mode: "boolean" }).notNull().default(false),
		certificateId: text("certificate_id").unique(),
		createdAt: integer("created_at").notNull(),
		updatedAt: integer("updated_at").notNull(),
	},
	(t) => [
		index("foobar_progress_completed_at_idx").on(t.completedAt),
		index("foobar_progress_public_completed_idx").on(t.publicProfile, t.completedAt),
	],
);
