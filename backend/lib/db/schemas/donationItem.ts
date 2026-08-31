import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user.ts";

export const donationItem = pgTable("donation_item", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  itemName: text("item_name").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  condition: text("condition").notNull(),
  expirationDate: text("expiration_date"),
  description: text("description").notNull(),
  mainImage: text("main_image").notNull(),
  images: text("images").array().default([]).notNull(),
  deliveryMethod: text("delivery_method").notNull(),
  availableUntil: text("available_until"),
  status: text("status").default("Disponível").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [index("donation_item_userId_idx").on(table.userId)]);
