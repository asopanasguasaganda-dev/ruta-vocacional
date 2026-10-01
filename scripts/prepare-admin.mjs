import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const email = (process.argv[2] || "").trim().toLowerCase();
if (
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
  email.length > 254 ||
  /["'\\]/.test(email)
) {
  throw Error("Uso: npm run admin:prepare -- tu-correo@dominio.com");
}
const target = resolve(".local/hostinger-admin.env");
mkdirSync(resolve(".local"), { recursive: true });
writeFileSync(
  target,
  [
    "# Credenciales privadas para la primera instalación. No publicar ni incluir en el ZIP.",
    `ADMIN_EMAIL=${email}`,
    `ADMIN_PASSWORD=${randomBytes(24).toString("base64url")}`,
    "ADMIN_NAME=Administrador",
    "INSTITUTION_NAME=Ruta Vocacional 360",
    "INSTITUTION_CODE=RUTA360",
    "",
  ].join("\n"),
  { encoding: "utf8", mode: 0o600, flag: "wx" },
);
console.log("Configuración privada preparada en " + target);
console.log(
  "Todavía no se ha creado una cuenta. Copia esos valores a las variables de Hostinger para la primera instalación.",
);
