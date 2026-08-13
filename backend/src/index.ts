import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

import appRoute from "./routes/index.js";

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
