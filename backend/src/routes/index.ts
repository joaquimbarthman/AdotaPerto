import { Hono } from "hono";
import { auth } from "../../lib/better/auth.ts";
import { adoptionRequestRoutes } from "./adoptionRequests.ts";
import { animalRoutes } from "./animals.ts";
import { favoriteRoutes } from "./favorites.ts";
import { userRoutes } from "./users.ts";
import { uploadRoutes } from "./uploads.ts";

export type AuthContext = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

export const apiRoutes = new Hono<AuthContext>();

apiRoutes.use("*", async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  await next();
});

apiRoutes.route("/animals", animalRoutes);
apiRoutes.route("/users", userRoutes);
apiRoutes.route("/adoption-requests", adoptionRequestRoutes);
apiRoutes.route("/favorites", favoriteRoutes);
apiRoutes.route("/uploads", uploadRoutes);
