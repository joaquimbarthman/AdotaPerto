import { relations } from "drizzle-orm/_relations";
import { account } from "./account.ts";
import { session } from "./session.ts";
import { user } from "./user.ts";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));
