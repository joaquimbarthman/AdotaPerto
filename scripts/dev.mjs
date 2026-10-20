import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const npmCli = process.env.npm_execpath;
const npm = npmCli ? process.execPath : process.platform === "win32" ? "npm.exe" : "npm";
const npmPrefix = npmCli ? [npmCli] : [];
const npmOptions = { cwd: root, stdio: "inherit" };

function runNpm(args) {
  const result = spawnSync(npm, [...npmPrefix, ...args], npmOptions);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

runNpm(["run", "local:up"]);
runNpm(["run", "db:setup"]);

const children = [
  spawn(npm, [...npmPrefix, "run", "dev:backend"], npmOptions),
  spawn(npm, [...npmPrefix, "run", "dev:frontend"], npmOptions),
];

let stopping = false;
function stop(signal = "SIGINT") {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));

for (const child of children) {
  child.on("exit", (code) => {
    if (!stopping) {
      stop();
      process.exitCode = code ?? 1;
    }
  });
}
