# Despliegue del diseño interactivo

La etapa actual no necesita bases de datos, cuentas reales ni API_ORIGIN.
Vercel usa `npm run build:design` y publica `.design-preview/out`, según `vercel.json`.
Usar preset Other y Node 24. Los ajustes del proyecto deben respetar este archivo.

En `/ingresar/` pulsa **Entrar como estudiante**; en `/admin/login/`, **Entrar como administrador**.
La barra de diseño permite cambiar de vista y reiniciar los cursos de muestra.
Los cursos, inscripciones, respuestas y resultados se guardan solo en el navegador (localStorage), compartidos entre ambas vistas en ese navegador. No se comparten entre dispositivos ni representan cuentas reales.

Es posible crear y publicar cursos, estudiar lecturas, completar simuladores, revisar puntajes y abrir un PDF de muestra. La importación local admite Word y HTML; PDF importado requiere la futura etapa con servidor.

Verificación: `node scripts/test-design-training.cjs` y `npm run build:design`.
La infraestructura de servidor queda documentada en [Backend futuro](BACKEND-FUTURO.md); no es requisito para esta entrega.
