"use client"

import React from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LabelList, PieChart, Pie 
} from 'recharts'

// Paleta de colores institucional + auxiliares
const COLORS = ['#1e3a5f', '#d4a843', '#2a6041', '#8b5cf6', '#ef4444', '#0ea5e9', '#f59e0b', '#6366f1'];

// --- 1. GRÁFICO DE CARRERAS (BARRAS) ---
interface CarreraBarChartProps {
  data: any[];
  onNavigate: (carrera: string) => void;
}

export function CarreraBarChart({ data, onNavigate }: CarreraBarChartProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-96 flex flex-col">
      <h3 className="font-black text-[#1a2744] mb-4 text-[10px] uppercase tracking-widest">
        Solicitudes por Carrera
      </h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 25, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
            />
            
            <Bar 
              dataKey="value" 
              radius={[6, 6, 0, 0]} 
              className="cursor-pointer"
              // LÓGICA DE CLIC ROBUSTA
              onClick={(entry: any) => {
                // Recharts a veces devuelve el objeto directo o dentro de payload
                const carrera = entry?.name || entry?.payload?.name;
                if (carrera) onNavigate(carrera);
              }}
            >
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}

              {/* Valor encima de la barra */}
              <LabelList 
                dataKey="value" 
                position="top" 
                style={{ fill: '#1a2744', fontSize: '12px', fontWeight: '900' }} 
              />

              {/* Nombre de la carrera dentro de la barra (Vertical) */}
              <LabelList 
                dataKey="name" 
                position="center" 
                angle={-90} 
                style={{ 
                  fill: '#fff', 
                  fontSize: '9px', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase',
                  pointerEvents: 'none', // Importante para que el clic pase a la barra
                  textShadow: '0px 1px 2px rgba(0,0,0,0.5)'
                }} 
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// --- 2. GRÁFICO DE TORTA (TIPOS DE BECA) ---
interface BecaPieChartProps {
  data: any[];
  onNavigate: (tipoBeca: string) => void;
}

export function BecaPieChart({ data, onNavigate }: BecaPieChartProps) {
  // Aseguramos que data sea un array para evitar errores de map
  const chartData = Array.isArray(data) ? data.map(i => ({ 
    name: i.tipo_beca, 
    value: Number(i.total) 
  })) : []
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-96 flex flex-col">
      <h3 className="font-black text-[#1a2744] mb-4 text-[10px] uppercase tracking-widest text-center">
        Distribución por Programa
      </h3>
      
      {/* Gráfico */}
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={chartData} 
              innerRadius={55} 
              outerRadius={75} 
              paddingAngle={4} 
              dataKey="value"
              className="cursor-pointer outline-none"
              // LÓGICA DE CLIC ROBUSTA
              onClick={(entry: any) => {
                 const tipo = entry?.name || entry?.payload?.name;
                 if (tipo) onNavigate(tipo);
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="hover:opacity-80 transition-opacity outline-none stroke-none"
                />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Centro del Donut (Total) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="text-center">
                <span className="block text-2xl font-black text-[#1a2744]">
                    {chartData.reduce((acc, curr) => acc + curr.value, 0)}
                </span>
                <span className="block text-[9px] uppercase font-bold text-slate-400">Total</span>
             </div>
        </div>
      </div>
      
      {/* Leyenda Interactiva (Scrollable) */}
      <div className="mt-4 space-y-1.5 overflow-y-auto max-h-28 pr-1 custom-scrollbar">
        {data?.map((item, i) => (
          <div 
            key={i} 
            onClick={() => onNavigate(item.tipo_beca)}
            className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 border-b border-slate-50 pb-1.5 cursor-pointer hover:bg-blue-50 hover:pl-2 transition-all rounded px-1 group"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
              <span className="truncate group-hover:text-[#1a2744] transition-colors" title={item.tipo_beca}>
                {item.tipo_beca}
              </span>
            </div>
            <span className="text-[#1a2744] font-black bg-slate-100 px-2 py-0.5 rounded ml-2">
                {item.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}