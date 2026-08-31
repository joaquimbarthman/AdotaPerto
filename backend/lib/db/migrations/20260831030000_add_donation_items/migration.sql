CREATE TABLE "donation_item" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"item_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit" text NOT NULL,
	"condition" text NOT NULL,
	"expiration_date" text,
	"description" text NOT NULL,
	"main_image" text NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"delivery_method" text NOT NULL,
	"available_until" text,
	"status" text DEFAULT 'Disponível' NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "donation_item_userId_idx" ON "donation_item" ("user_id");
--> statement-breakpoint
ALTER TABLE "donation_item" ADD CONSTRAINT "donation_item_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
