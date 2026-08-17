import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "../lib/better/auth.ts";

const app = new Hono();

import appRoute from "./routes/index.js";

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/", (c) => {
  return c.json({ hello: "joaquim" });
});

app.route("/home", appRoute);

serve(
  {
    fetch: app.fetch,
    port: 4000,
  },
  () => {
    console.log("Servidor Aberto em http://localhost:4000");
  },
);
