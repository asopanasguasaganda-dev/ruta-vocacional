# Segunda fase de la portada

27 de septiembre de 2026. Se sustituyeron los bloques existentes de «Cómo funciona»
y «Tu informe», conservando Aurora, Bento, áreas de estudio, FAQ y footer.

## Archivos

- `components/ui/sticky-scroll-reveal.tsx`: pasos tipados con identificadores estables,
  medición real de su posición, scroll del documento, control de espacio disponible y
  limpieza de observadores. Admite cero, uno y varios pasos.
- `components/ui/container-scroll-animation.tsx`: MotionValues para perspectiva
  de 10 grados a cero y escala de 0,98 a 1; la tarjeta se estabiliza antes de la lectura.
- `components/ui/scroll-sections.css`: variantes normales para móvil, altura reducida
  y movimiento reducido. No se limita el zoom del navegador.
- `components/kit/features/public/JourneySections.tsx` y `journey-sections.css`:
  recorrido, ilustraciones HTML y estructura pública del informe, sin datos personales.
- `PublicHome.tsx`: integración en las secciones originales.
- `THIRD_PARTY_NOTICES.md`: referencias y atribución.

Se reutiliza framer-motion 13.4.4. No se añaden dependencias ni se modifican servicios,
autenticación, dashboard, evaluaciones o informes personales.

## Pruebas

- Chrome: 360×800, 390×844, 768×1024, 1024×768, 1366×768,
  1920×1080, 844×390 y 1366×600. Sin desbordamiento horizontal.
- Paso activo al avanzar, retroceder y cargar directamente el ancla del tercer paso.
  El panel sticky quedó a 101 px, debajo de la cabecera. Ancla de sección a 100 px.
- Componente con cero, uno y tres elementos y reducción de tres a uno, usando bloques
  de distinta altura en una ruta temporal de pruebas retirada después de verificarla.
- Transformación inicial y final del informe comprobadas; final sin transformación.
- Movimiento reducido al cargar y cambiado durante la sesión, sin ocultar contenido.
- Scroll de rueda y teclado, gesto táctil emulado y CTA a registro.
- Zoom real al 200 % mediante la API de zoom del navegador en un perfil exclusivo de QA:
  672 px CSS, devicePixelRatio 2, ancho desplazable 672; panel en flujo normal e informe
  sin transformación. No se aplicó CSS zoom.
- Sin errores de página en la suite y sin errores de consola en la navegación táctil.
- Capturas revisadas en escritorio y móvil; grabación real adicional para comprobar
  el cambio de panel y la perspectiva. No se probó hardware físico de touchpad.

Validación correcta: `npx tsc --noEmit`, `npm run build`, `npm run build:design`
(33 páginas estáticas) y `git diff --check`. El proyecto no tiene un script lint
configurado. En la compilación de producción, la única petición API de la portada
fue `/api/session`; no se consultaron informes privados ni servicios de IA.

## Evidencias y revisión

`evidencia/sticky-container` (local, excluida de Git) contiene capturas de las ocho
dimensiones, `checks.json`, `zoom.json`, `touch.json` y `recorrido-informe.webm`.
Las capturas de sección ocultan únicamente la cabecera flotante para que no tape
el contenido al capturar una sección más alta que el viewport; la grabación muestra
la navegación completa.

Revisión local: http://localhost:3000/#como-funciona y
http://localhost:3000/#tu-informe. La verificación local no acredita por sí sola
que haya terminado el despliegue remoto de Vercel.
