ALTER TABLE "moment_sources" ADD COLUMN "rights_status" text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "moment_sources" ADD COLUMN "license_url" text;--> statement-breakpoint
ALTER TABLE "moment_sources" ADD COLUMN "attribution_text" text;--> statement-breakpoint
ALTER TABLE "moment_sources" ADD COLUMN "source_archive" text;--> statement-breakpoint
ALTER TABLE "moment_sources" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "moment_sources" ADD COLUMN "rights_notes" text;--> statement-breakpoint
ALTER TABLE "moment_sources" ADD CONSTRAINT "moment_sources_rights_status_check" CHECK (rights_status IN ('public-domain','cc0','cc-by','cc-by-sa','licensed','permission','unknown'));