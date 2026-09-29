# Verificación del diseño local — 29 de septiembre de 2026

La publicación sigue siendo una exportación estática sin base de datos. Las pruebas se ejecutaron con cuentas y respuestas sintéticas, sin modificar cuentas reales.

## Recorridos verificados

- Registro y acceso administrativo y estudiantil, contraseña incorrecta, recarga y protección de rutas.
- Doce pantallas principales de administrador y estudiante a 1366 y 390 px: sin excepciones de JavaScript ni desbordamiento horizontal.
- Publicación, edición mediante versión nueva, archivo, eliminación y restauración de tests originales y personalizados. Las pestañas del mismo perfil actualizan el catálogo.
- Búsqueda y paginación con 23 tests: páginas de 10, 10 y 3; el filtro devuelve la primera página.
- Importación de simuladores desde PDF con texto, DOCX y HTML, asignación a carreras, publicación, respuesta, guardado, nota automática y conservación tras recarga.
- PDF de orientación generado, descargado y revisado visualmente en tres páginas.

## Defectos corregidos durante la revisión

- El resumen del inicio estudiantil consultaba inscripciones a cursos antiguos. Ahora usa los simuladores publicados, intentos y carreras recomendadas.
- Crear o editar un usuario desde administración no modificaba las cuentas locales. Ahora crea credenciales con contraseña inicial, conserva las modificaciones y permite suspensión y reactivación; se conservan las respuestas existentes.
- La contraseña, la foto de perfil y la exportación de datos dependían de operaciones de servidor ausentes. Se añadieron operaciones locales con validación, cambio de contraseña, revocación de sesiones y exportación sin verificadores de contraseña.
- La preferencia de registro no se aplicaba. Ahora se guarda en el espacio compartido del mismo navegador y controla los registros nuevos.
- El informe contaba únicamente los tres tests originales. Ahora incluye los tests personalizados y las asignaciones disponibles; las entregas repetidas no duplican el contador.

Pruebas de regresión: `node scripts/test-local-user-management.cjs`, `node scripts/test-local-guidance.cjs`, `node scripts/test-original-lifecycle.cjs`, `node scripts/test-local-test-crud.cjs`, `node scripts/test-test-publication.cjs`, `node scripts/test-direct-simulators.cjs`. Compilación: `npm run build:design`.

## Bloqueo pendiente

Los perfiles y equipos distintos no comparten localStorage. El catálogo no se sincroniza automáticamente entre ellos. Las pruebas del mismo perfil no verifican esa capacidad ni sustituyen un servicio compartido. La transferencia manual de publicaciones permanece disponible.

Para corregir esa conexión se necesita almacenamiento compartido y autenticación administrativa para publicarlo. Puede hacerse con archivos en Vercel Blob sin una base de datos, pero el proyecto aún no tiene esa integración ni sus credenciales configuradas. No se considera completada la conexión entre perfiles.
