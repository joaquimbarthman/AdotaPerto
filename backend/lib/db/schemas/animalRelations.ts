import { relations } from "drizzle-orm/_relations";
import { adoptionRequest } from "./adoptionRequest.ts";
import { animal } from "./animal.ts";
import { favorite } from "./favorite.ts";
import { user } from "./user.ts";

export const animalRelations = relations(animal, ({ one, many }) => ({
  user: one(user, {
    fields: [animal.userId],
    references: [user.id],
  }),
  adoptionRequests: many(adoptionRequest),
  favorites: many(favorite),
}));
