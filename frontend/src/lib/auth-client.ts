import { apiBaseUrl } from "@/lib/api-url";
import { createAuthClient } from "better-auth/react";
import { adminClient, emailOTPClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: apiBaseUrl(),
    plugins: [
        adminClient(),
        emailOTPClient(),
        organizationClient({
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
});

export const { signIn, signUp, useSession, signOut } = authClient;
