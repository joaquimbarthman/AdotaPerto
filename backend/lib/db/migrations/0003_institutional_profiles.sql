CREATE TABLE IF NOT EXISTS "organization" (
  "id" text PRIMARY KEY NOT NULL, "name" text NOT NULL, "slug" text NOT NULL,
  "type" text NOT NULL, "cnpj" text, "description" text NOT NULL, "logo_url" text,
  "cover_url" text, "founded_year" text, "contact_email" text NOT NULL, "whatsapp" text NOT NULL,
  "instagram" text, "website" text, "postal_code" text, "street" text, "number" text,
  "neighborhood" text, "city" text NOT NULL, "state" text NOT NULL,
  "verification_status" text DEFAULT 'PENDING' NOT NULL,
  "verification_reviewed_by" text REFERENCES "user"("id") ON DELETE set null,
  "verification_reviewed_at" timestamp, "verification_reason" text,
  "created_by" text NOT NULL REFERENCES "user"("id") ON DELETE restrict,
  "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "organization_slug_unique" ON "organization"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "organization_cnpj_unique" ON "organization"("cnpj") WHERE "cnpj" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "organization_created_by_idx" ON "organization"("created_by");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_member" (
  "id" text PRIMARY KEY NOT NULL, "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE cascade,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade, "role" text NOT NULL,
  "status" text DEFAULT 'ACTIVE' NOT NULL, "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "organization_member_org_user_unique" ON "organization_member"("organization_id", "user_id");
CREATE INDEX IF NOT EXISTS "organization_member_user_idx" ON "organization_member"("user_id");
CREATE INDEX IF NOT EXISTS "organization_member_org_idx" ON "organization_member"("organization_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_invitation" (
  "id" text PRIMARY KEY NOT NULL, "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE cascade,
  "invited_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "invited_by" text NOT NULL REFERENCES "user"("id") ON DELETE restrict, "role" text DEFAULT 'MEMBER' NOT NULL,
  "status" text DEFAULT 'PENDING' NOT NULL, "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "organization_invitation_pending_unique" ON "organization_invitation"("organization_id", "invited_user_id", "status");
CREATE INDEX IF NOT EXISTS "organization_invitation_user_idx" ON "organization_invitation"("invited_user_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_verification_document" (
  "id" text PRIMARY KEY NOT NULL, "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE cascade,
  "uploaded_by" text NOT NULL REFERENCES "user"("id") ON DELETE restrict, "storage_key" text NOT NULL,
  "document_type" text NOT NULL, "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "organization_document_org_idx" ON "organization_verification_document"("organization_id");
--> statement-breakpoint
ALTER TABLE "animal" ADD COLUMN IF NOT EXISTS "organization_id" text REFERENCES "organization"("id") ON DELETE set null;
ALTER TABLE "donation_item" ADD COLUMN IF NOT EXISTS "organization_id" text REFERENCES "organization"("id") ON DELETE set null;
CREATE INDEX IF NOT EXISTS "animal_organizationId_idx" ON "animal"("organization_id");
CREATE INDEX IF NOT EXISTS "donation_item_organizationId_idx" ON "donation_item"("organization_id");
--> statement-breakpoint
INSERT INTO "organization" ("id", "name", "slug", "type", "cnpj", "description", "contact_email", "whatsapp", "city", "state", "verification_status", "created_by")
SELECT 'legacy-' || u."id", COALESCE(u."organization_name", u."name"), 'legacy-' || u."id", 'NGO', u."cnpj",
  COALESCE(u."organization_description", u."bio", 'Organização migrada do perfil institucional anterior.'), u."email",
  COALESCE(u."organization_phone", u."whatsapp", 'Não informado'), COALESCE(u."city", 'Não informada'), COALESCE(u."state", 'NI'),
  CASE WHEN u."organization_verified_at" IS NOT NULL THEN 'VERIFIED' ELSE 'PENDING' END, u."id"
FROM "user" u WHERE u."account_type" = 'organization'
ON CONFLICT DO NOTHING;
INSERT INTO "organization_member" ("id", "organization_id", "user_id", "role", "status")
SELECT 'legacy-member-' || u."id", 'legacy-' || u."id", u."id", 'OWNER', 'ACTIVE'
FROM "user" u WHERE u."account_type" = 'organization'
ON CONFLICT DO NOTHING;
UPDATE "organization_need" SET "organization_id" = 'legacy-' || "organization_id"
WHERE EXISTS (SELECT 1 FROM "organization" o WHERE o."id" = 'legacy-' || "organization_need"."organization_id");
ALTER TABLE "organization_need" DROP CONSTRAINT IF EXISTS "organization_need_organization_id_user_id_fk";
ALTER TABLE "organization_need" ADD CONSTRAINT "organization_need_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade;
