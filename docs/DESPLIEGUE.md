# Publicación con acceso y cursos reales

La configuración anterior ejecutaba `build:design`: una exportación sin API, usuarios reales ni cursos persistentes. `vercel.json` ahora ejecuta la aplicación Next.js normal. El modo de prueba se conserva únicamente con `npm run build:design` para revisión local.

## Arquitectura

El servidor usa Node 24, SQLite, archivos privados e importaciones en procesos secundarios. Necesita un único proceso Node con un disco persistente. No alojar SQLite en funciones Vercel ni en `/tmp`. La interfaz puede mantenerse en Vercel: `API_ORIGIN` reenvía `/api/*` al servidor persistente, conservando las cookies del dominio público.

Se incluye un `Dockerfile` para un VPS o un servicio Docker con volumen persistente (por ejemplo Render). No se ha contratado ni creado ningún servicio externo.

## Publicar ahora el diseño actualizado

Hacer push a `main` dispara el despliegue Next.js configurado en `vercel.json`. No se requiere `API_ORIGIN` para publicar páginas e imágenes. Comprobar que `/media/students-campus.webp` devuelve 200 y que `/ingresar` muestra la fotografía nueva sin la nota de prueba. El despliegue del diseño y la conexión de usuarios/cursos son verificaciones separadas.

## 1. Servidor persistente

- Construir el contenedor desde el repositorio, o ejecutar Node 24 con `npm ci`, `npm run build` y `npm start`.
- Montar un volumen persistente en `/app/storage` si se usa el contenedor. El usuario `node` (UID 1000) necesita permiso de escritura.
- Configurar `DATABASE_PATH=/app/storage/ruta.sqlite`, `PROFILE_PHOTO_PATH=/app/storage/profile-photos`, `IMPORT_PATH=/app/storage/imports` y `ACADEMIC_CONTENT_PATH=/app/storage/academic-content.json`.
- Configurar `APP_URL=https://ruta-vocacional-gold.vercel.app` (o el dominio público definitivo) y `COOKIE_SECURE=true`.
- No configurar `API_ORIGIN` en este servidor: ejecuta la API directamente.
- Exponer el servicio mediante HTTPS. `/api/health` comprueba la base de datos; `registrationReady` indica si se inicializó la institución.
- SMTP es necesario para recuperar contraseñas. Gemini es opcional para los análisis de IA; no es necesario para ingresar o administrar cursos.

## 2. Inicialización y cuentas

Si ya hay datos reales, respaldar SQLite y los archivos privados con el proceso detenido y migrarlos al volumen. No reemplazarlos por una base de prueba.

Para una instalación nueva, iniciar primero la aplicación para crear las tablas. En una consola privada del servidor configurar `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mínimo 12 caracteres), `ADMIN_NAME`, `INSTITUTION_NAME` e `INSTITUTION_CODE`, y ejecutar:

```sh
node scripts/create-admin.mjs
```

El script crea el administrador y configura la institución para el registro, en una transacción. Conserva una institución de plataforma ya configurada. No restablece contraseñas ni sobrescribe usuarios existentes. Retirar las variables del administrador después de la operación.

Acceso administrativo: `/admin/login`. Acceso de estudiantes: `/ingresar`. Las cuentas de la antigua vista de diseño eran temporales en cada pestaña y no se convierten automáticamente en cuentas reales.

## 3. Vercel

1. Configurar `API_ORIGIN` con el origen HTTPS del servidor (sin `/api` ni rutas).
2. Eliminar `NEXT_PUBLIC_DESIGN_PREVIEW` de las variables del proyecto si existe.
3. Usar el preset Next.js, Node 24, `npm run build` y salida `.next`, conforme a `vercel.json`.
4. Volver a desplegar. La interfaz se publica aunque `API_ORIGIN` no esté configurado. En ese caso, el acceso informa que el servicio no está disponible y las operaciones API devuelven 503; no se crean cuentas temporales ni se escribe SQLite en Vercel. Al conectar el servidor y volver a desplegar se habilita el acceso real.
5. Abrir `/api/health` en el dominio público: debe devolver JSON con `ok: true`, `mode: "server"` y `registrationReady: true`.
6. Probar registro, ingreso, recarga y cierre de sesión; publicar un curso desde administración e inscribirse con otro usuario.

Solo se admite el origen público configurado en `APP_URL`, además del origen propio de la API, para las mutaciones. No usar comodines de CORS ni habilitar cookies de terceros.

## Verificación local

`npm run build` y `npx tsc --noEmit`. Las pruebas de cursos están en `scripts/qa-training/`; utilizar únicamente la base aislada indicada por esos scripts. Los detalles del módulo están en [CURSOS-Y-SIMULADORES.md](CURSOS-Y-SIMULADORES.md).

Referencias: [rewrites externas de Vercel](https://vercel.com/docs/routing/rewrites), [discos persistentes de Render](https://render.com/docs/disks).
