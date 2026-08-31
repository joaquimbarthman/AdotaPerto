ALTER TABLE "adoption_request" ADD COLUMN "compatibility_score" integer;
--> statement-breakpoint
ALTER TABLE "adoption_request" ADD COLUMN "compatibility_details" jsonb;
