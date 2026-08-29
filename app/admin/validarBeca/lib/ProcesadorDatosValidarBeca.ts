export interface SolicitudItem {
  id: number | string;
  nombre?: string;
  apellido?: string;
  cedula?: string;
  municipio_residencia?: string;
  carrera?: string;
  tipo_beca?: string;
  semestre?: number | string;
  trimestre?: number | string;
  puntaje?: number | null;
  promedio_notas?: number | string;
  promedio_historico?: number | string;
  indice_global?: number | string;
  estatus?: string;
  periodo_id?: number | string;
  created_at?: string;
  fecha_solicitud?: string;
  fecha_registro?: string;
}

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

/**
 * Operación matemática y de ordenamiento para la tabla de solicitudes de beca
 */
export function ordenarSolicitudes(listaDatos: SolicitudItem[], sortConfig: SortConfig) {
  if (!sortConfig.key) return listaDatos;
  
  return [...listaDatos].sort((a: SolicitudItem, b: SolicitudItem) => {
    let aValue: string | number = "";
    let bValue: string | number = "";

    if (sortConfig.key === 'estudiante') {
      aValue = `${a.nombre || ''} ${a.apellido || ''}`.toLowerCase();
      bValue = `${b.nombre || ''} ${b.apellido || ''}`.toLowerCase();
    } else if (sortConfig.key === 'vulnerabilidad') {
      aValue = Number(a.puntaje || 0);
      bValue = Number(b.puntaje || 0);
    } else if (sortConfig.key === 'promedio') {
      aValue = Number(a.promedio_notas || 0);
      bValue = Number(b.promedio_notas || 0);
    } else if (sortConfig.key === 'trimestre') {
      aValue = Number(a.semestre || a.trimestre || 0);
      bValue = Number(b.semestre || b.trimestre || 0);
    } else if (sortConfig.key === 'id') {
      aValue = Number(a.id || 0);
      bValue = Number(b.id || 0);
    } else {
      const rawA = a[sortConfig.key as keyof SolicitudItem];
      const rawB = b[sortConfig.key as keyof SolicitudItem];
      aValue = typeof rawA === 'string' ? rawA.toLowerCase() : (rawA ?? 0);
      bValue = typeof rawB === 'string' ? rawB.toLowerCase() : (rawB ?? 0);
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Operación de procesamiento y formateo de fecha de registro de solicitud
 */
export function formatearFechaEnvio(s: SolicitudItem): string {
  const rawFecha = s.fecha_registro || s.created_at || s.fecha_solicitud;
  return rawFecha 
    ? new Date(rawFecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }) 
    : 'S/F';
}