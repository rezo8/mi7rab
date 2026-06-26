CREATE TABLE "moment_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moment_id" uuid NOT NULL,
	"type" text DEFAULT 'link' NOT NULL,
	"label" text NOT NULL,
	"url" text,
	"file_key" text,
	"metadata" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moment_tags" (
	"moment_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "moment_tags_moment_id_tag_id_pk" PRIMARY KEY("moment_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "moments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"door_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"occurred_at" text,
	"location" text,
	"cover_image_key" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "moments_door_id_check" CHECK (door_id IN ('knowledge','understanding','grief','joy','safety','chaos','strength','hope'))
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "moment_sources" ADD CONSTRAINT "moment_sources_moment_id_moments_id_fk" FOREIGN KEY ("moment_id") REFERENCES "public"."moments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moment_tags" ADD CONSTRAINT "moment_tags_moment_id_moments_id_fk" FOREIGN KEY ("moment_id") REFERENCES "public"."moments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moment_tags" ADD CONSTRAINT "moment_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;