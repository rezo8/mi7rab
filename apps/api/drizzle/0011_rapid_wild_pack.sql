CREATE TABLE "understanding_essays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"hook" text,
	"body_md" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "understanding_essay_moments" (
	"essay_id" uuid NOT NULL,
	"moment_id" uuid NOT NULL,
	CONSTRAINT "understanding_essay_moments_essay_id_moment_id_pk" PRIMARY KEY("essay_id","moment_id")
);
--> statement-breakpoint
ALTER TABLE "understanding_essay_moments" ADD CONSTRAINT "understanding_essay_moments_essay_id_understanding_essays_id_fk" FOREIGN KEY ("essay_id") REFERENCES "public"."understanding_essays"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "understanding_essay_moments" ADD CONSTRAINT "understanding_essay_moments_moment_id_moments_id_fk" FOREIGN KEY ("moment_id") REFERENCES "public"."moments"("id") ON DELETE cascade ON UPDATE no action;
