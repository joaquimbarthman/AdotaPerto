CREATE TABLE "organization_external" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "name" text NOT NULL,
  "kind" text NOT NULL,
  "email" text,
  "phone" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "organization_external_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX "organization_external_organizationId_idx" ON "organization_external" USING btree ("organization_id");
