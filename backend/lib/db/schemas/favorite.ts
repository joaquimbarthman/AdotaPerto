import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { animal } from "./animal.ts";
import { user } from "./user.ts";

export const favorite = pgTable(
  "favorite",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    animalId: text("animal_id")
      .notNull()
      .references(() => animal.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("favorite_userId_idx").on(table.userId),
    index("favorite_animalId_idx").on(table.animalId),
    unique("favorite_user_animal_unique").on(table.userId, table.animalId),
  ],
);
