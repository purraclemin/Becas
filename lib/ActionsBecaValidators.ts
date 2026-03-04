'use server'

import { db } from './db'

/**
 * 🟢 MOTOR DE VALIDACIÓN DE REGLAMENTOS Y CUPOS
 * Centraliza las reglas institucionales y la lógica de "Cupo Comprometido".
 */

// Se añadió 'export' para que el componente AuditoriaPanel pueda reconocer el tipo
export interface DiagnosticoBeca {
  apto: boolean;
  codigo: 'OK' | 'CUPO_EXCEDIDO' | 'INDICE_INSUFICIENTE' | 'TRIMESTRE_INSUFICIENTE' | 'ERROR';
  mensaje: string;
  detalles?: {
    actual: number;
    maximo: number;
    indiceRequerido: number;
    indiceActual: number;
  };
}

/**
 * Valida requisitos y cupos buscando los datos reales en la DB por solicitudId.
 * Se añadió 'export' para que pueda ser invocada desde el cliente.
 */
export async function validarCuposYRequisitos(
  solicitudId: number,
  periodoId: number
): Promise<DiagnosticoBeca> {
  try {
    // 1. OBTENER DATOS CON LIMPIEZA TOTAL
    const [dataRows]: any = await db.execute(`
      SELECT 
        TRIM(s.tipo_beca) as tipo_beca, 
        s.promedio_notas, 
        st.semestre as trimestre_real, 
        TRIM(st.carrera) as carrera
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      WHERE s.id = ?
    `, [Number(solicitudId)]); 

    if (!dataRows || dataRows.length === 0) {
      return { apto: false, codigo: 'ERROR', mensaje: "No se encontró el expediente del estudiante." };
    }

    // NORMALIZACIÓN: Eliminamos espacios dobles o extraños
    const tipoBecaRaw = dataRows[0].tipo_beca.toUpperCase().replace(/\s+/g, ' ').trim();
    const carreraDB = dataRows[0].carrera.toUpperCase().replace(/\s+/g, ' ').trim();
    const trimestreReal = parseInt(dataRows[0].trimestre_real);
    const indiceNum = parseFloat(dataRows[0].promedio_notas);
    
    // 2. REGLAMENTO INSTITUCIONAL
    const REGLAMENTO: Record<string, any> = {
      'BECA APRENDIZAJE': { cupoMaximo: 25, indiceMinimo: 16, trimestreMinimo: 1 },
      'BECA SOCIAL': { cupoMaximo: 40, indiceMinimo: 18, trimestreMinimo: 1 }, 
      'BECA POR DISCAPACIDAD': { cupoMaximo: 20, indiceMinimo: 16, trimestreMinimo: 1 },
      'BECA A LA EXCELENCIA': { cupoMaximo: 8, indiceMinimo: 18, trimestreMinimo: 4 }
    };

    const regla = REGLAMENTO[tipoBecaRaw];

    if (!regla) {
      return { 
        apto: true, 
        codigo: 'OK', 
        mensaje: `Tipo de beca (${tipoBecaRaw}) sin restricciones específicas.` 
      };
    }

    // 3. VALIDACIÓN DE REQUISITOS ACADÉMICOS
    if (trimestreReal < regla.trimestreMinimo) {
      return {
        apto: false,
        codigo: 'TRIMESTRE_INSUFICIENTE',
        mensaje: `Esta beca exige trimestre ${regla.trimestreMinimo}. El estudiante está en el ${trimestreReal}.`,
      };
    }

    if (indiceNum < regla.indiceMinimo) {
      return {
        apto: false,
        codigo: 'INDICE_INSUFICIENTE',
        mensaje: `El índice (${indiceNum}) es insuficiente para ${tipoBecaRaw}. Mínimo: ${regla.indiceMinimo}.`,
        detalles: { actual: 0, maximo: regla.cupoMaximo, indiceRequerido: regla.indiceMinimo, indiceActual: indiceNum }
      };
    }

    // 4. CONTEO DE CUPOS COMPROMETIDOS
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      WHERE s.periodo_id = ? 
        AND UPPER(TRIM(s.tipo_beca)) = ? 
        AND s.estatus NOT IN ('Rechazada')
        AND s.id != ?
    `;
    
    let params: any[] = [Number(periodoId), tipoBecaRaw, Number(solicitudId)];

    if (tipoBecaRaw === 'BECA A LA EXCELENCIA') {
      countQuery += ` AND UPPER(TRIM(st.carrera)) = ?`;
      params.push(carreraDB);
    }

    const [rows]: any = await db.execute(countQuery, params);
    const cupoOcupado = rows[0]?.total || 0;

    console.log(`🔍 VALIDACIÓN [${tipoBecaRaw}]: Detectadas ${cupoOcupado} ocupadas. Límite: ${regla.cupoMaximo}`);

    if (cupoOcupado >= regla.cupoMaximo) {
      return {
        apto: false,
        codigo: 'CUPO_EXCEDIDO',
        mensaje: `Cupo comprometido: Ya existen ${cupoOcupado} solicitudes activas para ${tipoBecaRaw}.`,
        detalles: { 
          actual: cupoOcupado, 
          maximo: regla.cupoMaximo, 
          indiceRequerido: regla.indiceMinimo, 
          indiceActual: indiceNum 
        }
      };
    }

    return { apto: true, codigo: 'OK', mensaje: "Cumple con los requisitos y hay cupo disponible." };

  } catch (error) {
    console.error("❌ Error en validador de becas:", error);
    return { apto: false, codigo: 'ERROR', mensaje: "Error interno al verificar el reglamento." };
  }
}