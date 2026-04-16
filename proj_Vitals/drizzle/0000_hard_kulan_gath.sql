CREATE TABLE `biometrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`value` real NOT NULL,
	`recorded_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `health_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`metric_id` integer NOT NULL,
	`value` real NOT NULL,
	`recorded_at` integer NOT NULL,
	`source` text DEFAULT 'manual',
	`source_img_uri` text,
	FOREIGN KEY (`metric_id`) REFERENCES `metrics_definition`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `metrics_definition` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`aliases` text,
	`unit` text NOT NULL,
	`ref_range_min` real,
	`ref_range_max` real,
	`metadata` text
);
