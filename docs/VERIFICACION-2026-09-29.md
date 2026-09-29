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

## Publicación de tests y simuladores entre perfiles

El modo sin base de datos conserva el contenido en cada perfil del navegador. No existe sincronización remota automática. Para comprobarlo dentro del mismo perfil, «Probar como estudiante» está disponible en Tests y en Simuladores.

Para otros perfiles o equipos:
1. Administración → Tests o Cursos → «Compartir tests y simuladores con otro perfil» → «Descargar publicación».
2. Estudiante → Mis tests o Cursos → «Recibir tests y simuladores de administración» → seleccionar archivo → «Cargar publicación».
3. Los tests públicos aparecen en Mis tests. Los simuladores aparecen en las carreras recomendadas por los resultados del estudiante.
4. Para compartir actualizaciones o retiradas, repetir la descarga/carga. Se conservan respuestas, notas e intentos anteriores.

El formato v2 contiene tests y simuladores; admite publicaciones antiguas v1 de solo tests. No transporta cuentas, contraseñas, respuestas de estudiantes ni notas. Solo exporta tests asignados a todos; los asignados a usuarios locales concretos se prueban en su propio perfil. Compartir publicaciones incluye las claves necesarias para la autocalificación local: es un entorno de pruebas, no un examen seguro.

Verificación: scripts/test-shared-publication.cjs prueba perfiles aislados, catálogo de carreras, autocalificación, actualizaciones, retirada e historial; prueba de Chrome completa con importación, publicación, descarga, carga en otro contexto, respuesta del test, carrera recomendada, simulador con 100/100, recarga y diseño móvil. Compilación estática de 35 rutas y comprobación TypeScript correctas.

## Recorrido conectado para diseñar sin base de datos

El acceso «Probar como estudiante» está disponible en toda la administración, incluido el editor de tests. Permite escoger un estudiante local y abrir Inicio, Mis tests o Autopreparación. Por defecto abre el dashboard /mi-ruta/. «Volver a administración» recupera la cuenta y el apartado de origen, validado contra una lista de rutas internas.

Prueba completa en Chrome: importar/publicar un test y un simulador, crear un estudiante desde Usuarios, cambiar al dashboard, comprobar el test después de recargar, responderlo, obtener la carrera vinculada, realizar su simulador, obtener 100/100 y conservar la nota al recargar. Regreso al apartado administrativo original y comprobación móvil a 390 px correctos. No se transfieren archivos para este recorrido. Se conserva la separación entre respuestas de estudiantes y el catálogo local compartido.

## Diagnóstico de la publicación con inicio de sesión normal

La captura del usuario continúa mostrando únicamente los tests originales. No se ha reproducido su caso con sus datos, ya que su sesión de Chrome no está accesible. Se comprobó el recorrido de cerrar sesión de administración e ingresar con correo y contraseña del estudiante, sin usar el cambio de panel: el test publicado aparece en el inicio, se responde y el simulador asociado conserva la nota.

Se añadió «Comprobar conexión local» en administración, Inicio, Mis tests y Cursos. Muestra un identificador aleatorio del espacio del navegador, el número de tests publicados/borradores y el número de tests asignados. Permite consultar nuevamente el catálogo sin borrar información. No expone credenciales, respuestas ni identidades de otros estudiantes.

Las pruebas verifican que el identificador persiste al cambiar de cuenta y en el login normal; otro almacenamiento aislado obtiene otro identificador y cero publicaciones. La causa del caso concreto del usuario sigue pendiente de comparar esos identificadores y contadores. Este cambio es diagnóstico, no sincronización entre perfiles.
