CREATE TABLE `post_likes` (
	`slug` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_likes_slug_visitor_hash_unique` ON `post_likes` (`slug`,`visitor_hash`);