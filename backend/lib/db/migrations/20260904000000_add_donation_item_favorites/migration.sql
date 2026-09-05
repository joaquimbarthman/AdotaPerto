CREATE TABLE "donation_item_favorite" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL,
  "item_id" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "donation_item_favorite_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "donation_item_favorite_item_id_donation_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "donation_item"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX "donation_item_favorite_userId_idx" ON "donation_item_favorite" ("user_id");
--> statement-breakpoint
CREATE INDEX "donation_item_favorite_itemId_idx" ON "donation_item_favorite" ("item_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "donation_item_favorite_user_item_unique" ON "donation_item_favorite" ("user_id", "item_id");
