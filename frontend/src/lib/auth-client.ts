import { createAuthClient } from "better-auth/react";
import { adminClient, emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    plugins: [adminClient(), emailOTPClient()],
});

export const { signIn, signUp, useSession, signOut } = authClient;
