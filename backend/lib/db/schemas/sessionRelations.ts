import { relations } from "drizzle-orm/_relations";
import { session } from "./session.ts";
import { user } from "./user.ts";

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));
