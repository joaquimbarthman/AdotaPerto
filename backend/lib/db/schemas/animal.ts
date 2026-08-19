import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user.ts";

export const animal = pgTable(
  "animal",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    species: text("species").notNull(),
    sex: text("sex").notNull(),
    age: text("age").notNull(),
    size: text("size").notNull(),
    breed: text("breed"),
    weight: text("weight"),
    neutered: text("neutered"),
    vaccination: text("vaccination"),
    dewormed: text("dewormed"),
    hasHealthCondition: boolean("has_health_condition"),
    healthCondition: text("health_condition"),
    energyLevel: text("energy_level"),
    livesWithDogs: text("lives_with_dogs"),
    livesWithCats: text("lives_with_cats"),
    livesWithChildren: text("lives_with_children"),
    personality: text("personality"),
    behaviorNotes: text("behavior_notes"),
    adoptionReason: text("adoption_reason"),
    timeInCare: text("time_in_care"),
    currentlyInCare: boolean("currently_in_care"),
    description: text("description"),
    image: text("image"),
    images: text("images").array(),
    traits: text("traits").array(),
    status: text("status").default("Disponível").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("animal_userId_idx").on(table.userId)],
);

