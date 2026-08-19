import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.ts";
import {
  account,
  accountRelations,
  adoptionRequest,
  adoptionRequestRelations,
  animal,
  animalRelations,
  favorite,
  favoriteRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "../db/schemas/index.ts";

const schema = {
  user,
  account,
  verification,
  session,
  animal,
  adoptionRequest,
  favorite,
  userRelations,
  accountRelations,
  sessionRelations,
  animalRelations,
  adoptionRequestRelations,
  favoriteRelations,
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["http://localhost:3000"],
});
