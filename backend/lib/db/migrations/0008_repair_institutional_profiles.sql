UPDATE "user"
SET "account_type" = 'ORGANIZATION'
WHERE lower("account_type") = 'organization';
--> statement-breakpoint
INSERT INTO "organization" (
  "id", "name", "slug", "type", "cnpj", "description",
  "legal_representative_name", "contact_email", "whatsapp", "city", "state",
  "verification_status", "created_by"
)
SELECT
  'legacy-' || u."id",
  COALESCE(NULLIF(u."organization_name", ''), u."name"),
  'legacy-' || u."id",
  'NGO',
  NULLIF(regexp_replace(COALESCE(u."cnpj", ''), '\D', '', 'g'), ''),
  COALESCE(NULLIF(u."organization_description", ''), NULLIF(u."bio", ''), 'Complete os dados institucionais da organização.'),
  u."name",
  u."email",
  COALESCE(NULLIF(u."organization_phone", ''), NULLIF(u."whatsapp", ''), ''),
  COALESCE(NULLIF(u."city", ''), ''),
  COALESCE(NULLIF(u."state", ''), ''),
  'DRAFT',
  u."id"
FROM "user" u
WHERE u."account_type" = 'ORGANIZATION'
  AND NOT EXISTS (
    SELECT 1 FROM "organization_member" om WHERE om."user_id" = u."id" AND om."status" = 'ACTIVE'
  )
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "organization_member" ("id", "organization_id", "user_id", "role", "status")
SELECT
  'legacy-member-' || u."id",
  'legacy-' || u."id",
  u."id",
  'OWNER',
  'ACTIVE'
FROM "user" u
WHERE u."account_type" = 'ORGANIZATION'
  AND EXISTS (SELECT 1 FROM "organization" o WHERE o."id" = 'legacy-' || u."id")
  AND NOT EXISTS (SELECT 1 FROM "organization_member" om WHERE om."user_id" = u."id" AND om."status" = 'ACTIVE')
ON CONFLICT DO NOTHING;
