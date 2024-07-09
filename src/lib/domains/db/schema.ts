import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const page_details_table = sqliteTable("page_details", {
	id: integer("id").notNull().primaryKey({ autoIncrement: true }),
	slug: text("slug").notNull(),
	view_count: integer("view_count").notNull().default(1),
	likes: integer("likes").notNull().default(0),
	created_at: text("created_at")
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updated_at: text("updated_at")
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});
