import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { donationItem } from "./donationItem.ts";
import { user } from "./user.ts";

export const donationItemRequest = pgTable("donation_item_request", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  itemId: text("item_id").notNull().references(() => donationItem.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1).notNull(),
  message: text("message"),
  status: text("status").default("Em análise").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("donation_item_request_userId_idx").on(table.userId),
  index("donation_item_request_itemId_idx").on(table.itemId),
  uniqueIndex("donation_item_request_user_item_unique").on(table.userId, table.itemId),
]);
