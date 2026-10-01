# Ruta Vocacional 360° — proyecto para Hostinger

Este repositorio ejecuta una única aplicación Next.js con backend y MySQL. Las cuentas,
sesiones, respuestas, resultados, simuladores e indicadores se consultan en el servidor.
Se retiraron el modo de cuentas del navegador y la publicación estática de Vercel.
Trabaja y despliega desde esta misma carpeta; no se necesita generar otro proyecto ni un ZIP.

## Requisitos

- Node.js 24 y MySQL 8.
- Hostinger con soporte para aplicaciones Node.js/Next.js y MySQL.
- Una base vacía para el primer despliegue y un directorio privado persistente fuera del código.
- Clave Gemini del servidor. SMTP para recuperación de contraseñas por correo.

## Configuración y ejecución

Configura las variables de `.env.example` en hPanel. En local, usa un archivo privado
`.env.local`; no sobrescribas claves existentes. El ejemplo no contiene credenciales reales.

```sh
npm ci --include=dev
npm run check:production
npm run build
npm start
```

El arranque comprueba la configuración, aplica migraciones y crea el administrador solamente
si todavía no existe. Usa las variables `ADMIN_*` e `INSTITUTION_*`. Retira `ADMIN_PASSWORD`
tras la primera instalación. Reiniciar nunca limpia ni reemplaza datos existentes.

Para desarrollo con tu MySQL configurado: `npm run dev`.
Para comprobar el primer inicio: `npm run db:check-initial` (un administrador y cero actividad).
Los catálogos de evaluación y orientación son contenido del sistema, no registros de alumnos ficticios.

## Comprobar el despliegue

```sh
npm run db:check
npm run verify:deployment -- https://tu-dominio
```

El verificador exige MySQL central y acceso administrativo protegido. Una web que muestra
«Alcance: este navegador» corresponde al despliegue antiguo, no al código de este proyecto.
El dominio anterior de Vercel no cambia automáticamente al modificar estos archivos.

Consulta [la auditoría de preparación](AUDITORIA-PRODUCCION.md).
Las contraseñas nuevas requieren de 15 a 128 caracteres. Define las credenciales del administrador
como variables privadas del servidor; no las incluyas en archivos públicos ni en el repositorio.
Los archivos privados `.env*`, `.local/`, `storage/` y `.qa-tools/` no se publican.
Las pruebas de base de datos solo deben ejecutarse sobre bases aisladas terminadas en `_test`.
SQLite se conserva únicamente como lector para migrar instalaciones anteriores y pruebas explícitas;
la aplicación usa MySQL por defecto y no recurre a almacenamiento de navegador si falla una conexión.

## Entrega del código fuente

La entrega debe excluir `node_modules`, `.next`, `.runtime`, `.qa-tools`, `references`, archivos
temporales y credenciales locales. La limpieza de algunas carpetas está pendiente por permisos
de Windows; consulta `AUDITORIA-PRODUCCION.md` antes de subir la carpeta completa.
Las dependencias y la compilación se generan durante la instalación. Conserva
`package-lock.json`: permite instalar las versiones verificadas con `npm ci --include=dev`.
No ejecutes `npm start` antes de instalar, configurar y compilar.

En Hostinger configura Node.js 24, las variables de `.env.example`, el comando de compilación
`npm run build` y el comando de inicio `npm start`. La base MySQL debe existir y el usuario
debe poder aplicar el esquema de `database/mysql.sql`. Usa rutas privadas persistentes para
importaciones, fotografías y catálogo, fuera del directorio reemplazado al desplegar.
No subas `.git` ni respaldos locales por el administrador de archivos.

La verificación local no sustituye la comprobación del dominio, HTTPS, permisos de almacenamiento,
correo y conexión MySQL en el alojamiento contratado. Ejecuta `npm run verify:deployment -- https://tu-dominio`
una vez publicado. Configura y prueba SMTP para habilitar la recuperación por correo.
