import { relations } from "drizzle-orm";
import { account } from "./account.ts";
import { adoptionRequest } from "./adoptionRequest.ts";
import { animal } from "./animal.ts";
import { favorite } from "./favorite.ts";
import { session } from "./session.ts";
import { user } from "./user.ts";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  animals: many(animal),
  adoptionRequests: many(adoptionRequest),
  favorites: many(favorite),
}));
