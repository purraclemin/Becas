"use client"

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Cell
} from 'recharts'

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white dark:bg-[#1e293b] p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
        <p className="font-bold text-[#1a2744] dark:text-white">{data.nombre} {data.apellido}</p>
        <p className="text-slate-400 text-[9px] uppercase mb-2">{data.carrera}</p>
        <div className="space-y-1 border-t pt-2 border-slate-100 dark:border-slate-800">
          <p className="flex justify-between"><span>Promedio:</span> <strong>{data.promedio_notas}</strong></p>
          <p className="flex justify-between"><span>Vulnerabilidad:</span> <strong>{data.vulnerabilidad_puntos}</strong></p>
        </div>
        <p className="mt-2 text-[8px] text-blue-500 font-bold uppercase text-center">Click para ver solicitud</p>
      </div>
    )
  }
  return null
}

interface MatrizMeritoProps {
  data: any[]
  onPointClick: (cedula: string) => void // <--- Nueva prop
}

export function MatrizMerito({ data, onPointClick }: MatrizMeritoProps) {
  return (
    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 relative">
      <div className="mb-6">
        <h2 className="text-lg font-black text-[#1a2744] dark:text-white uppercase tracking-widest">
          Matriz de Justicia Social
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
          Click en un estudiante para gestionar su beca
        </p>
      </div>

      <div className="h-96 w-full relative pl-10">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
            
            <XAxis 
              type="number" 
              dataKey="promedio_notas" 
              domain={[10, 20]} 
              ticks={[10, 12, 14, 16, 18, 20]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              label={{ value: 'Mérito Académico', position: 'bottom', offset: 20, fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
            />

            <YAxis 
              type="number" 
              dataKey="vulnerabilidad_puntos" 
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              label={{ 
                value: 'Índice de Vulnerabilidad', 
                angle: -90, 
                position: 'insideLeft', 
                offset: -10,
                style: { textAnchor: 'middle', fontSize: 10, fontWeight: 800, fill: '#94a3b8' } 
              }}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

            <ReferenceArea x1={16} x2={20} y1={50} y2={100} fill="#10b981" fillOpacity={0.05} />
            <ReferenceLine x={16} stroke="#ef4444" strokeDasharray="3 3" />
            <ReferenceLine y={50} stroke="#d4a843" strokeDasharray="3 3" />

            <Scatter 
              data={data} 
              onClick={(clicked) => onPointClick(clicked.cedula)} // <--- Acción de clic
              style={{ cursor: 'pointer' }} // <--- Cambia el cursor a mano
            >
              {data.map((entry, index) => {
                let color = '#64748b'
                if (entry.promedio_notas >= 16 && entry.vulnerabilidad_puntos >= 50) color = '#10b981'
                else if (entry.vulnerabilidad_puntos >= 50) color = '#3b82f6'
                else if (entry.promedio_notas >= 16) color = '#f59e0b'

                return <Cell key={`cell-${index}`} fill={color} stroke="white" strokeWidth={1} />
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}