ALTER TABLE "animal" ADD COLUMN "organization_id" text;
--> statement-breakpoint
ALTER TABLE "donation_item" ADD COLUMN "organization_id" text;
--> statement-breakpoint
ALTER TABLE "animal" ADD CONSTRAINT "animal_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "donation_item" ADD CONSTRAINT "donation_item_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "animal_organizationId_idx" ON "animal" USING btree ("organization_id");
--> statement-breakpoint
CREATE INDEX "donation_item_organizationId_idx" ON "donation_item" USING btree ("organization_id");
