CREATE TABLE "strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"deck" text DEFAULT 'eno-schmidt' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "strategies_text_deck_uq" ON "strategies" USING btree ("text","deck");