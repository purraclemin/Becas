// utils/SolicitudesUtils.ts

export const getBadgeColor = (e: string): string => {
  const styles: Record<string, string> = {
    'Aprobada': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Rechazada': 'bg-rose-100 text-rose-700 border-rose-200',
    'En Revisión': 'bg-blue-100 text-blue-700 border-blue-200',
    'Renovacion': 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
    'Revisión Especial': 'bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse'
  }
  return styles[e] || 'bg-amber-100 text-amber-700 border-amber-200'
}

export interface RiskDetailsResult {
  label: string;
  style: string;
}

export const getRiskDetails = (puntaje: number | string | null | undefined): RiskDetailsResult => {
  const p = typeof puntaje === 'number' ? puntaje : parseInt(String(puntaje || 0), 10) || 0

  if (p >= 70) {
    return { label: 'CRÍTICO', style: 'text-white bg-red-600 border-red-700 font-black shadow-sm' } // Rojo intenso sólido
  }
  if (p >= 50) {
    return { label: 'ALTO', style: 'text-white bg-orange-500 border-orange-600 font-black shadow-sm' } // Naranja vibrante sólido
  }
  if (p >= 25) {
    return { label: 'MEDIO', style: 'text-slate-900 bg-amber-400 border-amber-500 font-black shadow-sm' } // Amarillo dorado fuerte
  }
  return { label: 'BAJO', style: 'text-white bg-emerald-600 border-emerald-700 font-black shadow-sm' } // Verde esmeralda sólido
}

export const getAvgStyle = (nota: string | number): string => {
  const val = typeof nota === 'number' ? nota : parseFloat(String(nota || 0)) || 0
  if (val >= 16) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (val >= 10) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-rose-50 text-rose-700 border-rose-200'
}