import { relations } from "drizzle-orm/_relations";
import { animal } from "./animal.ts";
import { favorite } from "./favorite.ts";
import { user } from "./user.ts";

export const favoriteRelations = relations(favorite, ({ one }) => ({
  user: one(user, {
    fields: [favorite.userId],
    references: [user.id],
  }),
  animal: one(animal, {
    fields: [favorite.animalId],
    references: [animal.id],
  }),
}));
