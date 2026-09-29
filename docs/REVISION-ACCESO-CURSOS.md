# Revisión del acceso local

- Formularios de correo y contraseña restaurados para ambos perfiles.
- Primer acceso administrativo configurable en el navegador.
- Registro de varias cuentas, cierre de sesión y separación de avances por usuario.
- Eliminada la barra de demostración y los cursos y usuarios ficticios.
- Cursos editables y publicables, inscripción, lecturas, simuladores y resultados locales.
- Sin bases de datos ni autenticación de servidor en esta etapa.

Verificación automatizada: contraseña incorrecta, sesión, roles, publicación, inscripción, avance y aislamiento de dos estudiantes.

## Guía de orientación y oferta nacional

El modo local reconstruye la guía desde las entregas guardadas, incluyendo las anteriores a esta corrección. Los cálculos, el PDF y las recomendaciones de cursos comparten los mismos identificadores de carrera.

El catálogo incluye 983 denominaciones y 5.821 ofertas del CES, consulta del 27 de septiembre de 2026. Permite buscar por carrera, institución, ubicación, provincia y nivel. No garantiza cupos o admisión vigente. Las clasificaciones por área y grado son reglas editoriales visibles, no calificaciones oficiales de afinidad.

Se publica únicamente contenido académico general previamente generado con Gemini y validado, con su procedencia. No se publican claves ni se envían respuestas a la IA. Los indicadores personales se calculan localmente; empates completos, intereses bajos y resultados no publicados no generan prioridades falsas.

La guía aparece al entregar y en Mis resultados. El PDF conserva gráficos, explicaciones, ejemplos de ofertas y próximos pasos. El administrador publica sus cursos y simuladores por carrera; el estudiante los encuentra por recomendaciones o por una carrera elegida.

Pruebas: `node scripts/test-local-guidance.cjs`, `node scripts/test-design-training.cjs`, compilación estática, recorrido de 30 respuestas en navegador, filtros de oferta, PDF renderizado, móvil y persistencia tras recargar.
