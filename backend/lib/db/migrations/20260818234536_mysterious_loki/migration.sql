CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"birth_date" text,
	"bio" text,
	"zip_code" text,
	"street" text,
	"city" text,
	"state" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
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
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "animal" (
	"id" text PRIMARY KEY,
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
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"animal_id" text NOT NULL,
	"status" text DEFAULT 'Em análise' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"animal_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_user_animal_unique" UNIQUE("user_id","animal_id")
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "animal_userId_idx" ON "animal" ("user_id");--> statement-breakpoint
CREATE INDEX "adoption_request_userId_idx" ON "adoption_request" ("user_id");--> statement-breakpoint
CREATE INDEX "adoption_request_animalId_idx" ON "adoption_request" ("animal_id");--> statement-breakpoint
CREATE INDEX "favorite_userId_idx" ON "favorite" ("user_id");--> statement-breakpoint
CREATE INDEX "favorite_animalId_idx" ON "favorite" ("animal_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "animal" ADD CONSTRAINT "animal_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "adoption_request" ADD CONSTRAINT "adoption_request_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "adoption_request" ADD CONSTRAINT "adoption_request_animal_id_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_animal_id_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE CASCADE;