import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { auth } from "../lib/better/auth.ts";
import { apiRoutes } from "./routes/index.ts";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api", apiRoutes);

serve(
  {
    fetch: app.fetch,
    port: 4000,
  },
  () => {
    console.log("Servidor Aberto em http://localhost:4000");
  },
);

