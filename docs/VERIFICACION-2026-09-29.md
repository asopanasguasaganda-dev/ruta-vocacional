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

## Creación y publicación de tests (29 de septiembre, revisión final)

- Importación con acción «Revisar y publicar», validación visible y observaciones desplegables.
- Guardado explícito en cualquier paso y publicación de la última edición, sin depender del temporizador de autoguardado.
- El guardado pendiente termina antes de publicar; el temporizador se cancela para impedir que una escritura antigua reemplace la publicación.
- Resultados configurables por pregunta, con navegación directa desde los errores de validación.
- Comprobado en Chrome con archivos de prueba DOCX, PDF con texto y HTML: importar, guardar, recargar, publicar, aparecer en el estudiante, responder y entregar.
- Creación manual comprobada: publicación bloqueada sin clave, corrección de la clave, publicación inmediata, persistencia al recargar y entrega del estudiante.
- Compilación estática de 35 rutas, TypeScript, motor de puntuación, importación, CRUD local y cambio de panel administrativo/estudiante: correctos.
- Comprobada la ausencia de errores JavaScript y desbordamiento horizontal a 390 px.

Alcance: modo local sin base de datos; administrador y estudiante comparten el contenido en el mismo perfil del navegador. PDF escaneados necesitan OCR externo en este modo. Se conservan las reglas explícitas; no se inventan claves ni criterios de interpretación ausentes. El documento original mostrado en la captura del usuario no está disponible en el repositorio: la verificación utiliza documentos de prueba.
