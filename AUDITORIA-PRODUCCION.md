# Auditoría de preparación para producción

Fecha: 1 de octubre de 2026.

## Resultado verificado

El código compiló correctamente con Node.js 24.21.0 y Next.js 16.3.8, incluida la
comprobación de TypeScript. La instalación reproducible con `npm ci --include=dev`
informó cero vulnerabilidades conocidas en 461 paquetes auditados. Este resultado
corresponde a la fecha de revisión y no equivale a una prueba de penetración.

Comprobaciones aprobadas antes de retirar las dependencias y la compilación local:

- Límites reales de solicitudes, validación JSON, origen y protección CSRF.
- Configuración de producción, secretos, HTTPS, cookies y rutas privadas.
- Ausencia de los secretos configurados en recursos públicos y código del navegador.
- Analítica: fechas, grupos, versiones, periodos, datos vacíos y errores del proveedor IA.
- Motores de evaluación, ponderaciones, simuladores, intentos y reloj.
- MySQL: migraciones repetibles, transacciones y rollback, Unicode, concurrencia,
  claves foráneas y consultas parametrizadas.
- Seguridad HTTP: roles, contraseñas débiles, sesiones, rotación, recuperación de un
  solo uso, cuentas suspendidas, límites de acceso y cabeceras con nonce.
- Simuladores mediante HTTP y MySQL: recomendaciones, permisos por carrera,
  ocultación de respuestas correctas, inicio y entrega concurrentes, reanudación,
  notas, versiones, límites de intentos y conservación del historial.

Las pruebas de escritura se ejecutaron en una base nueva aislada terminada en
`_test`; esa base se eliminó al terminar. La base principal se consultó sin reiniciarla:
un administrador activo, cero estudiantes y cero entregas, informes e intentos.

## Limpieza y conservación

Se conserva el código fuente, `package-lock.json`, los esquemas de `database/`,
recursos públicos, scripts de instalación, pruebas reproducibles y avisos de terceros.
Las dependencias y los archivos compilados se regeneran en el servidor.

La limpieza física NO quedó completa. Se retiraron `.runtime`, `.design-preview`,
`.vercel`, `artifacts` y los scripts antiguos `scripts/qa-training`. Los archivos de
OCR descargados y `tsconfig.tsbuildinfo` se retiraron a un temporal recuperable.
El borrado permanente fue bloqueado por la revisión automática; la alternativa de
Papelera falló y Windows denegó mover `node_modules`. Permanecen `node_modules`,
`.next`, `.qa-tools` y `references`. Deben eliminarse con la cuenta propietaria de
Windows antes de cargar la carpeta completa. `.qa-tools` contiene material privado
de pruebas y nunca debe subirse. Estos directorios ya están excluidos de Git y Docker.

La configuración privada, credenciales locales y datos MySQL se resguardaron fuera
del proyecto. No deben cargarse en el alojamiento como parte del código. La base local
se detuvo de forma ordenada antes de resguardar su directorio; no se borraron sus tablas.
Para Hostinger configura una base y credenciales propias mediante variables privadas.

## Pendiente en el alojamiento

Todavía no se ha verificado esta entrega en un servidor Hostinger contratado.
Se deben comprobar allí MySQL, HTTPS, permisos y persistencia de archivos, dominio,
envío SMTP y disponibilidad del proveedor de IA. SMTP no estaba configurado durante
esta revisión; no se validó el envío real de recuperación por correo.

Esta revisión no incluye una nueva inspección visual de todas las pantallas, pruebas
de carga ni certificación de accesibilidad. El aviso de error de vista previa PDF
registrado en la documentación anterior debe verificarse en el recorrido de resultados.

## Reproducción

1. Instalar Node.js 24 y ejecutar `npm ci --include=dev`.
2. Configurar las variables privadas a partir de `.env.example`.
3. Ejecutar `npm run check:production`, `npm run test:security` y `npm run build`.
4. Ejecutar `npm start`; el arranque aplica migraciones y crea el administrador solo
   cuando no existe. No vacía datos anteriores.
5. Comprobar `npm run db:check` y `npm run verify:deployment -- https://tu-dominio`.

Los scripts de integración que escriben datos requieren una base aislada de pruebas;
nunca deben ejecutarse sobre datos de usuarios reales.
