# Adultos, Gemini gratuito y reportes persistidos

Actualización: 27 de septiembre de 2026. Esta implementación sustituye el análisis individual anterior. El producto es exclusivo para personas de 18 años o más que exploran su primera carrera universitaria.

## Privacidad y acceso

Por solicitud posterior del propietario, el acceso y registro ya no recogen fecha de nacimiento ni requieren una declaración de edad. La audiencia adulta se comunica como información del producto; no se afirma comprobar la edad ni verificar identidad. Las cuentas existentes entran directamente con su sesión, sin inventar fechas ni indicadores de verificación. La ruta antigua `/confirmar-edad` redirige al espacio correspondiente; su API de escritura responde 410. Las declaraciones históricas permanecen privadas, excluidas del estado del cliente y protegidas contra modificaciones genéricas, pero no condicionan el acceso. Las operaciones privadas, fotos e importador conservan autenticación y permisos del servidor. Administración mantiene `/admin/login`, sin enlaces públicos.

Identidad, respuestas, puntuaciones y reportes permanecen en el servidor propio. `academic-content.mjs` no importa usuarios, sesiones ni entregas. Construye su solicitud exclusivamente desde áreas teóricas y ejemplos del catálogo público. No recibe argumentos personales ni una selección de carreras derivada de un estudiante. El único transporte externo de IA usa Gemini.

## Llamada real y contenido general

Se consultó el modelo configurado `gemini-3.1-flash-lite` y se realizó `generateContent` con esquema JSON. Respuesta HTTP 200, diez categorías, 2.494 tokens totales según el proveedor. El archivo `storage/academic-content.json` conserva contenido, modelo, fecha, versión, hash de entrada y uso. La evidencia sin credenciales está en `evidencia/adultos-reportes/gemini-llamada-real.json`; el contenido obtenido se conserva junto a ella. La revisión de sus diez explicaciones comprobó que son material académico general; no representa revisión profesional psicométrica.

El contenido validado se reutiliza sin llamadas por estudiante. Si falta o no corresponde a la versión actual, el reporte usa explicaciones locales explícitamente identificadas. Nunca simula una respuesta nueva de Google. Actualización mediante administración autorizada (`POST /api/admin/orientation-content`) o, en el servidor:

```powershell
node --env-file=.env.local scripts/refresh-academic-content.mjs
```

Límites: 15 segundos para consulta de modelo; 45 segundos por generación; máximo dos intentos ante 429, espera acotada entre uno y cinco segundos; máximo veinte solicitudes diarias (configurable hacia abajo). Contador persistente, bloqueo entre procesos y escritura atómica. Errores de autenticación, servicio y formato no se presentan como generación correcta. No se activa facturación, búsqueda de pago ni cambio automático de modelo o proveedor.

El modelo tiene modalidad gratuita en la [tabla oficial de Google](https://ai.google.dev/gemini-api/docs/pricing). La respuesta de generación confirma disponibilidad de cuota en ese momento, pero no expone el estado de facturación del proyecto. Queda pendiente que el propietario confirme en AI Studio que su proyecto permanece en Free Tier; la aplicación no modifica dicha configuración. Se respetan las [condiciones de Gemini](https://ai.google.dev/gemini-api/terms) evitando enviar información individual al servicio gratuito.

## Resultados locales y versiones

El servidor valida las respuestas y calcula las reglas de la versión entregada. El primer test publicado ya produce un informe parcial; no hay que terminar toda la batería para ver resultados. Los tests no publicados mantienen sus resultados privados. El informe reúne las entregas de la batería y las evaluaciones adicionales entregadas, con sus snapshots. No revela claves de corrección en el documento del estudiante.

Cada informe conserva IDs de entregas, reglas, relaciones de áreas, versión de contenido general y catálogo. La misma combinación reutiliza el mismo informe; una entrega nueva crea otra versión sin sobrescribir anteriores. Estudiante, administrador con alcance autorizado y PDF usan el mismo contenido persistido. Los informes históricos conservan su metodología y se identifican como históricos.

La selección usa intereses RIASEC calculados localmente, relaciones internas explícitas con áreas y ofertas existentes. Incluye referencias a preguntas y respuestas concretas. Si no existe el test de intereses, hay empate total o interés poco diferenciado, no fabrica una carrera dominante. Preferencias y autoconocimiento se muestran como declaraciones, no habilidades demostradas. La frase correcta es: “Informe basado en tus respuestas, con contenido de orientación asistido por IA”.

## Catálogo y límites de interpretación

Fuente: [CES, oferta vigente](https://appcmi.ces.gob.ec/oferta_vigente/). La instantánea contiene 983 denominaciones y 5.821 ofertas únicas de tercer nivel. Se comprobó el hash del HTML original y la unicidad de identificadores. La fecha es la de consulta, no una garantía de oferta futura, cupos, acreditación actual o admisión abierta.

El filtro interno de instituciones y títulos identifica 375 denominaciones candidatas de grado universitario. Las reglas iniciales de áreas relacionan 300; las restantes siguen consultables en el catálogo, pero no se les inventa una relación. El nivel de grado es una selección derivada del título y la institución, no un campo certificado adicional del CES. Las ofertas sugeridas priorizan universidades y escuelas politécnicas y excluyen títulos técnicos, tecnológicos y de posgrado.

El [marco RIASEC de O*NET](https://www.onetcenter.org/IP.html) tiene investigación publicada. Esto no valida automáticamente las preguntas locales ni las relaciones internas entre carreras y dimensiones. No hay baremos ecuatorianos ni validez predictiva acreditada de esta implementación. Se necesita evaluación profesional antes de presentar esas reglas como instrumentos científicamente validados. No se prometen aptitud, éxito, permanencia universitaria ni una carrera obligatoria.

## Interfaz, PDF y pruebas

Selectores compartidos con Base UI: teclado, búsqueda por escritura, opciones accesibles, estilos propios y portales compatibles con diálogos. El test conserva respuestas mientras guarda; se eliminaron avisos transitorios que alteraban la altura y el desplazamiento automático por foco. El reporte distingue carga, ausencia de entregas e informe parcial.

PDF con logo, métricas derivadas de las entregas, escalas con denominadores, evidencias, ofertas, comparación, próximos pasos, fuentes y versión persistida. La vista previa y descarga se generan desde el mismo objeto de reporte. Las entregas individuales usan el mismo diseño profesional.

Las evidencias de `evidencia/adultos-reportes` usan exclusivamente cuentas adultas y respuestas sintéticas en una base separada. Incluyen privacidad del payload, rechazo de menores/fechas inválidas, permisos, idempotencia, persistencia, flujo completo, PDF, perfil/foto, importación PDF/Word/HTML y tamaños 390×844, 768×1024, 1366×768 y 1920×1080. El zoom al 200 % se ensaya en un perfil independiente de Chromium, sin CSS zoom ni transformaciones. Altura reducida simula el espacio ocupado por un teclado; no equivale a una prueba en un teléfono físico.

La tipografía raíz es 16 píxeles CSS. Las capturas por sí solas no demuestran un zoom incorrecto; se conservan las preferencias de accesibilidad y no se modifica el navegador del usuario. El desplazamiento vertical del informe extenso es natural.

## Configuración pendiente y operación

No falta la clave Gemini ni contenido compartido: la llamada real quedó verificada. Permanecen pendientes la comprobación administrativa del Free Tier y la validación profesional de instrumentos/relaciones. SMTP continúa sin configurar en el entorno local: recuperación y cambio de correo informan esa limitación; no se simula envío. Perfil, foto, contraseña y cierre de sesión no dependen de SMTP.

Guardar en almacenamiento persistente SQLite, contenido académico, fotos e importaciones; respaldarlos juntos. No publicar `.env.local`, bases privadas ni estados de navegador de QA. Las capturas y JSON entregados contienen datos sintéticos y material público.
