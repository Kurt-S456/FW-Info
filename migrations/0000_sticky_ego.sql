CREATE TABLE `article` (
	`id` integer,
	`title` text,
	`summary` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
