# Revisión visual y funcional

El estudiante tiene tres destinos: Inicio, Mis tests y Mis resultados. Perfil, seguridad y cierre de sesión están en el menú de cuenta. Administración conserva Inicio, Tests, Estudiantes y Resultados, con acceso independiente en `/admin/login`.

Plan, reflexiones, recursos, carreras como módulo separado y laboratorio dejaron de aparecer en la navegación. Sus rutas históricas redirigen tras validar sesión. Los documentos anteriores se conservan y se incluyen en la descarga de datos personales; no se eliminaron cuentas por su nombre. Las carreras se consultan dentro del reporte.

## Escala

En el equipo se comprobó `AppliedDPI=144`, equivalente al 150 % de escala de Windows. Esto no demuestra cuál era el zoom del navegador de las capturas. También existían espacios amplios y una barra lateral que consumían área útil. La corrección utiliza encabezado compacto, contenido limitado a 1248 px y tamaños CSS contenidos: texto 16 px, etiquetas 14 px, títulos 26–28 px, controles de al menos 44 px. No se modificó el zoom de Chrome ni la escala de Windows; no se usa `zoom` ni `transform: scale()` para encoger la aplicación.

Se verificaron siete pantallas en 320×568, 390×844, 768×1024, 1024×768, 1366×768, 1440×900 y 1920×1080. Resultado: 49 comprobaciones sin desbordamiento horizontal ni errores de página. En un perfil independiente de Chrome se probó zoom real por sitio al 200 %, también sin desbordamiento en siete pantallas. El desplazamiento vertical natural permanece cuando el contenido, la altura disponible o el aumento lo requieren.

La prueba de teclado utiliza un viewport reducido: demuestra accesibilidad de las acciones con menor altura, pero no sustituye una prueba del teclado físico/virtual en un teléfono real.

## Evidencia

Abre `evidencia/alcance-simplificado/index.html`. Incluye capturas de móvil y escritorio, pruebas de importación, zoom y reporte generado con datos ficticios. Los JSON adjuntos distinguen comprobaciones visuales, API y proveedor real.

La generación de IA para alumnos reales tiene una limitación de proveedor pendiente, descrita en `INTEGRACION_IA_ECUADOR.md`; no se presenta como habilitada para bachilleres. El resumen calculado y los registros permanecen utilizables.
