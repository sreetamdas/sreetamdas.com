CREATE TABLE `post_likes` (
	`slug` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `post_likes_pk` PRIMARY KEY(`slug`, `visitor_hash`)
);