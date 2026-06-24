ALTER TABLE `post_likes` ADD `ip_hash` text;--> statement-breakpoint
CREATE INDEX `post_likes_slug_ip_hash_idx` ON `post_likes` (`slug`,`ip_hash`);