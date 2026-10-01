import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const { db } = await import("../lib/server/database.ts");

// Read-only acceptance check for a new installation, never a reset on startup.
try {
  await db.ensure();
  const checks = {
    administrators:
      "SELECT COUNT(*) AS total FROM users WHERE role='admin' AND status='Activo'",
    otherUsers: "SELECT COUNT(*) AS total FROM users WHERE role<>'admin'",
    studentDocuments:
      "SELECT COUNT(*) AS total FROM documents WHERE owner<>'system'",
  };
  for (const table of [
    "submissions",
    "assessment_attempts",
    "assessment_results",
    "released_results",
    "guidance_reports",
    "orientation_reports",
    "training_enrollments",
    "training_completions",
    "training_attempts",
    "training_results",
    "training_feedback",
  ])
    checks[table] = `SELECT COUNT(*) AS total FROM ${table}`;
  const counts = {};
  for (const [key, sql] of Object.entries(checks)) {
    counts[key] = Number((await db.prepare(sql).get()).total);
  }
  const clean =
    counts.administrators === 1 &&
    Object.entries(counts).every(
      ([key, count]) => key === "administrators" || count === 0,
    );
  console.log(JSON.stringify({ clean, counts }, null, 2));
  if (!clean)
    throw Error(
      "La instalación no está vacía o no tiene exactamente un administrador activo. No se borró ningún registro.",
    );
} catch (error) {
  console.error(error.code || error.message);
  process.exitCode = 1;
} finally {
  await db.close();
}
