CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"birth_date" text,
	"instagram" text,
	"whatsapp" text,
	"bio" text,
	"zip_code" text,
	"street" text,
	"city" text,
	"state" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "animal" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"species" text NOT NULL,
	"sex" text NOT NULL,
	"age" text NOT NULL,
	"size" text NOT NULL,
	"breed" text,
	"weight" text,
	"neutered" text,
	"vaccination" text,
	"dewormed" text,
	"has_health_condition" boolean,
	"health_condition" text,
	"energy_level" text,
	"lives_with_dogs" text,
	"lives_with_cats" text,
	"lives_with_children" text,
	"personality" text,
	"behavior_notes" text,
	"adoption_reason" text,
	"time_in_care" text,
	"currently_in_care" boolean,
	"description" text,
	"image" text,
	"images" text[],
	"traits" text[],
	"status" text DEFAULT 'Disponível' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adoption_request" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"animal_id" text NOT NULL,
	"status" text DEFAULT 'Em análise' NOT NULL,
	"notes" text,
	"answers" jsonb,
	"compatibility_score" integer,
	"compatibility_details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"animal_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_user_animal_unique" UNIQUE("user_id","animal_id")
);
--> statement-breakpoint
CREATE TABLE "donation_item" (
	"id" text PRIMARY KEY NOT NULL,
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
CREATE TABLE "donation_item_request" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"item_id" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"message" text,
	"status" text DEFAULT 'Em análise' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donation_item_favorite" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"item_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "donation_item_favorite_user_item_unique" UNIQUE("user_id","item_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal" ADD CONSTRAINT "animal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_request" ADD CONSTRAINT "adoption_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_request" ADD CONSTRAINT "adoption_request_animal_id_animal_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_animal_id_animal_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation_item" ADD CONSTRAINT "donation_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation_item_request" ADD CONSTRAINT "donation_item_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation_item_request" ADD CONSTRAINT "donation_item_request_item_id_donation_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."donation_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation_item_favorite" ADD CONSTRAINT "donation_item_favorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation_item_favorite" ADD CONSTRAINT "donation_item_favorite_item_id_donation_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."donation_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "animal_userId_idx" ON "animal" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "adoption_request_userId_idx" ON "adoption_request" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "adoption_request_animalId_idx" ON "adoption_request" USING btree ("animal_id");--> statement-breakpoint
CREATE INDEX "favorite_userId_idx" ON "favorite" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "favorite_animalId_idx" ON "favorite" USING btree ("animal_id");--> statement-breakpoint
CREATE INDEX "donation_item_userId_idx" ON "donation_item" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "donation_item_request_userId_idx" ON "donation_item_request" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "donation_item_request_itemId_idx" ON "donation_item_request" USING btree ("item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "donation_item_request_user_item_unique" ON "donation_item_request" USING btree ("user_id","item_id");--> statement-breakpoint
CREATE INDEX "donation_item_favorite_userId_idx" ON "donation_item_favorite" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "donation_item_favorite_itemId_idx" ON "donation_item_favorite" USING btree ("item_id");