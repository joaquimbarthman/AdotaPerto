-- Some databases created the original organization_id reference with the
-- PostgreSQL default name. Remove both possible legacy constraints before
-- recreating the relationship with the institutional organization table.
ALTER TABLE "organization_need" DROP CONSTRAINT IF EXISTS "organization_need_organization_id_fkey";
ALTER TABLE "organization_need" DROP CONSTRAINT IF EXISTS "organization_need_organization_id_user_id_fk";
ALTER TABLE "organization_need" DROP CONSTRAINT IF EXISTS "organization_need_organization_id_organization_id_fk";
--> statement-breakpoint
UPDATE "organization_need" AS n
SET "organization_id" = 'legacy-' || n."organization_id"
WHERE NOT EXISTS (SELECT 1 FROM "organization" o WHERE o."id" = n."organization_id")
  AND EXISTS (SELECT 1 FROM "organization" o WHERE o."id" = 'legacy-' || n."organization_id");
--> statement-breakpoint
ALTER TABLE "organization_need"
  ADD CONSTRAINT "organization_need_organization_id_organization_id_fk"
  FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade;
