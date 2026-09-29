# Publicaciones y acceso administrativo en Vercel

El administrador publica con su correo y contrasena habituales, sin claves adicionales ni paneles de conexion. El servidor verifica la cuenta y emite una cookie HttpOnly, Secure y SameSite=Strict, valida por un dia.

La pesta?a administrativa que ya estaba conectada migra automaticamente su autorizacion anterior y elimina la antigua clave de la pesta?a. No se permite registrar administradores anonimamente. El verificador de contrasena se guarda en un JSON privado separado del catalogo.

## Variables internas

- BLOB_READ_WRITE_TOKEN: acceso al almacen privado de Vercel Blob.
- DESIGN_PUBLISH_KEY: secreto interno de firma de sesiones y migracion de la version anterior. Nunca se muestra en la interfaz.

Los tests y simuladores publicados se comparten automaticamente. Las cuentas de estudiantes, respuestas e intentos siguen guardados en cada navegador; su migracion centralizada es un trabajo separado.

## Verificacion

npm run build:design genera el sitio y las funciones CommonJS de api/ desde lib/server/.

Pruebas: scripts/test-publisher-auth.cjs, scripts/test-cloud-publications.cjs y scripts/test-local-panel-switch.cjs. Los datos de verificacion se mantienen aislados de produccion.
