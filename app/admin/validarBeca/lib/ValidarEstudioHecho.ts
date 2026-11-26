/**
 * LÓGICA DE FILTRADO DE ESTUDIO SOCIOECONÓMICO:
 * - "Hecho": El estudiante cuenta con un estudio de tipo 'administrador' en el periodo actual
 *   o heredado del periodo de su solicitud en lista de espera.
 * - "Pendiente": El estudiante aún no cuenta con ningún estudio de tipo 'administrador'.
 */
export function aplicarFiltroEstudioAdmin(
  estadoEstudio: string | undefined,
  pId: number
): { condition: string; param: Array<string | number> } {
  if (!estadoEstudio) {
    return { condition: '', param: [] };
  }

  if (estadoEstudio === "Hecho") {
    return {
      condition: ` AND EXISTS (
        SELECT 1 FROM estudios_socioeconomicos es_chk 
        WHERE es_chk.student_id = st.id 
        AND es_chk.tipo = 'administrador' 
        AND (es_chk.periodo_id = ? OR es_chk.periodo_id = s.periodo_id)
      )`,
      param: [Number(pId)]
    };
  }

  if (estadoEstudio === "Pendiente") {
    return {
      condition: ` AND NOT EXISTS (
        SELECT 1 FROM estudios_socioeconomicos es_chk 
        WHERE es_chk.student_id = st.id 
        AND es_chk.tipo = 'administrador' 
        AND (es_chk.periodo_id = ? OR es_chk.periodo_id = s.periodo_id)
      )`,
      param: [Number(pId)]
    };
  }

  return { condition: '', param: [] };
}