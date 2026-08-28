/**
 * 🔍 LÓGICA DE FILTRADO DE ESTUDIO SOCIOECONÓMICO:
 * - "Hecho": El estudiante tiene un estudio de tipo 'administrador' registrado en el periodo actual.
 * - "Pendiente": El estudiante NO tiene ningún estudio de tipo 'administrador' registrado en el periodo actual.
 */
export function aplicarFiltroEstudioAdmin(
  estadoEstudio: string | undefined, 
  pId: number
): { condition: string; param: any[] } {
  if (!estadoEstudio) {
    return { condition: '', param: [] };
  }

  if (estadoEstudio === "Hecho") {
    return {
      condition: ` AND EXISTS (
        SELECT 1 FROM estudios_socioeconomicos es_chk 
        WHERE es_chk.student_id = st.id 
        AND es_chk.tipo = 'administrador' 
        AND es_chk.periodo_id = ?
      )`,
      param: [pId]
    };
  }

  if (estadoEstudio === "Pendiente") {
    return {
      condition: ` AND NOT EXISTS (
        SELECT 1 FROM estudios_socioeconomicos es_chk 
        WHERE es_chk.student_id = st.id 
        AND es_chk.tipo = 'administrador' 
        AND es_chk.periodo_id = ?
      )`,
      param: [pId]
    };
  }

  return { condition: '', param: [] };
}