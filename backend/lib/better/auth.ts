import { betterAuth } from "better-auth";
import { admin, emailOTP } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
  emailVerificationEmail,
  passwordResetEmail,
  sendTransactionalEmail,
} from "../email/resend.ts";
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

export function createAuth(database = db) {
  const authDatabase: ReturnType<typeof drizzleAdapter> = (options) => {
    const config = { provider: "pg" as const, schema };
    const adapter = drizzleAdapter(database, config)(options);
    return {
      ...adapter,
      transaction: (callback) => database.transaction(async (tx) => {
        // Serialize sign-ups until the user and credentials have been saved.
        await tx.execute(sql`select pg_advisory_xact_lock(74219, 1)`);
        return callback(drizzleAdapter(tx, config)(options));
      }),
    };
  };

  return betterAuth({
  database: authDatabase,
  databaseHooks: {
    user: {
      create: {
        async before(newUser) {
          const [existingUser] = await database.select({ id: user.id }).from(user).limit(1);
          return { data: { ...newUser, role: existingUser ? "user" : "admin" } };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
  },
  user: {
    changeEmail: {
      enabled: true,
    },
  },
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      const message = emailVerificationEmail(url);
      await sendTransactionalEmail({ to: user.email, ...message });
    },
  },
  plugins: [
    admin(),
    emailOTP({
      otpLength: 4,
      expiresIn: 600,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "forget-password") return;
        const message = passwordResetEmail(otp);
        await sendTransactionalEmail({ to: email, ...message });
      },
    }),
  ],
  trustedOrigins: ["http://localhost:3000"],
});
}

export const auth = createAuth();
