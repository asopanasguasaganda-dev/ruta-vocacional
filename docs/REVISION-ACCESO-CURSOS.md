# Revisión de acceso y cursos

## Cambios

- Imagen de estudiantes adultos en el acceso, optimizada a WebP de 1200 × 800 (107 KB), con proporción y encuadre estables.
- Navegación, tarjetas, estados vacíos, editor amplio y mensajes de error de cursos adaptados a escritorio y móvil.
- El dashboard conserva el acceso a cursos incluso si falla la carga. Las respuestas antiguas de red no sustituyen una carga más reciente.
- Compilación Next.js real en Vercel, conexión `/api/*` mediante `API_ORIGIN`, validación del origen público y comprobación `/api/health`.
- Inicialización administrativa que configura también la institución necesaria para registrar estudiantes.
- Dockerfile y documentación para un servidor con almacenamiento persistente.

## Comprobaciones realizadas

- TypeScript y compilación de producción correctos.
- Motores de evaluaciones y cursos: puntuación, omisiones, rúbricas, avance e intentos.
- API: importación, publicación, inscripción, guardado, concurrencia, permisos, PDF, versiones y vencimientos.
- UI: crear simulador, publicar curso, inscripción desde móvil, guardar, recargar, continuar y obtener resultado y avance.
- Registro y acceso con cuentas de prueba de administrador y estudiante, sesión tras recargar, contraseña incorrecta y origen no autorizado.
- Administrador, estudiante y editor a 360, 390, 768, 1024 y 1366 píxeles, más reflujo equivalente a 200 %, sin desbordamiento horizontal.
- Capturas del acceso revisadas a 360 y 1366 píxeles.
- Configuración del proxy y bloqueo de despliegue Vercel sin backend; inicialización administrativa en una base aislada.

Las pruebas usan `.qa-tools/constructor-qa.sqlite`. Las capturas y resultados quedan en `evidencia/cursos`, excluido de Git. Se actualizaron dos pruebas antiguas que todavía esperaban el título anterior y que los cursos de admisión no se recomendaran sin una convocatoria elegida; el comportamiento vigente recomienda por carrera y respeta la convocatoria cuando se elige.

## Pendiente en producción

No se ha provisionado un servidor externo ni configurado `API_ORIGIN` en Vercel. El ingreso y los cursos públicos no se consideran verificados hasta conectar ese servidor y realizar las pruebas del despliegue. Las cuentas de la antigua vista de diseño no existen en una base real.

El arranque local adicional de producción (`npm start`) para verificar persistencia tras reiniciar fue rechazado por la revisión automática con «blocked by policy»; no se contabiliza esa prueba como realizada. La compilación y las pruebas contra el servidor de desarrollo sí finalizaron correctamente.

## Imagen

Archivo: `public/media/students-campus.webp`. Generada con la herramienta integrada ImageGen, inspeccionada y optimizada con Sharp.

Prompt: fotografía editorial realista de tres estudiantes universitarios latinoamericanos adultos de 20–24 años, dos mujeres y un hombre, colaborando con computadora y cuadernos en una biblioteca universitaria; ropa cotidiana crema, denim y lavanda, luz natural cálida, tonos azul oscuro y violeta, composición horizontal 3:2 con rostros dentro del área central, sin textos, logos ni marcas de agua.
