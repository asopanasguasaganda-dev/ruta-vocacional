# Tests, carreras y cursos en la etapa de diseño

El despliegue de Vercel continúa sin base de datos. Las cuentas, documentos interpretados, cursos y entregas se conservan en el navegador. No se sincronizan entre dispositivos.

## Importación

Admite PDF con texto seleccionable (hasta 100 páginas), Word `.docx` y HTML, hasta 10 MB. Los PDF escaneados necesitan OCR previo. No se ejecutan scripts del documento. El worker de PDF se copia desde la versión instalada de pdfjs-dist mediante `npm ci` / `postinstall`.

Las preguntas y opciones se revisan antes de publicar. El texto `Respuesta correcta: B` o `Clave: B` se conserva como clave. HTML estructurado admite `<script type="application/json">` con un instrumento o `{ "instruments": [...] }`, incluyendo `questions`, `scoring`, `dimensions`, `careerLinks`, claves y rúbricas. Las dimensiones explícitas con escala se convierten a contribuciones de opciones, conservando su inversión. Los documentos sin criterios quedan descriptivos: importar no valida un instrumento psicométrico.

Los simuladores usan la misma extracción; requieren revisar la clave, la explicación y la procedencia de cada pregunta antes de publicar. Se incorporan al curso como una actividad de tipo «Simulador evaluable».

## Recomendaciones consistentes

Los resultados se calculan con las reglas guardadas y la versión respondida. Los instrumentos RIASEC con seis dimensiones explícitas pueden alimentar la guía de intereses; otros instrumentos necesitan relaciones documentadas entre sus puntuaciones y el catálogo de carreras. Las respuestas descriptivas no se convierten arbitrariamente en aptitudes.

El contenido académico asistido por Gemini ya incluido complementa las explicaciones. Esta publicación estática no llama a un modelo para interpretar respuestas personales ni contiene claves de IA. La selección de carreras es determinista; no se presenta como diagnóstico de aptitud. Los cursos se relacionan por el mismo identificador de carrera del catálogo nacional.

## Administración y navegación

Los borradores se editan y eliminan. Las versiones publicadas se archivan/restauran; para cambiarlas se duplica una nueva versión. Un intento iniciado conserva su instrumento aunque después se archive. Las rúbricas pendientes se califican desde administración y los resultados se publican explícitamente cuando corresponde.

Las listas principales de tests y cursos en administración y estudiante muestran 10 elementos por página, con búsqueda/filtros. La página se reinicia al cambiar el filtro y se ajusta después de eliminar elementos.

## Verificación

- `node scripts/test-test-engine.cjs`
- `node scripts/test-import-guidance.cjs`
- `node scripts/test-local-test-crud.cjs`
- `node scripts/test-local-guidance.cjs`
- `node scripts/test-design-training.cjs`
- `npm run build:design`

Prueba de navegador: importar PDF, DOCX y HTML; publicar/archivar/restaurar/eliminar; paginar 23 instrumentos; responder el test; consultar guía y PDF; seleccionar carrera; publicar curso y simulador; entregar práctica; comprobar móvil.

## Recorrido dirigido por resultados

La vista de estudiante presenta exclusivamente las carreras recomendadas por sus tests. Muestra directamente las instituciones, sedes y modalidades vinculadas. «Seguir curso» abre `/mi-ruta/cursos/?carrera=ID` con la carrera filtrada. Las elecciones manuales previas no se agregan a las recomendaciones del test.

Los nuevos simuladores deben ser autocalificables: selección única/múltiple, sí/no, número con intervalo correcto o texto breve con respuestas aceptadas. No se publican respuestas abiertas con rúbrica. Las claves deben existir y validarse al preparar el simulador; el estudiante obtiene la nota al entregar, sin revisión del administrador. Las versiones antiguas con rúbricas deben actualizarse antes de iniciar nuevos intentos. Los resultados históricos se conservan.

El examen ofrece navegación numerada, estados de respuesta, marcas, temporizador, guardado automático y resumen antes de confirmar la entrega.

## Simuladores directos por carrera

La sección Cursos de administración contiene ahora una sola gestión: «Simuladores y preguntas». No hay que crear cursos, módulos ni actividades. En el editor se importan PDF con texto, DOCX o HTML, se revisan preguntas y claves y se asignan una o varias carreras mediante búsqueda.

La detección propone carreras cuyos nombres aparecen explícitamente en el título, nombre de archivo o inicio del documento, o cuyos identificadores están incluidos en el documento estructurado. No asigna carreras basándose en una supuesta afinidad de preguntas genéricas. Si no hay coincidencias, el administrador las selecciona. Toda preselección es editable antes de publicar.

El estudiante ve únicamente sus carreras recomendadas. «Autopreparación» abre los simuladores publicados de esa carrera y permite practicar o iniciar un examen sin inscripción intermedia. Se presentan intentos, notas según la política del simulador, historial y progreso (simuladores con una entrega calificada / simuladores disponibles).

Las asociaciones anteriores se recuperan desde los cursos existentes para los simuladores que aún no tienen carreras explícitas. Los intentos conservan sus versiones y resultados; archivar no borra el historial. La versión publicada se protege: se crea otra versión para modificarla.

Validación adicional: `node scripts/test-direct-simulators.cjs`. Se probó en navegador la detección de carrera en PDF/DOCX/HTML, revisión, publicación directa, selección de carrera recomendada, guardado automático, nota, progreso, recarga y móvil.

## Tests publicados y sincronización local

Los cambios se actualizan mediante eventos de almacenamiento entre pestañas del mismo perfil del navegador. Los errores de guardado/publicación se propagan y no se confirman como guardados. «Editar test» crea una nueva versión; al publicarla se archiva la anterior para nuevos intentos. «Duplicar» crea un instrumento independiente. «Eliminar test» retira su publicación conservando entregas e intentos; puede recuperarse con el filtro Eliminado. Los borradores se eliminan directamente.

Los perfiles y equipos distintos no comparten localStorage. En esta etapa sin base de datos, administración puede abrir «Publicar tests en otro perfil o equipo» y descargar una publicación JSON. En Mis tests, el estudiante abre «Cargar tests publicados por administración», elige el archivo y confirma la carga. Se incluyen únicamente tests publicados para todos; se excluyen cuentas, contraseñas, respuestas y asignaciones personales.

Cada nueva publicación del mismo origen actualiza su catálogo importado, retira las versiones que ya no están publicadas y conserva las entregas previas. Esta transferencia por archivo no es sincronización automática entre equipos; para ello hace falta almacenamiento compartido. Prueba: `node scripts/test-test-publication.cjs`.
