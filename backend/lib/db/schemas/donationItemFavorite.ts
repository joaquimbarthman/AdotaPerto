import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { donationItem } from "./donationItem.ts";
import { user } from "./user.ts";

export const donationItemFavorite = pgTable("donation_item_favorite", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  itemId: text("item_id").notNull().references(() => donationItem.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("donation_item_favorite_userId_idx").on(table.userId),
  index("donation_item_favorite_itemId_idx").on(table.itemId),
  unique("donation_item_favorite_user_item_unique").on(table.userId, table.itemId),
]);
