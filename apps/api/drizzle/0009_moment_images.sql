CREATE TABLE "moment_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moment_id" uuid NOT NULL,
	"file_key" text NOT NULL,
	"caption" text,
	"rights_status" text DEFAULT 'unknown' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "moment_images_rights_status_check" CHECK (rights_status IN ('public-domain','cc0','cc-by','cc-by-sa','licensed','permission','own-work','unknown'))
);
--> statement-breakpoint
ALTER TABLE "moment_images" ADD CONSTRAINT "moment_images_moment_id_moments_id_fk" FOREIGN KEY ("moment_id") REFERENCES "public"."moments"("id") ON DELETE cascade ON UPDATE no action;
