import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./user.ts";

export const organization = pgTable("organization", {
  id: text("id").primaryKey(), name: text("name").notNull(), slug: text("slug").notNull(),
  type: text("type").notNull(), cnpj: text("cnpj"), description: text("description").notNull(),
  legalRepresentativeName: text("legal_representative_name").notNull(),
  logoUrl: text("logo_url"), logo: text("logo"), metadata: text("metadata"), phone: text("phone"),
  coverUrl: text("cover_url"), foundedYear: text("founded_year"),
  contactEmail: text("contact_email").notNull(), whatsapp: text("whatsapp").notNull(),
  instagram: text("instagram"), website: text("website"), postalCode: text("postal_code"),
  street: text("street"), number: text("number"), neighborhood: text("neighborhood"),
  city: text("city").notNull(), state: text("state").notNull(),
  verificationStatus: text("verification_status").default("PENDING").notNull(),
  verificationReviewedBy: text("verification_reviewed_by").references(() => user.id, { onDelete: "set null" }),
  verificationReviewedAt: timestamp("verification_reviewed_at"), verificationReason: text("verification_reason"),
  createdBy: text("created_by").notNull().references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(), updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [uniqueIndex("organization_slug_unique").on(table.slug), uniqueIndex("organization_cnpj_unique").on(table.cnpj), index("organization_created_by_idx").on(table.createdBy)]);

export const organizationMember = pgTable("organization_member", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }), role: text("role").notNull(),
  status: text("status").default("ACTIVE").notNull(), createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [uniqueIndex("organization_member_org_user_unique").on(table.organizationId, table.userId), index("organization_member_user_idx").on(table.userId), index("organization_member_org_idx").on(table.organizationId)]);

export const organizationInvitation = pgTable("organization_invitation", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  invitedUserId: text("invited_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  invitedBy: text("invited_by").notNull().references(() => user.id, { onDelete: "restrict" }), role: text("role").default("MEMBER").notNull(),
  status: text("status").default("PENDING").notNull(), createdAt: timestamp("created_at").defaultNow().notNull(), updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [uniqueIndex("organization_invitation_pending_unique").on(table.organizationId, table.invitedUserId, table.status), index("organization_invitation_user_idx").on(table.invitedUserId)]);

export const organizationVerificationDocument = pgTable("organization_verification_document", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  uploadedBy: text("uploaded_by").notNull().references(() => user.id, { onDelete: "restrict" }), storageKey: text("storage_key").notNull(),
  documentType: text("document_type").notNull(), createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("organization_document_org_idx").on(table.organizationId)]);

// Better Auth's organization plugin uses its own membership and invitation
// tables while sharing the organization table with the application's richer
// institutional profile.
export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("member_organizationId_idx").on(table.organizationId), index("member_userId_idx").on(table.userId)]);

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("invitation_organizationId_idx").on(table.organizationId), index("invitation_email_idx").on(table.email)]);
