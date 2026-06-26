ALTER TABLE "pages" DROP CONSTRAINT "pages_strategy_id_strategies_id_fk";--> statement-breakpoint
ALTER TABLE "pages" DROP COLUMN "strategy_id";--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "strategy_ids" integer[] NOT NULL DEFAULT '{}'::integer[];
