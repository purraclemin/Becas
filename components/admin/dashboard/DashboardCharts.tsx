"use client"

import React from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LabelList, PieChart, Pie 
} from 'recharts'

const COLORS = ['#1e3a5f', '#d4a843', '#2a6041', '#8b5cf6', '#ef4444', '#0ea5e9', '#f59e0b', '#6366f1'];

// --- 1. GRÁFICO DE CARRERAS (BARRAS RESPONSIVO) ---
interface CarreraBarChartProps {
  data: any[];
  onNavigate: (carrera: string) => void;
}

export function CarreraBarChart({ data, onNavigate }: CarreraBarChartProps) {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200/80 min-h-[320px] flex flex-col flex-1">
      <h3 className="font-black text-[#1e3a5f] mb-3 text-[9px] sm:text-[10px] uppercase tracking-widest">
        Solicitudes por Carrera
      </h3>
      
      {/* ================= VISTA ESCRITORIO / PC (Columnas Verticales) ================= */}
      <div className="hidden md:block w-full h-72 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 5, left: 5, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }} 
            />
            
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]} 
              className="cursor-pointer"
              onClick={(entry: any) => {
                const carrera = entry?.name || entry?.payload?.name;
                if (carrera) onNavigate(carrera);
              }}
            >
              {data.map((entry, i) => (
                <Cell key={`cell-pc-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}

              <LabelList 
                dataKey="value" 
                position="top" 
                style={{ fill: '#1e3a5f', fontSize: '10px', fontWeight: '900' }} 
              />

              <LabelList 
                dataKey="name" 
                position="center" 
                angle={-90} 
                style={{ 
                  fill: '#fff', 
                  fontSize: '8px', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase',
                  pointerEvents: 'none',
                  textShadow: '0px 1px 1px rgba(0,0,0,0.3)'
                }} 
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= VISTA MÓVIL (Barras horizontales apiladas verticalmente) ================= */}
      <div className="block md:hidden w-full h-80 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            layout="vertical"
            data={data} 
            margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={110} 
              tick={{ fontSize: 8, fontWeight: 'bold', fill: '#1e3a5f' }} 
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }} 
            />
            
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]} 
              className="cursor-pointer"
              onClick={(entry: any) => {
                const carrera = entry?.name || entry?.payload?.name;
                if (carrera) onNavigate(carrera);
              }}
            >
              {data.map((entry, i) => (
                <Cell key={`cell-mob-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}

              <LabelList 
                dataKey="value" 
                position="right" 
                style={{ fill: '#1e3a5f', fontSize: '9px', fontWeight: '900' }} 
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
  const chartData = Array.isArray(data) ? data.map(i => ({ 
    name: i.tipo_beca, 
    value: Number(i.total) 
  })) : []
  
  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200/80 min-h-[320px] flex flex-col flex-1">
      <h3 className="font-black text-[#1e3a5f] mb-2 text-[9px] sm:text-[10px] uppercase tracking-widest text-center">
        Distribución por Programa
      </h3>
      
      <div className="w-full h-48 sm:h-52 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={chartData} 
              innerRadius={45} 
              outerRadius={60} 
              paddingAngle={3} 
              dataKey="value"
              className="cursor-pointer outline-none"
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
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="text-center">
                <span className="block text-xl font-black text-[#1e3a5f] leading-none">
                    {chartData.reduce((acc, curr) => acc + curr.value, 0)}
                </span>
                <span className="block text-[8px] uppercase font-black text-slate-400 mt-0.5">Total</span>
             </div>
        </div>
      </div>
      
      <div className="mt-2 space-y-1 overflow-y-auto max-h-[240px] pr-1 custom-scrollbar">
        {data?.map((item, i) => (
          <div 
            key={i} 
            onClick={() => onNavigate(item.tipo_beca)}
            className="flex justify-between items-center text-[8px] sm:text-[9px] font-black uppercase text-slate-600 border-b border-slate-50 py-1.5 cursor-pointer hover:bg-slate-50 transition-all rounded px-1 group"
          >
            <div className="flex items-center gap-1.5 overflow-hidden">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
              <span className="truncate group-hover:text-[#1e3a5f] transition-colors" title={item.tipo_beca}>
                {item.tipo_beca}
              </span>
            </div>
            <span className="text-[#1e3a5f] font-black bg-slate-100 px-1.5 py-0.5 rounded leading-none">
                {item.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}