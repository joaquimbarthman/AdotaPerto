import { serve } from "@hono/node-server";
import { app } from "./app.ts";

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 4000,
  },
  () => {
    const apiPublicUrl = (process.env.BETTER_AUTH_URL || process.env.RENDER_EXTERNAL_URL)
      ?.trim()
      .replace(/\/+$/, "");
    console.log(apiPublicUrl ? `Servidor Aberto em ${apiPublicUrl}/status` : "Servidor aberto na porta 4000");
  },
);
