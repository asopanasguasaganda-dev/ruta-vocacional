# Portada con video y superficies translúcidas

27 de septiembre de 2026.

## Diseño e integración

Se integró el video proporcionado por el usuario como un único fondo fijo de la
web principal. Se conserva el logo y se utiliza su paleta de azul marino, violeta
y celeste. El espacio visual del hero muestra el video en lugar de la fotografía.
El nav, las tarjetas Bento, el recorrido, las áreas, la representación del informe,
las preguntas frecuentes y el footer usan superficies oscuras translúcidas.

Una capa graduada protege la lectura. Al salir del hero se oscurece el fondo,
manteniendo visible la imagen detrás de los paneles. Se conservan Aurora, Sticky
Scroll, Container Scroll y Blur Fade, con sus ajustes de movimiento reducido.
El nav añade iconos y un control de reproducción. En móvil conserva el menú con
teclado, Escape y retorno del foco. No se añade acceso público a administración.

Archivos principales:

- `components/kit/features/public/PublicHome.tsx`: fondo y control del nav.
- `useHomeVideo.ts`: reproducción, preferencias, pausa y limpieza de eventos.
- `video-home.css`: tema acotado a `.site-cinematic`, superficies y responsive.
- `HeroSection.tsx`: composición que deja visible el video.
- `components/kit/components/layout/Shells.tsx`: variante opcional del nav público.
- `app/page.tsx` y `components/kit/Root.tsx`: la portada estática se entrega sin
  el contenedor de carga que requería JavaScript para mostrar el HTML. Las demás
  rutas mantienen su comportamiento anterior.

## Recursos

Origen: `pero_sin_textos_solo_video_de.mp4`, 10 segundos, 1280×720, 24 fps.
Se generaron derivados H.264 compatibles con reproducción web, sin audio y con
`faststart`, usando FFmpeg. No se añadió ninguna dependencia a la aplicación.

| Archivo en `public/media` | Tamaño |
| --- | ---: |
| `vocational-background.mp4` | 986 750 bytes |
| `vocational-background-mobile.mp4` | 317 866 bytes |
| `vocational-background-poster.webp` | 28 554 bytes |

La variante móvil se elige antes de asignar la fuente. No se descarga video si
se solicita movimiento reducido, se anuncia ahorro de datos o se conservó una
pausa de esta sesión. El usuario puede iniciar la reproducción con ahorro de
datos. El movimiento reducido mantiene un fondo estático. El video se pausa al
ocultar la pestaña y al desmontar la portada. Si falla el archivo o el navegador
bloquea la reproducción automática, queda disponible la imagen de respaldo.

## Verificación

Pasaron TypeScript (`npx tsc --noEmit`), `npm run build`, `npm run build:design`
(33 páginas estáticas) y `git diff --check`. No existe un script de lint configurado.

Pruebas en Chrome sobre la compilación de producción:

- 360×800, 390×844, 768×1024, 1024×768, 1366×768, 1920×1080 y 1366×600;
  sin desbordamiento horizontal en todas las secciones.
- Un solo video, un solo h1 y una sola representación ContainerScroll del informe.
- Reproducción real, selección del archivo móvil, pausa, continuación con teclado
  y persistencia de la pausa al recargar.
- Menú móvil, Escape, foco, anclas, selector de áreas y apertura de FAQ.
- Preferencia de movimiento reducido al cargar y al cambiar durante la sesión.
- Ahorro de datos, video inaccesible y HTML visible con JavaScript desactivado.
- Navegación a ingreso y atrás/adelante; el video anterior se detiene al salir.
- Consola sin errores y ninguna API adicional a `/api/session` en ese recorrido.
- Zoom real de Chrome al 200 %: 672 px CSS, sin desplazamiento horizontal,
  informe sin transformación y panel sticky sustituido por el flujo móvil.

Evidencias locales (ignoradas por Git): `evidencia/video-home/checks.json`,
`navigation.json`, `zoom.json`, capturas de las siete dimensiones,
`desktop-final.png`, `mobile-final.png`, `menu-mobile.png`, `no-js.png`,
`reduced-motion.png` y `recorrido.webm`.

Se revisaron capturas reales de la portada, recorrido, herramientas, áreas e
informe. Los ensayos móviles se realizaron por emulación de viewport en Chrome;
no certifican pruebas en dispositivos físicos ni en Safari. No se midieron Core
Web Vitals de producción. El build y el push no confirman por sí solos que Vercel
haya terminado de desplegar.

Revisión local: http://localhost:3000/.
