ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "account_type" text DEFAULT 'PERSON' NOT NULL;
ALTER TABLE "user" ALTER COLUMN "account_type" SET DEFAULT 'PERSON';
UPDATE "user" SET "account_type" = 'PERSON' WHERE lower("account_type") = 'person';
UPDATE "user" SET "account_type" = 'ORGANIZATION'
WHERE EXISTS (
  SELECT 1 FROM "organization_member" om
  WHERE om."user_id" = "user"."id" AND om."role" = 'OWNER' AND om."status" = 'ACTIVE'
);
