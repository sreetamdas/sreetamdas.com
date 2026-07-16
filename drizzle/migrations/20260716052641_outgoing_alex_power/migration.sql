CREATE TABLE `foobar_progress` (
	`user_id` text PRIMARY KEY,
	`progress_json` text NOT NULL,
	`completed_at` integer,
	`public_profile` integer DEFAULT false NOT NULL,
	`certificate_id` text UNIQUE,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_foobar_progress_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `foobar_progress_completed_at_idx` ON `foobar_progress` (`completed_at`);--> statement-breakpoint
CREATE INDEX `foobar_progress_public_completed_idx` ON `foobar_progress` (`public_profile`,`completed_at`);