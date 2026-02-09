"use client"

import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts'
import { Crosshair } from "lucide-react"

export function RadarCarreras({ data }: { data: any[] }) {
  // Simulamos datos agrupados si no vienen listos (esto idealmente se hace en backend)
  // Aquí asumimos que recibes un array con { subject: 'Sistemas', A: 120, B: 110, fullMark: 150 }
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-black text-[#1a2744] text-sm uppercase tracking-widest">
          Perfil Académico por Carrera
        </h3>
        <Crosshair className="h-5 w-5 text-slate-300" />
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#000000', fontSize: 10, fontWeight: 'bold' }} />
          <PolarRadiusAxis angle={30} domain={[0, 20]} tick={false} axisLine={false} />
          
          <Radar
            name="Promedio General"
            dataKey="A"
            stroke="#c81728"
            strokeWidth={3}
            fill="#000000"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#01040a', fontWeight: 'bold', fontSize: '12px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}