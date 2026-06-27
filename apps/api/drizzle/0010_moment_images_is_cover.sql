ALTER TABLE "moment_images" ADD COLUMN "is_cover" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "moments" DROP COLUMN "cover_image_key";
