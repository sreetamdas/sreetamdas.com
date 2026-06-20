ALTER TABLE `post_likes` ADD `salt_version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_page_details` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`view_count` integer DEFAULT 0 NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "page_details_view_count_nonneg" CHECK("view_count" >= 0),
	CONSTRAINT "page_details_likes_nonneg" CHECK("likes" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_page_details`(`id`, `slug`, `view_count`, `likes`, `created_at`, `updated_at`) SELECT `id`, `slug`, `view_count`, `likes`, `created_at`, `updated_at` FROM `page_details`;--> statement-breakpoint
DROP TABLE `page_details`;--> statement-breakpoint
ALTER TABLE `__new_page_details` RENAME TO `page_details`;--> statement-breakpoint
PRAGMA foreign_keys=ON;