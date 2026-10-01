import nextEnv from "@next/env";
import { spawn } from "node:child_process";
import { assertProductionConfig } from "./production-config.mjs";
nextEnv.loadEnvConfig(process.cwd());
assertProductionConfig();
if (process.env.DB_DRIVER !== "mysql")
  throw Error(
    "Hostinger requiere DB_DRIVER=mysql; se evita iniciar con almacenamiento local por error.",
  );
const { db } = await import("../lib/server/database.ts");
try {
  await db.migrate();
  const admin = await db
    .prepare("SELECT id FROM users WHERE role='admin' LIMIT 1")
    .get();
  if (!admin) {
    const result = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ["scripts/create-admin.mjs"], {
        env: process.env,
        stdio: "inherit",
        windowsHide: true,
      });
      child.once("error", reject);
      child.once("exit", resolve);
    });
    if (result !== 0)
      throw Error(
        "Configura las variables ADMIN_* e INSTITUTION_* para la primera instalación.",
      );
  }
} finally {
  await db.close();
}
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0"],
  { env: process.env, stdio: "inherit", windowsHide: true },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.kill(signal));
server.once("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
server.once("exit", (code) => {
  process.exitCode = code ?? 1;
});
