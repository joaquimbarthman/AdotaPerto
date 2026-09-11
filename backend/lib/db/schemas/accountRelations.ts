import { relations } from "drizzle-orm";
import { account } from "./account.ts";
import { user } from "./user.ts";

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
