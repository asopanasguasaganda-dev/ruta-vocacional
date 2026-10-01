import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const { db } = await import("../lib/server/database.ts");
try {
  if (process.argv[2] === "migrate") {
    await db.migrate();
    console.log("Migraciones aplicadas correctamente (" + db.driver + ").");
  } else {
    await db.ensure();
    await db.prepare("SELECT 1").get();
    console.log("Conexión disponible: " + db.driver);
  }
} catch (error) {
  console.error("Base de datos: " + (error.code || error.message));
  process.exitCode = 1;
} finally {
  await db.close();
}
