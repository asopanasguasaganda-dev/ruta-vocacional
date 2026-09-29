# Publicaciones compartidas en Vercel, sin base de datos

El sitio estático utiliza una función `/api/design-publications` y un único JSON privado en Vercel Blob. Los navegadores reciben los tests y simuladores publicados automáticamente al entrar, recuperar el foco o cada 15 segundos mientras la página está visible. Las cuentas, respuestas e intentos de esta versión de diseño siguen guardados en cada navegador.

## Activación (una vez)

1. En el proyecto de Vercel, abre **Storage → Create Database/Store → Blob** y selecciona acceso **Private**. Conecta el almacén al proyecto y al entorno **Production**. Aunque la pantalla de Vercel agrupe los almacenes bajo Storage/Database, esta integración guarda un archivo JSON, no utiliza una base de datos.
2. Comprueba que el proyecto recibe `BLOB_READ_WRITE_TOKEN` (o la configuración OIDC `BLOB_STORE_ID` y el token administrado por Vercel).
3. En **Settings → Environment Variables**, añade `DESIGN_PUBLISH_KEY`: una clave aleatoria de al menos 32 caracteres. Debe ser secreta y no llevar prefijo `NEXT_PUBLIC_`. No la guardes en Git ni la compartas con estudiantes.
4. Haz **Redeploy** para aplicar las variables.
5. En el navegador del administrador que contiene los tests existentes, abre **Evaluaciones → Publicación en línea**, introduce esa clave y pulsa **Conectar y publicar**. Esto sube las publicaciones existentes. Las siguientes publicaciones y archivos se sincronizan al guardarse; la clave se recuerda solo en la pestaña actual.
6. En otro navegador, inicia sesión como estudiante. Si hay tres tests originales y uno nuevo publicado para todos, deben aparecer cuatro en Inicio y Mis tests. Los simuladores aparecen en las carreras recomendadas correspondientes.

No hay que trasladar archivos al estudiante. Un borrador no se publica. Si falta configuración o falla la escritura, la aplicación muestra el error y no confirma una publicación fallida. El JSON admite hasta 4 MB de catálogo para estas pruebas.

## Verificación

`GET /__design/publications/` debe devolver `configured: true`. Nunca devuelve la clave. `PUT` exige `X-Publish-Key`. Las escrituras usan ETag para no sobrescribir cambios simultáneos y las lecturas privadas evitan la caché del CDN.

Pruebas: `node scripts/test-cloud-publications.cjs`, `node scripts/test-shared-design-server.cjs` y `npm run build:design`.

Documentación oficial: https://vercel.com/docs/vercel-blob/private-storage y https://vercel.com/docs/vercel-blob/using-blob-sdk.
