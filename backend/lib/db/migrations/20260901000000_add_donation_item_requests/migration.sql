CREATE TABLE "donation_item_request" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL,
  "item_id" text NOT NULL,
  "quantity" integer DEFAULT 1 NOT NULL,
  "message" text,
  "status" text DEFAULT 'Em análise' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "donation_item_request_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "donation_item_request_item_id_donation_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "donation_item"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX "donation_item_request_userId_idx" ON "donation_item_request" ("user_id");
--> statement-breakpoint
CREATE INDEX "donation_item_request_itemId_idx" ON "donation_item_request" ("item_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "donation_item_request_user_item_unique" ON "donation_item_request" ("user_id", "item_id");
