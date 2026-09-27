# Container Scroll + Blur Fade

27 de septiembre de 2026. Fase limitada a la portada pública.

## Implementación

Se conserva el ContainerScroll existente, su perspectiva, la única sección del
informe y su representación HTML sin datos personales. Aurora, Bento y Sticky
Scroll mantienen su composición. Se reutiliza framer-motion, con su entrada
`framer-motion/dom/mini` para BlurFade; no hay dependencias nuevas. Esta variante
evita que un render diferido de Motion vuelva a escribir un filtro después de
limpiar los estilos al finalizar.

`components/ui/blur-fade.tsx` y `blur-fade.css` incorporan una entrada progresiva:
HTML inicialmente visible, activación por intersección una vez por montaje,
duración de 420 ms, desplazamiento de 8 px y desenfoque de 3 px. En móvil el
desenfoque desaparece y el desplazamiento baja a 4 px. El estado final es visible,
sin filtro ni transformación. El foco y la preferencia de movimiento reducido
cancelan la espera y la animación. Los valores cero son válidos; los negativos
se normalizan. Un observador ausente o fallido no oculta el contenido.

Integración en seis grupos: encabezado de herramientas, encabezado de áreas,
selector de áreas (demora local de 70 ms), título del informe, encabezado de FAQ
y texto introductorio del footer. Se sustituyeron las entradas anteriores en
esos mismos elementos, sin envolver el grid, los ancestros sticky ni la tarjeta
que controla la perspectiva.

Archivos de integración: `VocationalToolsSection.tsx`, `StudyExplorer.tsx`,
`JourneySections.tsx`, `PublicHome.tsx`, `aurora-home.css` y `journey-sections.css`
en `components/kit/features/public`. Atribución en `THIRD_PARTY_NOTICES.md`.

## Evidencias locales

La carpeta ignorada `evidencia/blur-fade` contiene:

- `checks.json`: siete tamaños, activación única, foco, bloque alto, observador
  ausente, navegación atrás/adelante y movimiento reducido.
- `hydration.json`: HTML visible mientras se bloquea la descarga de JavaScript.
- `zoom.json` y `zoom-200.png`: zoom real de Chrome al 200 %, ancho CSS de 672 px,
  sin desbordamiento; informe sin transformación.
- `areas-390.png`, `areas-1366.png`, `report-390.png`, `report-1366.png`:
  capturas de móvil y escritorio revisadas visualmente.
- `no-javascript.png`: contenido accesible sin JavaScript.
- `animaciones.webm`: grabación real del recorrido de la portada.
- `production.json`: compilación de producción sin errores de consola o página,
  estilos finales limpios, navegación atrás/adelante y única API consultada:
  `/api/session`.

Tamaños: 360×800, 390×844, 768×1024, 1024×768, 1366×768, 1920×1080 y
1366×600. Sin desplazamiento horizontal. Se comprobó un solo h1, un solo
ContainerScroll, tres tarjetas Bento y ausencia de entradas anidadas duplicadas.
Los seis grupos terminaron con opacidad 1, filtro none y transformación none.
Sin errores de página en la suite completa.

Se comprobó una demora real de 2000 ms sin sumar 40 ms, duración cero y negativa,
foco durante una espera y cambio de movimiento reducido durante la sesión usando
una ruta temporal de prueba, retirada antes de compilar. El ensayo de historial
se inicia desde una carga nueva: reutilizar una navegación del automatizador
entre el mismo documento y su hash produjo un estado de navegación inconsistente
en desarrollo; el recorrido aislado y la suite con carga nueva pasaron.

Las capturas de secciones ocultan la cabecera flotante para evitar que cubra la
sección; la grabación conserva la navegación real. Se usó Chrome automatizado,
no dispositivos móviles físicos. El entorno de navegador integrado no ofrecía
sesiones disponibles, por lo que se verificó con Playwright y Chrome local.

## Comandos y revisión

Pasaron `npx tsc --noEmit`, `npm run build`, `npm run build:design` (33 páginas
estáticas) y `git diff --check`.
No existe un script de lint en el proyecto. Los scripts de QA locales están en
`.qa-tools`; las evidencias no se suben al repositorio.

Revisión: http://localhost:3000/#areas y http://localhost:3000/#tu-informe.
La comprobación local y el push no acreditan que el despliegue remoto de Vercel
haya finalizado. No se modifican autenticación, API, base de datos ni Gemini.
