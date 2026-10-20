ALTER TABLE "session"
ADD COLUMN IF NOT EXISTS "active_organization_id" text;
