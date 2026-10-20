ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "account_type" text DEFAULT 'person' NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "organization_name" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "cnpj" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "organization_description" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "organization_phone" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "organization_website" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "organization_verified_at" timestamp;
CREATE UNIQUE INDEX IF NOT EXISTS "user_cnpj_unique" ON "user" ("cnpj") WHERE "cnpj" IS NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_need" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "category" text NOT NULL,
  "quantity" integer NOT NULL,
  "unit" text NOT NULL,
  "priority" text DEFAULT 'Média' NOT NULL,
  "description" text NOT NULL,
  "status" text DEFAULT 'Ativa' NOT NULL,
  "organization_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_need_organizationId_idx" ON "organization_need" ("organization_id");
