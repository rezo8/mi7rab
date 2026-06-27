CREATE TABLE "actors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" text DEFAULT 'organization' NOT NULL,
	"description" text,
	CONSTRAINT "actors_name_unique" UNIQUE("name"),
	CONSTRAINT "actors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "moment_actors" (
	"moment_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "moment_actors_moment_id_actor_id_role_pk" PRIMARY KEY("moment_id","actor_id","role")
);
--> statement-breakpoint
ALTER TABLE "moment_actors" ADD CONSTRAINT "moment_actors_moment_id_moments_id_fk" FOREIGN KEY ("moment_id") REFERENCES "public"."moments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moment_actors" ADD CONSTRAINT "moment_actors_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE cascade ON UPDATE no action;