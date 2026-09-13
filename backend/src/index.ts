import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "../lib/better/auth.ts";
import { apiRoutes } from "./routes/index.ts";
import { statusRoutes } from "./routes/status.ts";

const app = new Hono();


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


serve(
  {
    fetch: app.fetch,
    port: 4000,
  },
  () => {
    const apiPublicUrl = process.env.API_PUBLIC_URL?.trim().replace(/\/+$/, "");
    console.log(apiPublicUrl ? `Servidor Aberto em ${apiPublicUrl}/status` : "Servidor aberto na porta 4000");
  },
);
