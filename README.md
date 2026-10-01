# Ruta Vocacional 360°

**Etapa actual: diseño navegable sin base de datos en Vercel.**

Importa este repositorio en Vercel con preset **Other**, Node 24 y raíz `.`. La configuración ya está en `vercel.json`; no requiere variables ni claves. Consulta [las instrucciones de despliegue](docs/DESPLIEGUE.md). `npm run build:design` genera el sitio estático; `npm run build` conserva la aplicación con servidor para la siguiente etapa.

Las secciones siguientes describen el backend local existente, que no se ejecuta en la vista de diseño.

La orientación distingue Bachillerato (8.º, 9.º y 10.º de EGB hacia BGU) y
Universidad (BGU hacia educación superior). El registro no obliga a elegir
modalidad. Administración permite crear e importar tests para una ruta o ambas,
y publicar simuladores de Ciencias y Técnico con sus plantillas editables.
El catálogo técnico recoge las 34 figuras del Acuerdo 2024-00065-A; su disponibilidad
debe confirmarse con cada colegio. `npm run test:school` verifica las plantillas,
la separación de resultados y la publicación compartida.

La aplicación MySQL para Hostinger se mantiene en la rama
[`pruebas/hostinger-mysql-20261001`](https://github.com/asopanasguasaganda-dev/ruta-vocacional/tree/pruebas/hostinger-mysql-20261001).
Esta rama `main` publica el entorno de pruebas de diseño en Vercel.

Aplicación Next.js con web pública, estudiante y administración independiente. El backend se conserva para una etapa futura; la versión publicada utiliza cuentas y contenido guardados en el navegador.

## Ejecutar

Node.js **22.18 o posterior** (verificado con 25.9), almacenamiento persistente y proceso Node de larga duración.

```powershell
npm install
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

Abre `http://localhost:3000`. Producción: `npm run build` y `npm start`. Tipos: `npx tsc --noEmit`.

No hay contraseñas predeterminadas ni estudiantes de ejemplo en los datos operativos. Los estudiantes se registran en `/registro`. Administración entra únicamente por `/admin/login`, sin enlaces desde la web pública.

## Primera cuenta administrativa

Inicia la aplicación y visita una vez `/admin/login` para preparar el almacenamiento. Ejecuta el alta local con los datos de tu institución:

```powershell
$env:ADMIN_NAME = 'Nombre del administrador'
$env:ADMIN_EMAIL = 'correo@tu-institucion.edu'
$adminSecret = Read-Host 'Contraseña privada (mínimo 12 caracteres)' -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $adminSecret).Password
$env:INSTITUTION_NAME = 'Nombre de tu institución'
$env:INSTITUTION_CODE = 'Código de incorporación de tu institución'
node scripts/create-admin.mjs
Remove-Item Env:ADMIN_PASSWORD
```

Si cambias la ubicación de datos, define también `DATABASE_PATH` en esa terminal. El script crea una cuenta; no sobrescribe las existentes. El código permite incorporar estudiantes y puede deshabilitarse en Configuración. Los grupos y roles se asignan en Usuarios.

## Configuración y persistencia

- SQLite: `storage/ruta.sqlite`; documentos privados: `storage/imports/`. Respalda ambos y conserva permisos restringidos. No se sirven desde `public/`.
- Contraseñas con scrypt y sal individual. Sesiones con vencimiento, cookie HttpOnly/SameSite y comprobación de permisos y origen en el servidor.
- Estudiante: sus respuestas y planes. Orientador: su grupo e institución. Administrador: su institución.
- Cada entrega conserva instrumento, versión, respuestas, reglas, resultados y fecha. Reintentar una entrega idéntica no la duplica.
- Correo: configura `APP_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` y, si corresponde, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`. Sin configuración se informa que el servicio no está disponible; no se simula un envío.
- HTTPS: `COOKIE_SECURE=true` y `APP_URL` HTTPS. No uses almacenamiento temporal de funciones serverless para SQLite/documentos. Esta entrega no incluye un despliegue externo.
- El OCR descarga modelos de español e inglés la primera vez y procesa los documentos localmente, sin enviarlos a una API de IA.

## Importar y publicar sin programar

1. En `/admin/evaluaciones`, **Importar documento** admite PDF con texto o escaneado, DOCX y HTML: 10 MB y 60 páginas como máximo. Convierte `.doc` a `.docx` antes de cargarlo.
2. Sigue el progreso, cancela o reintenta desde el historial. El procesamiento se ejecuta en otro proceso; los errores no publican contenido parcial.
3. Contrasta la extracción con el original privado. Un archivo puede generar varios borradores. Revisa preguntas, opciones y reglas; no se inventan claves ausentes.
4. Edita selección única/múltiple, Likert o respuesta abierta; duplica, elimina y reordena preguntas. Conserva **Sin cálculo automático** si el instrumento no documenta su puntuación. También se pueden configurar dimensiones, inversión, pesos, rangos sobre suma/promedio, preguntas opcionales, imágenes con texto alternativo y explicaciones. Las imágenes DOCX se revisan y asocian manualmente desde el editor. Las claves de pruebas objetivas se introducen con selectores; no se deducen ni inventan.
5. En **Vista previa**, responde como estudiante y pulsa **Calcular resultado de prueba**. Usa las mismas reglas del servidor sin crear entregas ni alterar indicadores. Después guarda, selecciona grupo o estudiante, fecha de inicio, plazo, duración estimada e intentos, y publica. La duración es informativa, sin cuenta regresiva. Puedes nombrar una batería para agrupar instrumentos conservando sus reglas separadas. El test aparece en el dashboard y en Evaluaciones del estudiante correspondiente. Duplica una versión publicada para modificarla.
6. Si elegiste **Después de revisión administrativa**, el servidor retiene puntuaciones y explicaciones hasta que pulses **Publicar resultado para el estudiante** en la entrega individual. Tampoco se exponen en historial, exportación ni informe integral mientras estén retenidas. Las claves objetivas no se envían al cuestionario del estudiante.
7. Consulta `/admin/resultados`: filtros por estudiante, grupo, test, versión y fechas, entregas, respuestas, CSV y PDF por estudiante. Las fechas usan la zona horaria institucional; el CSV incluye únicamente los intentos filtrados. Los gráficos separan versiones y las métricas utilizan los registros de tu alcance.

Las cuentas creadas en Usuarios quedan pendientes de activación. Pueden establecer su contraseña mediante Recuperar acceso cuando el correo esté configurado. Guardar un usuario no envía invitaciones silenciosamente.

## Contenido y fórmulas

`components/kit/data/original.json` conserva la extracción y huella del HTML original. Se mantienen 30 preguntas RIASEC, 12 del perfil adolescente, tres preferencias, cinco actividades, ocho estaciones, cuatro reflexiones, diez carreras, ocho profesiones de referencia, seis áreas futuras y un lienzo de emprendimiento de seis campos y ocho pasos.

RIASEC: suma original **5–25** por dimensión y promedio **1–5**, identificado en la interfaz. Perfil adolescente: `redondear(promedio × 20)`, escala **20–100**. Las preferencias conservan la opción, sin puntuación artificial. Solo una entrega completa genera resultado definitivo; los empates se conservan. Las carreras se relacionan mediante etiquetas de interés, sin porcentajes ficticios de compatibilidad o empleo.

Instrumentos configurados: inversión = mínimo + máximo − respuesta; suma ponderada = suma de respuesta corregida × peso; promedio = suma ponderada / suma de pesos. Los rangos se aplican a la suma o al promedio, según el selector del instrumento. Las preguntas opcionales omitidas no entran en el denominador. Una prueba objetiva usa claves de selección única/múltiple: concede el peso solo cuando coincide toda la selección, sin penalización ni crédito parcial. La revisión manual conserva respuestas sin cálculo automático. El laboratorio registra aciertos, errores, omisiones, tiempos en milisegundos y los parámetros de cada intento; no participa en la recomendación de carreras. En **Configurar actividades** se editan instrucciones, rondas, longitud de secuencia y espera de reacción. Los registros existentes conservan sus datos y las plantillas nuevas se identifican como `lab-templates-1`. La práctica se ejecuta sin guardar registros. Los clics repetidos no duplican rondas; salir de la actividad cancela sus temporizadores.

En Contenidos se editan las etiquetas RIASEC, actividades, habilidades y puntos a investigar de cada carrera, así como los pasos y duración estimada de las guías. Las fuentes externas se acompañan de URL HTTPS y fecha de consulta. Publicar actualiza el catálogo; no modifica los informes integrales históricos.

## Informe integral e historial

En Resultados, **Generar informe integral** permite elegir un intento por instrumento. Guarda una copia inmutable de los resultados seleccionados, sus versiones, preferencias, ocho estaciones, reflexiones, laboratorio, emprendimiento, tareas y sugerencias explicadas. No recalcula los resultados entregados. Los reintentos con el mismo contenido reutilizan la misma copia.

La copia es privada por defecto. El estudiante puede compartirla expresamente con su institución, incluidas las reflexiones y el plan. Administración y orientación consultan la misma copia desde el resultado individual, dentro de sus permisos de institución y grupo. Las copias privadas no aparecen en sus listados. El PDF y la exportación personal utilizan el contenido guardado. Editar el perfil o las respuestas después no modifica la copia histórica.

Las sugerencias usan `ruta-intereses-contexto-1`, compartida entre pantalla e informe: se incluyen las carreras con etiquetas en los dos intereses superiores, conservando empates. Se ordenan por cantidad de etiquetas coincidentes; el ambiente preferido desempata relaciones iguales. El mapa de ambientes se conserva explicado en el informe. Es una regla editorial orientativa; no representa validación psicológica ni aptitud medida. Motivaciones y valores añaden preguntas de contraste sin alterar puntuaciones. Las copias conservan el texto de las sugerencias, las reglas y la información del catálogo empleada; no se actualizan con cambios posteriores.

Los informes se almacenan en `orientation_reports` dentro del mismo SQLite y se incluyen en su respaldo. No se guardan PDFs públicos en el servidor: la descarga se genera desde una copia autorizada.

## Diseño y evidencia

Componentes activos: `components/kit`. Composiciones: `styles/approved.css` y `styles/connected.css`. Se conserva el favicon proporcionado y una sola identidad visual. El catálogo `/desarrollo/componentes` solo está disponible en desarrollo.

Al faltar fotografías separadas, portada, ingreso y miniaturas utilizan recortes de las zonas fotográficas de las referencias. Texto, tarjetas, formularios y gráficos son componentes reales. La resolución y el encuadre de esos recortes limitan la igualdad fotográfica; no se declara reproducción píxel a píxel.

- [Comparación de las 16 pantallas](evidencia/revision-2026-09-26/index.html)
- [Matriz de módulos](evidencia/revision-2026-09-26/MATRIZ.md)
- [Verificación](evidencia/revision-2026-09-26/PRUEBAS.md)
- [Capturas de los apartados complementarios](evidencia/revision-2026-09-26/complementarias.html)
- [Investigación y decisiones](evidencia/revision-2026-09-26/INVESTIGACION.md)
- [Auditoría final de requisitos](evidencia/revision-2026-09-26/AUDITORIA-PENDIENTE.md)

Las pruebas usan otra base de datos en `.qa-tools/`, cuentas identificadas como verificación y SMTP local de captura. No se mezclan con datos operativos. La entrega a un proveedor de correo externo requiere sus credenciales y no está verificada.


## Revisión: alcance simplificado y Google

El estudiante utiliza Inicio, Mis tests y Mis resultados; el menú de cuenta reúne perfil y seguridad. Se conservan registros previos. Consulta [alcance y comprobaciones](docs/ALCANCE_SIMPLIFICADO.md).

La integración Gemini fue probada con respuestas ficticias y un catálogo oficial CES de 983 denominaciones/5.821 ofertas. Permanece deshabilitada para la audiencia escolar por las condiciones actuales del proveedor; no se envían respuestas reales a Google. Véanse [configuración, método y límites](docs/INTEGRACION_IA_ECUADOR.md) y [capturas y resultados](evidencia/alcance-simplificado/index.html). No sobrescribas una configuración privada existente al copiar `.env.example`.
