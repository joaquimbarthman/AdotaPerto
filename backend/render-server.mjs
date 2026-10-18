import { createServer } from "node:http";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getRequestListener } from "@hono/node-server";
import { app } from "./src/app.ts";

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(backendDir, "../frontend");
const requireFrontend = createRequire(path.join(frontendDir, "package.json"));
const next = requireFrontend("next");
const nextApp = next({ dev: false, dir: frontendDir });

await nextApp.prepare();

const nextHandler = nextApp.getRequestHandler();
const apiHandler = getRequestListener(app.fetch);
const port = Number(process.env.PORT) || 3000;

createServer((request, response) => {
  const pathname = new URL(request.url || "/", "http://localhost").pathname;
  if (pathname === "/status" || pathname === "/api" || pathname.startsWith("/api/")) {
    apiHandler(request, response);
    return;
  }

  void nextHandler(request, response);
}).listen(port, "0.0.0.0", () => {
  console.log(`AdotaPerto pronto na porta ${port}`);
});
