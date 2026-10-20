ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "legal_representative_name" text;
UPDATE "organization" o SET "legal_representative_name" = u."name"
FROM "user" u WHERE u."id" = o."created_by" AND o."legal_representative_name" IS NULL;
ALTER TABLE "organization" ALTER COLUMN "legal_representative_name" SET NOT NULL;
