# Constructor de tests y adaptación móvil

## Diagnóstico

La implementación anterior editaba dentro de un diálogo con pie adhesivo, tenía tres pasos y solo cuatro formatos. El servidor rechazaba borradores incompletos y omitía las selecciones múltiples del cálculo por dimensiones. Las opciones usaban su valor como identidad y puntuación simultáneamente. La publicación no conservaba una entidad de intento explícita y la simulación tenía su propio renderizado.

En la versión local de la portada no se reprodujo el recorte lateral de la captura antigua de Vercel. Se verificaron las dimensiones reales del documento: no se aplicó `zoom`, escalado global ni ocultación del desbordamiento para esconder errores.

## Cambios

- Editor como página en `/admin/evaluaciones?editar=ID`, con cinco pasos, borrador recuperable y guardado automático. El indicador distingue cambios pendientes, guardado en curso y error. Un conflicto de revisión devuelve HTTP 409; no sobrescribe otra sesión.
- Borradores incompletos admitidos. Publicación validada y transaccional; revisiones publicadas inmutables. Las nuevas versiones conservan un identificador estable y archivan la versión previa del catálogo personalizado.
- Formatos: selección única y múltiple, sí/no, escala, número, texto breve/largo, matriz, ordenación y bloque informativo. Opciones con identidad estable y puntuación separada; condiciones de visibilidad, secciones, selección exclusiva, longitudes y límites numéricos. Escalas reutilizables con confirmación y resumen previo.
- Motor común `2.0.0`: descriptivo, total, dimensiones, aciertos, rúbrica y mixto por pregunta. Suma o media ponderada, contribuciones a varias dimensiones, inversión, límites alcanzables de multiselección, cobertura, pendientes y trazabilidad. Los rangos cerrados solapados se rechazan. Fuera de un rango configurado no se inventa una interpretación.
- Normalización opcional dentro del recorrido, sin presentarla como aptitud. Omisiones y preguntas ocultas se excluyen de puntos y límites; esta política queda persistida. Las rúbricas pendientes no equivalen a cero.
- Simulación protegida por permisos de administrador, sin crear entregas ni estadísticas. Comparte el componente de respuesta con el estudiante y ejecuta el cálculo en el servidor.
- Inicio explícito para instrumentos del nuevo constructor; intentos persistidos, límites por test estable, reanudación, duración opcional y entrega idempotente. Se conservan las respuestas de los intentos y la versión utilizada.
- Disponibilidad para todos o estudiantes seleccionados; fechas opcionales. Publicación de resultados inmediata, tras revisión o en fecha determinada.
- Resultado propio por instrumento, sin depender de los tres tests iniciales. Vista de estudiante y administración basada en el registro persistido; revisión de rúbricas con motivo y nuevas revisiones conservadas.
- PDF servido mediante `/api/assessments/pdf?id=ID`, con autorización y política de publicación comprobadas en el servidor. Incluye logo, fecha, versión, puntuaciones, cobertura y respuestas. La consulta no recalcula el test.
- Relaciones opcionales con carreras: identificadores comprobados contra el catálogo CES existente, intervalo, motivo y fuente configurados por administración. La oferta consultada se incorpora a la versión publicada. No se generan relaciones sin configurar.
- Formularios y contenedores ajustados por anchura intrínseca; pie del editor en el flujo de la página, controles táctiles, navegación de pasos desplazable y listas de preguntas legibles.

## Persistencia y compatibilidad

La migración se ejecuta de forma aditiva al inicializar `lib/server/store.ts`. Crea `assessment_attempts`, su índice de intento abierto único, `assessment_results` y, si falta, la columna `answers` de intentos. No elimina ni transforma entregas anteriores. Las tablas y documentos existentes continúan funcionando.

Los resultados históricos se conservan. Los tres instrumentos originales mantienen su salida anterior; el constructor y los nuevos resultados utilizan el motor versionado. Los documentos importados entran como borradores editables y se validan antes de publicar; la extracción ambigua requiere revisión humana y no se interpreta automáticamente como un instrumento validado.

Antes de desplegar: realizar una copia consistente de SQLite y conservar `storage`, fotos y documentos importados en almacenamiento persistente. Arrancar el servidor con su `DATABASE_PATH` existente. No usar un SQLite efímero de una función de Vercel como almacenamiento definitivo.

Gemini gratuito y su adaptador no se sustituyeron. El cálculo nuevo es determinista y no necesita una llamada a Gemini para conservar resultados. Esta revisión no certifica nueva disponibilidad de cuota del proveedor.

## Guía para administración

### Perfil por dimensiones

1. Crear test; indicar propósito, instrucciones y fuente del instrumento.
2. Añadir las preguntas y opciones. Para selección múltiple, definir mínimo/máximo y, si corresponde, opción exclusiva.
3. En Resultados, elegir dimensiones y darles nombre. Asignar a cada opción sus contribuciones; escribir cero cuando no aporte. Elegir suma o media ponderada y configurar solamente interpretaciones documentadas.
4. Configurar destinatarios y plazos. En Revisar, corregir los enlaces de validación, simular las respuestas esperadas y publicar cuando el borrador indique Guardado.

### Prueba objetiva

Elegir clave de aciertos, indicar las respuestas correctas y el peso de cada pregunta. La multiselección puede exigir coincidencia exacta o crédito parcial con penalización explícita. El texto breve admite respuestas aceptadas con normalización opcional; el número admite un intervalo correcto cerrado. Verificar aciertos y errores mediante la simulación.

### Instrumento con rúbrica

Elegir rúbrica o un test mixto con preguntas rubricadas. Añadir criterios y niveles con puntos. Tras la entrega, abrir la ficha del estudiante en Resultados e informes → Evaluaciones, completar los criterios y registrar el motivo. Si la política exige publicación administrativa, publicar después de guardar la revisión.

## Pruebas y evidencias

- `node scripts/test-test-engine.cjs`: inversión 4 + (1 + 5 - 2) = 8, media 4 y recorrido 75 %; aciertos ponderados 5/6; multiselección 3 sobre límites 1–5, recorrido 50 %; dimensiones Tecnología=2 y Arte=3; rúbrica pendiente y revisada; condiciones, omisiones, cobertura, límites constantes y ciclos.
- Recorrido contra servidor real y copia SQLite separada: borrador privado, publicación para varias cuentas, registro posterior a publicación, asignación privada, apertura futura, inicio sin duplicación, guardado, envío repetido con mismo ID, resultado persistido y PDF con rechazo de acceso ajeno.
- Revisión de rúbrica, bloqueo de publicación prematura, publicación del resultado, nueva versión sin alterar la puntuación anterior y conflicto de revisión HTTP 409.
- Creación manual en móvil, recuperación tras recargar, simulación y publicación desde la interfaz.
- HTML importado: contenido ejecutable descartado y simulación con el mismo motor del servidor.
- Formatos: sí/no con valor cero, condición oculta, número, matriz, ordenación, texto normalizado e información. Regresión del RIASEC original: cinco respuestas de 4 por dimensión conservan suma 20.
- 65 combinaciones de páginas y anchuras (360, 390, 768, 1024, 1366 px), sin desbordamiento horizontal del documento ni errores de JavaScript en esa ejecución. Las tablas extensas conservan su desplazamiento propio.
- Zoom real de Chrome al 200 %: ancho CSS 672 px, documento 672 px y controles utilizables.
- Evidencia local de navegador, matriz de mediciones y PDF sintético en `evidencia/universal-tests/`. No contiene fixtures añadidos al catálogo de producción.

## Alcance del despliegue

El build estático de diseño continúa separado del servidor. La vista de Vercel necesita un backend persistente para ejecutar simulaciones, permisos, intentos, importaciones y PDFs protegidos. Mostrar el constructor estático no demuestra que estas operaciones estén desplegadas. La integración se verificó con el servidor local y SQLite; no se debe presentar el preview estático como un sistema de producción conectado.

Los ensayos visuales utilizaron Chrome con distintos viewports y zoom real. No equivalen a pruebas sobre dispositivos físicos ni a una validación psicométrica de los instrumentos creados.

### Cierre de verificación

- Compilación de producción (`npm run build`) y exportación de diseño (`npm run build:design`) completadas correctamente.
- Después de reiniciar el servidor de producción local: el resultado anterior conserva puntuación 3 y su PDF; dos inicios simultáneos y tres entregas simultáneas conservan un único intento y una única entrega.
- La entrega de un test queda guardada aunque falle la generación posterior del informe general. Este aislamiento no equivale a certificar disponibilidad de Gemini.
