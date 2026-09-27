# Vercel: vista de diseño sin base de datos

Esta entrega publica exclusivamente el diseño navegable, según el alcance actual. No conecta usuarios reales, credenciales, Gemini, informes personales ni almacenamiento. El backend original permanece en el código para la etapa siguiente.

## Desplegar

1. Importar `asopanasguasaganda-dev/ruta-vocacional` en Vercel, rama `main`, raíz `.`.
2. Framework Preset: **Other**. `vercel.json` define `npm ci`, `npm run build:design` y `.design-preview/out`.
3. Usar Node 24. No añadir claves, base de datos ni variables de entorno para esta vista previa.
4. Desplegar. Accesos de revisión: `/`, `/mi-ruta/` y `/admin/`, sin credenciales reales. No se muestra una barra de navegación de demostración.

## Qué incluye

- Páginas públicas, formularios, dashboard de estudiante y administración navegables.
- Estados vacíos explícitos; identidad de muestra, sin estadísticas inventadas.
- Registro, ingreso y edición del perfil pueden ensayarse con una cuenta de prueba por pestaña. Usa datos ficticios: no se crea una cuenta en el servidor. Al cerrar la pestaña, los datos de prueba dejan de estar disponibles.
- Los borradores de preguntas se conservan durante la sesión de prueba; no se emite un reporte real.
- La autenticación de producción, publicación, importación, seguridad de cuenta e IA requieren conectar el backend.
- No se exportan rutas API ni código del servidor en el sitio estático.

## Pruebas locales

`npm ci` y `npm run build:design`. Servir `.design-preview/out` con un servidor estático; cada ruta tiene `index.html`. La compilación normal `npm run build` y `npm start` conserva el sistema local con servidor y controles de acceso.

## Siguiente etapa

Conectar persistencia, autenticación e IA antes de recibir usuarios reales. SQLite local, archivos privados y procesos de importación requieren un servidor persistente o una migración para Vercel; no usar `/tmp` como base permanente. Referencia: https://vercel.com/kb/guide/is-sqlite-supported-in-vercel.

Evidencias, copias de bases, contraseñas, `.env.local` y archivos personales están excluidos de Git.
