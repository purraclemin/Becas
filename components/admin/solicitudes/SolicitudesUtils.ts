// utils/SolicitudesUtils.ts

export const getBadgeColor = (e: string) => {
  const styles: Record<string, string> = {
    'Aprobada': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Rechazada': 'bg-rose-100 text-rose-700 border-rose-200',
    'En Revisión': 'bg-blue-100 text-blue-700 border-blue-200'
  }
  return styles[e] || 'bg-amber-100 text-amber-700 border-amber-200'
}

export const getRiskDetails = (puntaje: any) => {
  const p = parseInt(puntaje) || 0
  if (p >= 60) return { label: 'ALTO', style: 'text-rose-700 bg-rose-50 border-rose-200' }
  if (p >= 30) return { label: 'MEDIO', style: 'text-amber-700 bg-amber-50 border-amber-200' }
  return { label: 'BAJO', style: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
}

export const getAvgStyle = (nota: string) => {
  const val = parseFloat(nota)
  if (val >= 16) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (val >= 10) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-rose-50 text-rose-700 border-rose-200'
}