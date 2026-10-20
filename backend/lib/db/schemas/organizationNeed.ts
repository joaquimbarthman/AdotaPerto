import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization } from "./organization.ts";

export const organizationNeed = pgTable("organization_need", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  priority: text("priority").default("Média").notNull(),
  description: text("description").notNull(),
  status: text("status").default("Ativa").notNull(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [index("organization_need_organizationId_idx").on(table.organizationId)]);
