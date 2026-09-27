# Portada pública: Aurora + Bento

Fecha: 27 de septiembre de 2026. Alcance: presentación pública; sin cambios en autenticación, datos, evaluaciones, resultados ni servicios de IA.

## Implementación

- `components/ui/aurora-background.tsx` y su CSS: fondo decorativo reutilizable, paleta local, gradiente de respaldo, animación de 60 segundos y pausa por visibilidad y movimiento reducido.
- `components/ui/bento-grid.tsx` y su CSS: tarjetas con contenido en flujo normal, enlaces permanentes y distribución de tres, dos y una columnas.
- `HeroSection.tsx`, `VocationalToolsSection.tsx`, `aurora-home.css` y `PublicHome.tsx`, en `components/kit/features/public`: composición, fotografía existente, tres herramientas reales y navegación.
- Se reutilizan `Button`, `cn`, Lucide y los recursos existentes. Se añade únicamente `framer-motion` como dependencia directa, con su lockfile.
- Referencias y atribución en `THIRD_PARTY_NOTICES.md`.

## Verificación

- `npx tsc --noEmit`: correcto.
- `npm run build`: correcto.
- `npm run build:design`: correcto, exportación estática de 33 páginas.
- `git diff --check`: correcto.
- El proyecto no tiene un comando lint configurado; no se presenta como ejecutado.
- Chrome automatizado: 360×800, 390×844, 768×1024, 1024×768, 1366×768 y 1920×1080. Sin desbordamiento horizontal; una etiqueta main y un h1; imágenes cargadas y tres tarjetas.
- Navegación de registro y de las tres tarjetas, interacción táctil, foco por teclado, ancla de herramientas, movimiento reducido y pausa de Aurora fuera de pantalla.
- Zoom real de Chrome al 200 %: ancho CSS de 1283 a 641 y devicePixelRatio de 1,5 a 3 (escala del sistema operativo incluida). Ancho desplazable de 634, sin desbordamiento. La captura de elementos de Playwright a este zoom resultó recortada; no se usa como evidencia visual de la composición.
- Revisión visual de portada, login y dashboard de estudiante en la exportación de diseño. Sin errores de página; navegación táctil de la compilación de producción sin errores de consola.

## Evidencias locales

Carpeta `evidencia/aurora-bento` (excluida de Git): `hero-1366.png`, `hero-390.png`, `bento-1366.png`, `bento-390.png`, capturas completas de las seis anchuras, `checks.json`, `zoom.json`, `touch-checks.json` y `static-checks.json`.

Revisión local: http://localhost:3000. La exportación de diseño puede revisarse en http://127.0.0.1:3004 mientras esté activo su servidor local.

El entorno local usa Node 25.9; el proyecto conserva su configuración Node 24 para Vercel. No se han modificado la infraestructura ni las limitaciones del modo de diseño. La verificación local no demuestra por sí sola que el despliegue remoto haya finalizado.
