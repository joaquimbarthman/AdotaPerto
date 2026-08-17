import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user.ts";

export const animal = pgTable(
  "animal",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    atributes: text("atributes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("animal_userId_idx").on(table.userId)],
);
