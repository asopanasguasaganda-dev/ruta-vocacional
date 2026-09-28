# Cursos, carreras y simuladores

## Accesos y alcance

Una sola entrada **Cursos** reúne el recorrido: el administrador crea cursos y sus simuladores; el estudiante se autoprepara con los cursos relacionados con las carreras de su informe. Los cursos permiten asociar universidades que realmente ofrecen las carreras seleccionadas. Si el estudiante todavía no ha elegido una convocatoria, igualmente ve cursos de admisión relacionados con sus carreras; cuando elige una, las recomendaciones respetan esa convocatoria y versión. La nota del simulador mide la práctica dentro de la plataforma, no sustituye la calificación oficial de admisión.

- Administración: `/admin/cursos`. Requiere una sesión administrativa del servidor.
- Estudiante: `/mi-ruta/cursos`, con recomendaciones, inscripciones y catálogo.
- El inicio del estudiante y su informe enlazan con los cursos relacionados.

El módulo utiliza el catálogo CES existente y sus identificadores. Filtra la oferta universitaria y politécnica de grado; no convierte carreras en universidades ni incorpora institutos tecnológicos como universidades. Los perfiles de admisión son configuraciones revisadas por el administrador, con institución, período, fuente y fecha de revisión. No se publican simuladores oficiales ni claves de respuesta inventadas.

## Guía administrativa

1. En **Perfiles de admisión**, registrar la institución y las carreras de su oferta, período, fuente HTTPS, fecha de revisión, áreas, cantidades, pesos y duración. Separar las reglas documentadas de las reglas internas de preparación.
2. En **Simuladores**, crear un borrador. Se puede reutilizar un banco publicado o importar Word, PDF o HTML mediante el importador existente. La extracción necesita revisión: comprobar cada enunciado, tipo, opciones, clave, explicación y fuente. El HTML se interpreta como contenido, sin ejecutar sus scripts.
3. Configurar selección fija o aleatoria por cupos, pesos por área, duración de práctica y examen, intentos y política de nota principal. Las preguntas con orden significativo pueden conservar el orden de sus opciones.
4. Usar la vista previa para seleccionar las preguntas y comprobar el cálculo con el mismo motor del servidor. Publicar solamente después de revisar. Para modificar un contenido publicado se crea otra versión; no se reescriben los intentos anteriores.
5. En **Cursos**, seleccionar una o varias carreras y ordenar actividades por módulos. Se admiten lecturas, enlaces y simuladores versionados. Elegir actividades obligatorias y criterio de finalización: lectura, entrega o nota mínima. Publicar para todos o asignar a estudiantes específicos.
6. En **Seguimiento**, consultar inscripciones, progreso e intentos; revisar rúbricas y, con un motivo, anular preguntas. Cada revisión conserva su historial. Las gráficas agrupan por simulador, versión y modalidad para evitar mezclar instrumentos diferentes.

Los borradores se pueden descartar. Los contenidos publicados se archivan. Las inscripciones conservan la versión de curso y los simuladores con los que comenzaron.

## Recorrido del estudiante

Elegir carreras objetivo o un perfil de admisión; consultar los cursos sugeridos a partir de esos objetivos y de los informes vocacionales guardados. La recomendación explica su relación; no equivale a una medición de aptitud. Cambiar el objetivo o generar otro informe actualiza las sugerencias sin eliminar inscripciones.

Al inscribirse se conserva el origen de la recomendación. El curso muestra actividades obligatorias, progreso, última nota y siguiente actividad. Se puede iniciar práctica o examen, marcar preguntas y **guardar respuestas** antes de salir. El indicador informa si hay cambios pendientes. Al volver se recuperan las mismas preguntas, orden, respuestas guardadas y plazo.

El plazo se decide en el servidor. Un proceso periódico cierra los intentos vencidos aunque el navegador esté cerrado; al reiniciar el servidor también recupera los vencimientos. En práctica, la retroalimentación por pregunta conserva la primera respuesta confirmada y los reintentos. En examen no se entregan claves antes del cierre. El resultado y su PDF proceden del mismo cálculo persistido.

## Cálculo y versiones

- Motor compartido: `test-engine.ts`; política académica: `training-engine.ts`. El cálculo vocacional existente conserva su comportamiento.
- Las omisiones académicas valen cero y permanecen en el máximo: 12 puntos de 20 son 60 %, aunque haya omisiones.
- Con pesos por área: suma de cada porcentaje de área multiplicado por su peso; los pesos deben sumar 100.
- Las rúbricas pendientes no producen una nota final provisional. Su máximo se conserva hasta la revisión.
- Nota principal configurable: primer intento, último, mejor o media, separada por modalidad y versión. El último resultado se muestra por separado.
- Progreso: actividades obligatorias completadas / actividades obligatorias. Una revisión que invalida el criterio de nota revoca la finalización correspondiente.
- Anular una pregunta la excluye del máximo de su área. Si un área queda sin máximo evaluable, el intento completo queda anulado y no participa en la nota principal.
- Se guardan instantáneas, revisiones, política de cálculo, respuestas y motivo de revisión. Los IDs de preguntas y opciones se mantienen al barajar.

## Persistencia y API

La migración es aditiva, mediante `CREATE TABLE IF NOT EXISTS`. Añade `training_entities`, `training_enrollments`, `training_completions`, `training_attempts`, `training_results`, `training_feedback`, `training_audit`, `training_mutations` y `academic_catalog_versions`. No elimina tablas ni datos anteriores. Antes de actualizar un servidor real, respaldar SQLite y los archivos privados con el proceso detenido.

Las mutaciones usan transacciones, controles de rol y revisiones optimistas. Hay restricciones únicas para inscripción e intento activo. La publicación repetida del mismo contenido y el cierre repetido de un intento son idempotentes. El estudiante solo consulta sus propias inscripciones, intentos y PDF; las claves y rúbricas privadas se excluyen de los intentos abiertos.

| Ruta bajo `/api/training` | Uso |
| --- | --- |
| `GET /` | Estado autorizado, catálogo y recomendaciones |
| `POST /entity`, `/archive`, `/delete-draft` | Gestión administrativa versionada |
| `POST /catalog/preview`, `/catalog/apply` | Revisión y aplicación de un lote CES |
| `PUT /goal` | Objetivos del estudiante |
| `POST /enroll`, `/read`, `/start` | Inscripción y actividades |
| `PUT /answers` | Guardado con revisión |
| `POST /feedback`, `/finish` | Práctica y cierre |
| `GET /attempt?id=…`, `/pdf?id=…` | Resultado autorizado y PDF |
| `POST /review` | Revisión administrativa con historial |
| `POST /preview/select`, `/preview` | Selección y cálculo de prueba |

Los cuerpos y ejemplos ejecutables están en `scripts/qa-training/api.cjs` y `additional.cjs`. Una revisión desactualizada devuelve conflicto, no sobrescribe silenciosamente.

## Actualización del catálogo

Desde administración se carga un JSON con `source`, `sourceUrl`, `retrievedAt` y `careers`, siguiendo la estructura de `lib/server/data/ecuador-offer.json`. La vista previa distingue altas, cambios y registros ausentes. Aplicar conserva los IDs y los registros ausentes del lote, guarda la versión y rechaza una base desactualizada. No es un rastreador automático del CES ni una sustitución destructiva del catálogo.

Los campos adicionales de oferta —institución, sede, provincia, cantón, nivel, estado y fuente— se conservan cuando se proporcionan. El catálogo heredado tiene parte de la ubicación en texto combinado; no se inventan códigos de sedes o divisiones geográficas que no estén en la fuente.

Referencias para revisión humana: [consulta y manual CES](https://appcmi.ces.gob.ec/oferta_vigente/manual_usuario_oferta_vigente/), [admisión de grado EPN](https://www.epn.edu.ec/admision-tercer-nivel/), [admisiones UNAE](https://admisiones.unae.edu.ec/login/). Verificar siempre el período antes de publicar un perfil.

## Ejecución y pruebas

El módulo necesita Node 24, `npm ci`, `npm run build` y `npm start`, con `DATABASE_PATH` en un volumen persistente y `APP_URL` correspondiente al servidor. Configurar `COOKIE_SECURE=true` bajo HTTPS. Mantener un proceso Node persistente para la recuperación de plazos. SQLite y los documentos privados no deben almacenarse en `/tmp` ni en el filesystem efímero de una función.

**La configuración actual de Vercel sigue publicando la vista estática de diseño.** Esa compilación no incluye API, base de datos ni tareas de vencimiento. El módulo informa que necesita servidor; no simula guardados. Publicar el código no conecta automáticamente un backend. Véase `DESPLIEGUE.md`.

Regresiones de cálculo:

```powershell
node scripts/test-test-engine.cjs
node scripts/test-training-engine.cjs
```

Para la suite integral, instalar Playwright en `.qa-tools` y usar una base aislada. En una terminal:

```powershell
npm install --prefix .qa-tools playwright
$env:DATABASE_PATH='.qa-tools/constructor-qa.sqlite'
$env:APP_URL='http://localhost:3006'
npm start -- --port 3006
```

Visitar el servidor una vez para inicializar el esquema. En otra terminal:

```powershell
node scripts/qa-training/setup.cjs
node scripts/qa-training/api.cjs
node scripts/qa-training/additional.cjs
node scripts/qa-training/visual.cjs
node scripts/qa-training/ui-flow.cjs
```

Reiniciar el servidor con la misma base y ejecutar `node scripts/qa-training/persistence.cjs`. Los scripts de navegador usan Chrome instalado en Windows. Generan cuentas ficticias y sesiones exclusivamente en la base de QA; no ejecutar contra usuarios reales. Las evidencias y sesiones quedan excluidas de Git.

Validación realizada: compilación de producción y estática, regresiones de cálculo, importación HTML, publicación, controles de acceso, conflictos, doble cierre, omisiones, rúbricas, anulación, vencimiento sin navegador, actualización de catálogo y persistencia después de reiniciar. Recorrido de interfaz completo desde importación hasta resultado y progreso. Capturas inspeccionadas en 360, 390, 768, 1024 y 1366 px; además, reflujo equivalente a 200 % mediante viewport reducido. PDF de dos páginas renderizado e inspeccionado. Esto comprueba Chrome y tamaños representativos; no implica una certificación de todos los navegadores o dispositivos físicos.
