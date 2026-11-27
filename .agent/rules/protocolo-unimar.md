# Protocolo UNIMAR — Reglas de Desarrollo, BD y UI/UX

Aplica estas reglas en todas las respuestas y modificaciones dentro de este workspace (Plataforma de Becas UNIMAR — Next.js App Router, React, TypeScript, `mysql2/promise`, MariaDB/TiDB Cloud, Tailwind CSS):

## 1. Estándares de Código y Tipado
- **Prohibido `any`:** está estrictamente prohibido usar `any` en componentes, hooks, estados, parámetros o respuestas de bases de datos.
- **SQL tipado estrictamente:** tipa todas las consultas y respuestas de `mysql2/promise` usando interfaces que extiendan `RowDataPacket`, `ResultSetHeader` o tipos explícitos del dominio.
- **Archivos completos:** cuando entregues o modifiques código, entrega los archivos completos desde la primera hasta la última línea, sin código parcial ni marcadores de relleno (`// ...`, `/* resto igual */`).
- **No pedir archivos que ya están en el workspace:** inspecciona directamente los archivos del proyecto vinculadoy, si se adjunta un `.txt`, audítalo directamente sin pedir que te pasen código manualmente.

## 2. Frontend, Seguridad y Arquitectura App Shell (Protocolo UNIMAR Parte 3)
- **Cero DOM nativo:** prohibido usar `document.getElementById`, `document.querySelector` o manipulación imperativa del DOM. Usa exclusivamente estados (`useState`) y referencias (`useRef`) de React para evitar errores de hidratación en Next.js.
- **Cero XSS:** prohibido usar `dangerouslySetInnerHTML` o inyectar HTML crudo sin sanitización previa.
- **Integridad App Shell:** la responsividad y el flujo visual deben depender 100% de la jerarquía de componentes de React y clases de Tailwind CSS, prohibiendo scripts externos o alteraciones del DOM global.

## 3. Base de Datos y Seguridad (Protocolo UNIMAR Parte 2)
- **GROUP BY estricto:** nunca agrupes por una sola columna si seleccionas columnas no agregadas que no forman parte de una función matemática. Usa subconsultas (`EXISTS`) o incluye todas las columnas no agregadas para compatibilidad con `ONLY_FULL_GROUP_BY`.
- **Búsquedas insensibles a mayúsculas:** convierte siempre ambos lados del filtro a minúsculas para búsquedas seguras (por ejemplo `LOWER(s.nombre) LIKE ?` con `.toLowerCase()`).
- **Paginación segura:** sanitiza y parsea los números con `Number` (y `Math.floor` / `Math.max`) antes de usarlos en los límites de consulta.
- **Uso consciente de JOINs:** emplea `LEFT JOIN` acompañado de `IFNULL` para relaciones opcionales con el fin de heredar valores por defecto sin romper la integridad principal.

## 4. Integridad de Lógica y Diseño UI/UX
- **Lógica intacta:** trabaja estrictamente sobre la funcionalidad o refactorización solicitada. No limpies, alteres ni elimines funciones o estados ajenos a la tarea ni cambies nombres de variables o constantes existentes sin necesidad.
- **Estética institucional UNIMAR (Unimar Academic Minimalist):** Azul Institucional (`#1e3a5f` / `#1a2744`), acentos en Dorado (`#d4a843`), superficies blancas sobre fondos grises ultra limpios (`#f8fafc`), bordes finos y sombras suaves.
- **Unimar Fluid Scale (UF-Scale):**
  - **Móvil:** ergonomía táctil y adaptabilidad fluida (transformación de tablas complejas a tarjetas tipo *Table-to-Cards*, alturas `h-12`, textos `text-sm`).
  - **Escritorio (PC):** alta densidad espacial corporativa, componentes limpios, compactos y optimizados (alturas `h-9`, textos `text-xs`) para evitar saturación.