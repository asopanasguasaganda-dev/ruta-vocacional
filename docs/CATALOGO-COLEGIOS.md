# Colegios de procedencia

Fuente suministrada por el usuario: `1MINEDEC_RegistrosAdministrativos_2025-2026-Inicio.xlsx`, hoja `Tabla n_01`, encabezados en la fila 16. La hoja identifica a MinEdec / DAEI como elaborador y los registros administrativos como fuente.

Se extraen únicamente AMIE, nombre, códigos y nombres de provincia/cantón/parroquia y presencia de bachillerato en el nivel educativo. No se publican estadísticas de alumnos, docentes ni administrativos. Se conservan los nombres del archivo; AMIE se normaliza a mayúsculas (incluye `09h02009`).

El catálogo contiene 16.275 instituciones. Las ubicaciones son las que aparecen en esta fuente: 24 provincias y la categoría «Zona en estudio». No es una certificación de oferta actual ni de que una persona se graduó en un colegio. El registro manual conserva la declaración sin atribuirle un AMIE.

Generación reproducible:

```powershell
python scripts/extract-education-xlsx.py 'C:/Users/PC/Downloads/1MINEDEC_RegistrosAdministrativos_2025-2026-Inicio.xlsx'
```

Requiere `openpyxl`. El JSON público contiene el SHA-256 de la fuente, periodo y conteos. Se carga cuando se abre el formulario educativo, sin incluirlo en el JavaScript inicial de la portada.

El PDF SEST aportado previamente contiene solo 630 instituciones de la evaluación Costa–Galápagos y carece de parroquias. Fue examinado, pero el catálogo utilizado finalmente procede del Excel más completo. No se mezclan ubicaciones inferidas del PDF con los registros del Excel.

En Vercel, durante la etapa de diseño, el registro e ingreso se ensayan en `sessionStorage`: una cuenta por pestaña, perfil y borradores de prueba. La contraseña se verifica con PBKDF2 y una sal aleatoria; nunca se guarda en texto plano. Esto no equivale a autenticación ni persistencia de producción. El aviso del formulario solicita datos ficticios. El servidor local conserva su autenticación real y valida AMIE y relaciones territoriales al registrar o actualizar un perfil.
