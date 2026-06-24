PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_post_likes` (
	`slug` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`ip_hash` text,
	`salt_version` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `post_likes_pk` PRIMARY KEY(`slug`, `visitor_hash`, `salt_version`)
);
--> statement-breakpoint
INSERT INTO `__new_post_likes`(`slug`, `visitor_hash`, `ip_hash`, `salt_version`, `created_at`) SELECT `slug`, `visitor_hash`, `ip_hash`, `salt_version`, `created_at` FROM `post_likes`;--> statement-breakpoint
DROP TABLE `post_likes`;--> statement-breakpoint
ALTER TABLE `__new_post_likes` RENAME TO `post_likes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS `post_likes_slug_ip_hash_idx`;--> statement-breakpoint
CREATE INDEX `post_likes_slug_ip_hash_salt_version_idx` ON `post_likes` (`slug`,`ip_hash`,`salt_version`);