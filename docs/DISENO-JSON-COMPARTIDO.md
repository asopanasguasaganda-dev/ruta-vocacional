# Diseño con publicaciones compartidas en JSON

Este modo permite usar administración en un navegador y estudiantes en otro, sin base de datos y sin importar publicaciones manualmente.

## Ejecutar

Desde la carpeta del proyecto:

```powershell
npm run design:start
```

Abrir **http://localhost:3000** en ambos navegadores. Para cambiar el puerto: establecer `DESIGN_PORT` antes de ejecutar. Usar exactamente la misma dirección (no alternar localhost y 127.0.0.1).

Si la compilación ya está actualizada, basta `npm run design:serve`.

## Comportamiento

- El administrador crea o importa un test y lo publica para todos los estudiantes.
- El servidor valida y guarda el catálogo en `.local/design-publications.json`, excluido de Git.
- El estudiante inicia sesión en su navegador. Inicio y Mis tests consultan automáticamente las publicaciones; mientras la pestaña está visible se actualizan cada tres segundos.
- Los simuladores publicados se comparten en el mismo JSON y se muestran según las carreras recomendadas.
- Los borradores no se publican. Archivar o retirar contenido actualiza el catálogo compartido; respuestas e intentos iniciados se conservan.
- Las cuentas, respuestas y notas siguen guardadas en cada navegador. La cuenta del estudiante debe existir en el navegador donde inicia sesión. Las asignaciones por identificador de usuario local no se exportan: para estas pruebas entre navegadores, publicar para todos.
- Un fallo al guardar el JSON no confirma la publicación y restaura el catálogo local anterior.
- El JSON permanece al reiniciar el servidor. Se usan escrituras temporales y reemplazo del archivo, con serialización para evitar escrituras simultáneas.

## Alcance

Este servidor es exclusivamente para diseño en la misma computadora: escucha en 127.0.0.1, valida Host y Origin y no habilita CORS. Su autorización de edición es la del prototipo local; no es un servidor de producción. Las claves de los simuladores forman parte del contenido de práctica publicado.

El sitio de Vercel continúa usando una exportación estática. Este cambio **no habilita guardado persistente en la URL de Vercel**. Para esa URL se necesita un servicio persistente para guardar JSON, aunque no se utilice una base de datos. No se usa el almacenamiento temporal de funciones como si fuera persistente.

Los tests ya guardados en la dirección de Vercel no se trasladan a localhost automáticamente; el administrador puede volver a importar sus documentos para esta prueba local.

## Verificación

- `node scripts/test-shared-design-server.cjs`: validación, rechazo de otros orígenes, versiones antiguas, persistencia tras reiniciar y retirada.
- Prueba de navegador con dos contextos aislados: administrador publica test y simulador, el dashboard pasa de 3 a 4 automáticamente, estudiante responde, recibe la carrera vinculada y completa el simulador con 100/100 conservado al recargar.
- TypeScript y compilación estática de 35 rutas.
