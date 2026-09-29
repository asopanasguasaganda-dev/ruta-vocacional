# Despliegue del diseño sin base de datos

Vercel usa `npm run build:design` y publica `.design-preview/out` según `vercel.json` (Other, Node 24). No requiere API_ORIGIN ni base de datos.

El ingreso usa correo y contraseña. Los estudiantes crean su cuenta en `/registro/`. En `/admin/login/` se configura el primer acceso administrativo del navegador; después aparece el ingreso habitual. No existen credenciales predeterminadas ni acceso automático.

Las cuentas se conservan en localStorage con un verificador PBKDF2 y sal individual; la sesión activa se mantiene en sessionStorage. Cursos y avances permanecen en este navegador, separados por usuario. No se sincronizan entre equipos. Esto es un flujo local de diseño, no autenticación segura de un servidor: quien controla el navegador puede modificar su almacenamiento.

Los cursos comienzan vacíos. El administrador crea el contenido y el estudiante se inscribe, completa actividades y consulta sus resultados. No se agregan usuarios ni cursos de ejemplo. Las antiguas claves de demostración se dejan intactas pero ya no se usan.

Pruebas: `node scripts/test-design-training.cjs` y `npm run build:design`.
La importación local admite Word y HTML. El envío de correos y las cuentas de servidor corresponden a una etapa posterior.
