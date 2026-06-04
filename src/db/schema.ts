import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const pageDetails = sqliteTable("page_details", {
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
});

export const postLikes = sqliteTable(
	"post_likes",
	{
		slug: text("slug").notNull(),
		visitorHash: text("visitor_hash").notNull(),
		createdAt: text("created_at")
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(t) => [uniqueIndex("post_likes_slug_visitor_hash_unique").on(t.slug, t.visitorHash)],
);

export type PageDetailsRow = typeof pageDetails.$inferSelect;
