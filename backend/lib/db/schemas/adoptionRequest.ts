import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { animal } from "./animal.ts";
import { user } from "./user.ts";

export const adoptionRequest = pgTable(
  "adoption_request",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    animalId: text("animal_id")
      .notNull()
      .references(() => animal.id, { onDelete: "cascade" }),
    status: text("status").default("Em análise").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("adoption_request_userId_idx").on(table.userId),
    index("adoption_request_animalId_idx").on(table.animalId),
  ],
);
