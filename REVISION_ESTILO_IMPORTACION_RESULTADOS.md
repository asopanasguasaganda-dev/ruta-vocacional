# Revisión de estilo, importación y resultados

Fecha: 27 de septiembre de 2026.

## Cambios

- Identidad visual nocturna compartida entre portada, acceso, registro, estudiante y administración, con formularios legibles y adaptación móvil.
- Se retira el control de pausa del navegador de la portada. Se conserva el respeto por reducción de movimiento y ahorro de datos.
- Importación estructurada de Word y HTML: listas anidadas, opciones múltiples, tablas de escalas y formularios HTML. El código de los documentos no se ejecuta.
- Los errores HTTP o respuestas no JSON se convierten en mensajes comprensibles.
- Resultados visibles al entregar y en Mis resultados, incluyendo los instrumentos originales. PDF y distribución descriptiva de respuestas por sección.

## Verificación realizada

- Compilación de servidor y exportación estática de Vercel.
- Regresiones del motor: inversión, media, aciertos ponderados, selección múltiple, dimensiones, rúbrica, condiciones, cobertura, límites y ciclos.
- Documento suministrado: 52 preguntas numeradas y el campo Curso y paralelo; 53 campos, 38 escalas y 5 preguntas de selección múltiple.
- Flujo del Word con servidor y base aislada de pruebas: importar, publicar, responder, entregar, recuperar resultado persistido y descargar PDF.
- Flujo estático en Chrome: importar el Word, publicar, recargar, responder los 53 campos, consultar resultado y generar PDF.
- HTML pegado: extracción, simulación de puntuación 2, publicación y respuesta del estudiante con puntuación 2. Se comprobó que un script incluido no se ejecuta.
- Test original RIASEC: 30 respuestas de valor 4 producen 20 puntos en cada una de las seis dimensiones.
- Revisión de 12 rutas en 360, 390, 768, 1024 y 1366 píxeles, sin desbordamiento horizontal. Capturas de acceso, registro, paneles y resultados; inspección del PDF generado.

## Alcance

Vercel sigue configurado como exportación de diseño. Los tests, las entregas y los PDF de ensayo se conservan solamente en la pestaña del navegador; no constituyen un servicio de cuentas ni almacenamiento de producción. Word y HTML se procesan localmente en esa modalidad. PDF/OCR requiere el servidor.

El documento suministrado no especifica claves de puntuación ni relaciones validadas con carreras. Se conserva como instrumento descriptivo y se advierte sobre su población de bachillerato. Las frecuencias de respuesta no se presentan como aptitudes. Esta revisión no certifica llamadas al proveedor de IA ni la extracción de PDF escaneados.

Las cuentas y entregas sintéticas se crearon únicamente en una base aislada de pruebas. Las capturas y estados privados de prueba no se incluyen en Git.
