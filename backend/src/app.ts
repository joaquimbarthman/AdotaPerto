import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "../lib/better/auth.ts";
import { apiRoutes } from "./routes/index.ts";
import { statusRoutes } from "./routes/status.ts";

export const app = new Hono();
const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || process.env.BETTER_AUTH_URL || process.env.RENDER_EXTERNAL_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (
        /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}):3000$/.test(
          origin,
        )
      )
        return origin;
      if (configuredOrigins.includes(origin.replace(/\/$/, ""))) return origin;
      return "http://localhost:3000";
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.route("/status", statusRoutes);
app.route("/api", apiRoutes);
