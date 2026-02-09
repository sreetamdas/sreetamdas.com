CREATE TABLE IF NOT EXISTS `page_details` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS `page_details_slug_unique` ON `page_details` (`slug`);
