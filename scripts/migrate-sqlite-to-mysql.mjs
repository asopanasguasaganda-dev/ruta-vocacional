import nextEnv from "@next/env";
import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
nextEnv.loadEnvConfig(process.cwd());
const { createDatabase } = await import("../lib/server/database.ts");
const sourcePath = process.env.SQLITE_SOURCE;
if (!sourcePath)
  throw Error(
    "Define SQLITE_SOURCE con la ruta de una copia de respaldo SQLite.",
  );
if (process.env.DB_DRIVER !== "mysql")
  throw Error("Configura DB_DRIVER=mysql y una base MySQL de destino vacía.");
const source = new DatabaseSync(resolve(sourcePath), { readOnly: true }),
  target = createDatabase(process.env);
const columns = JSON.parse(readFileSync("database/columns.json", "utf8"));
const tables = Object.keys(columns).filter(
  (t) => !["sessions", "resets", "attempts"].includes(t),
);
try {
  await target.ensure();
  const available = new Set(
    source
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((t) => t.name),
  );
  const counts = [];
  for (const table of tables) {
    const row = await target
      .prepare("SELECT COUNT(*) n FROM `" + table + "`")
      .get();
    if (row.n)
      throw Error(
        "El destino contiene datos en " + table + ". No se sobrescribirá.",
      );
    if (available.has(table))
      counts.push({
        table,
        rows: source.prepare('SELECT COUNT(*) n FROM "' + table + '"').get().n,
      });
  }
  console.table(counts);
  if (!process.argv.includes("--apply"))
    console.log(
      "Solo comprobación. Repite con --apply después de respaldar la base y detener las escrituras en el origen.",
    );
  else {
    await target.transaction(async () => {
      for (const { table } of counts) {
        const present = new Set(
          source
            .prepare('PRAGMA table_info("' + table + '")')
            .all()
            .map((c) => c.name),
        );
        const fields = columns[table].filter((k) => present.has(k));
        const sql =
          "INSERT INTO `" +
          table +
          "` (" +
          fields.map((k) => "`" + k + "`").join(",") +
          ") VALUES (" +
          fields.map(() => "?").join(",") +
          ")";
        for (const row of source
          .prepare('SELECT * FROM "' + table + '"')
          .iterate())
          await target.prepare(sql).run(...fields.map((k) => row[k]));
      }
      for (const { table, rows } of counts)
        if (
          (await target.prepare("SELECT COUNT(*) n FROM `" + table + "`").get())
            .n !== rows
        )
          throw Error("Conteo distinto en " + table);
    });
    console.log(
      "Migración verificada y confirmada. Las sesiones deben iniciarse de nuevo.",
    );
  }
} catch (e) {
  console.error(e.code || e.message);
  process.exitCode = 1;
} finally {
  source.close();
  await target.close();
}
