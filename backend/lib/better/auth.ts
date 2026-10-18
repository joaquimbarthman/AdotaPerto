import { betterAuth } from "better-auth";
import { admin, emailOTP, organization as organizationPlugin } from "better-auth/plugins";
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
  invitation,
  member,
  organization,
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
  organization,
  member,
  invitation,
};

export function createAuth(database = db) {
  const trustedOrigins = [
    "http://localhost:3000",
    ...(process.env.CORS_ORIGINS || process.env.FRONTEND_URL || process.env.BETTER_AUTH_URL || process.env.RENDER_EXTERNAL_URL || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ];

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
  baseURL: process.env.BETTER_AUTH_URL || process.env.RENDER_EXTERNAL_URL,
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
    organizationPlugin({
      allowUserToCreateOrganization: true,
      schema: {
        organization: {
          additionalFields: {
            cnpj: { type: "string", required: false, input: true },
            phone: { type: "string", required: false, input: true },
            website: { type: "string", required: false, input: true },
            instagram: { type: "string", required: false, input: true },
            description: { type: "string", required: false, input: true },
          },
        },
      },
    }),
  ],
  trustedOrigins,
});
}

export const auth = createAuth();
