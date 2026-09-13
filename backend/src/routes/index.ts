import { Hono } from "hono";
import { auth } from "../../lib/better/auth.ts";
import { adoptionRequestRoutes } from "./adoptionRequests.ts";
import { animalRoutes } from "./animals.ts";
import { donationItemRequestRoutes } from "./donationItemRequests.ts";
import { donationItemRoutes } from "./donationItems.ts";
import { favoriteRoutes } from "./favorites.ts";
import { mapRoutes } from "./map.ts";
import { uploadRoutes } from "./uploads.ts";
import { userRoutes } from "./users.ts";
import { registrationRoutes } from "./registration.ts";
import { adminRoutes } from "./admin.ts";
import {
  hasCompleteAddress,
  PROFILE_ADDRESS_REQUIRED,
} from "../services/profile-completion.ts";

export type AuthContext = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

export const apiRoutes = new Hono<AuthContext>();
const addressRequiredPostRoutes = new Set([
  "/api/animals",
  "/api/donation-items",
  "/api/adoption-requests",
  "/api/donation-item-requests",
]);

apiRoutes.route("/registration", registrationRoutes);

apiRoutes.use("*", async (c, next) => {
  // Map endpoints are public and do not use session data.
  if (c.req.path.startsWith("/api/map/")) {
    await next();
    return;
  }
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);

  const normalizedPath = c.req.path.replace(/\/+$/, "");
  if (
    c.req.method === "POST" &&
    session?.user &&
    addressRequiredPostRoutes.has(normalizedPath) &&
    !(await hasCompleteAddress(session.user.id))
  ) {
    return c.json(
      {
        error:
          "Complete seu endereço no perfil antes de publicar ou fazer uma solicitação.",
        code: PROFILE_ADDRESS_REQUIRED,
        redirectTo: "/perfil#endereco",
      },
      403,
    );
  }

  await next();
});

apiRoutes.route("/animals", animalRoutes);
apiRoutes.route("/admin", adminRoutes);
apiRoutes.route("/users", userRoutes);
apiRoutes.route("/adoption-requests", adoptionRequestRoutes);
apiRoutes.route("/favorites", favoriteRoutes);
apiRoutes.route("/uploads", uploadRoutes);
apiRoutes.route("/donation-items", donationItemRoutes);
apiRoutes.route("/donation-item-requests", donationItemRequestRoutes);
apiRoutes.route("/map", mapRoutes);
