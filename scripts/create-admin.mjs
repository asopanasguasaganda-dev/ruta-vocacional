import nextEnv from "@next/env";
import { randomUUID, randomBytes, scryptSync } from "node:crypto";
nextEnv.loadEnvConfig(process.cwd());
const { db } = await import("../lib/server/database.ts");
const {
  ADMIN_EMAIL: rawEmail,
  ADMIN_PASSWORD,
  ADMIN_NAME,
  INSTITUTION_NAME,
  INSTITUTION_CODE,
} = process.env;
const ADMIN_EMAIL = rawEmail?.trim().toLowerCase();
try {
  if (
    !ADMIN_EMAIL ||
    !/^\S+@\S+\.\S+$/.test(ADMIN_EMAIL) ||
    ADMIN_EMAIL.length > 254 ||
    !ADMIN_PASSWORD ||
    /REEMPLAZAR|CHANGE.?ME|TU-CONTRASENA/i.test(ADMIN_PASSWORD) ||
    ADMIN_PASSWORD.length < 15 ||
    ADMIN_PASSWORD.length > 128 ||
    !ADMIN_NAME ||
    ADMIN_NAME.length > 140 ||
    !INSTITUTION_NAME ||
    INSTITUTION_NAME.length > 191 ||
    !INSTITUTION_CODE ||
    INSTITUTION_CODE.length > 191
  )
    throw Error(
      "Define ADMIN_EMAIL, ADMIN_PASSWORD (15–128 caracteres), ADMIN_NAME, INSTITUTION_NAME e INSTITUTION_CODE.",
    );
  await db.ensure();
  await db.transaction(async () => {
    if (
      await db
        .prepare("SELECT id FROM users WHERE email=?")
        .get(ADMIN_EMAIL.toLowerCase())
    )
      throw Error("La cuenta ya existe; no se modificó su contraseña.");
    const existing = await db
      .prepare("SELECT id FROM institutions WHERE code=?")
      .get(INSTITUTION_CODE);
    const institutionId = existing?.id || randomUUID();
    const salt = randomBytes(16).toString("hex");
    if (!existing)
      await db
        .prepare("INSERT INTO institutions VALUES(?,?,?)")
        .run(institutionId, INSTITUTION_NAME, INSTITUTION_CODE);
    await db
      .prepare("INSERT INTO users VALUES(?,?,?,?,?,?,?,?)")
      .run(
        randomUUID(),
        ADMIN_NAME,
        ADMIN_EMAIL.toLowerCase(),
        salt + ":" + scryptSync(ADMIN_PASSWORD, salt, 64).toString("hex"),
        "admin",
        institutionId,
        "",
        "Activo",
      );
    if (
      !(await db
        .prepare(
          "SELECT value FROM documents WHERE owner='system' AND key='rv360:platform'",
        )
        .get())
    )
      await db
        .prepare("INSERT INTO documents(owner,key,value) VALUES(?,?,?)")
        .run("system", "rv360:platform", JSON.stringify({ institutionId }));
  });
  console.log("Cuenta administrativa creada. Acceso: /admin/login");
} catch (error) {
  console.error(error.code || error.message);
  process.exitCode = 1;
} finally {
  await db.close();
}
