import { relations } from "drizzle-orm/_relations";
import { adoptionRequest } from "./adoptionRequest.ts";
import { animal } from "./animal.ts";
import { user } from "./user.ts";

export const adoptionRequestRelations = relations(adoptionRequest, ({ one }) => ({
  user: one(user, {
    fields: [adoptionRequest.userId],
    references: [user.id],
  }),
  animal: one(animal, {
    fields: [adoptionRequest.animalId],
    references: [animal.id],
  }),
}));
