import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
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
    revokeSessionsOnPasswordReset: true,
  },
  plugins: [
    emailOTP({
      otpLength: 4,
      expiresIn: 600,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "forget-password") return;

        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.AUTH_EMAIL_FROM || "AdotaPerto <onboarding@resend.dev>",
              to: [email],
              subject: "Seu c\u00f3digo para redefinir a senha",
              html: `<div style="font-family:Arial,sans-serif;color:#121e17"><h2 style="color:#0f5d39">AdotaPerto</h2><p>Use o c&oacute;digo abaixo para redefinir sua senha:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${otp}</p><p>O c&oacute;digo expira em 10 minutos. Se voc&ecirc; n&atilde;o solicitou a altera&ccedil;&atilde;o, ignore este e-mail.</p></div>`,
            }),
          });
          if (!response.ok) throw new Error("N\u00e3o foi poss\u00edvel enviar o e-mail de recupera\u00e7\u00e3o.");
          return;
        }

        console.info(`[AdotaPerto] C\u00f3digo de recupera\u00e7\u00e3o para ${email}: ${otp}`);
      },
    }),
  ],
  trustedOrigins: ["http://localhost:3000"],
});
