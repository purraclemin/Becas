"use client"

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LabelList, PieChart, Pie 
} from 'recharts'

const COLORS = ['#1e3a5f', '#d4a843', '#2a6041', '#8b5cf6', '#ef4444', '#0ea5e9', '#f59e0b', '#6366f1'];

// --- 1. GRÁFICO DE CARRERAS (INTERACTIVO) ---
interface CarreraBarChartProps {
  data: any[];
  onNavigate: (carrera: string) => void;
}

export function CarreraBarChart({ data, onNavigate }: CarreraBarChartProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-96">
      <h3 className="font-black text-[#1a2744] mb-4 text-[10px] uppercase tracking-widest">
        Solicitudes por Carrera
      </h3>
      <div className="h-full w-full pb-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 25, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip cursor={{ fill: '#f8fafc' }} />
            
            <Bar 
              dataKey="value" 
              radius={[6, 6, 0, 0]} 
              className="cursor-pointer"
              // CLIC DIRECTO EN LA BARRA: Más preciso que en el gráfico general
              onClick={(entry) => {
                if (entry && entry.name) {
                  onNavigate(entry.name);
                }
              }}
            >
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}

              <LabelList 
                dataKey="value" 
                position="top" 
                style={{ fill: '#1a2744', fontSize: '12px', fontWeight: '900' }} 
              />

              <LabelList 
                dataKey="name" 
                position="center" 
                angle={-90} 
                fill="#fff" 
                style={{ 
                  fontSize: '9px', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase',
                  pointerEvents: 'none'
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// --- 2. GRÁFICO DE TORTA (TIPOS DE BECA - INTERACTIVO) ---
interface BecaPieChartProps {
  data: any[];
  onNavigate: (tipoBeca: string) => void;
}

export function BecaPieChart({ data, onNavigate }: BecaPieChartProps) {
  const chartData = data?.map(i => ({ 
    name: i.tipo_beca, 
    value: Number(i.total) 
  })) || []
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-96 flex flex-col">
      <h3 className="font-black text-[#1a2744] mb-4 text-[10px] uppercase tracking-widest text-center">
        Distribución por Programa
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={chartData} 
              innerRadius={60} 
              outerRadius={80} 
              paddingAngle={5} 
              dataKey="value"
              className="cursor-pointer outline-none"
              // CLIC EN LA REBANADA: Captura el nombre de la beca
              onClick={(state) => {
                if (state && state.name) {
                  onNavigate(state.name);
                }
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="hover:opacity-80 transition-opacity outline-none"
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* LEYENDA INFERIOR INTERACTIVA */}
      <div className="mt-4 space-y-2 overflow-y-auto max-h-32 pr-2 custom-scrollbar">
        {data?.map((item, i) => (
          <div 
            key={i} 
            onClick={() => onNavigate(item.tipo_beca)}
            className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 border-b border-slate-50 pb-2 cursor-pointer hover:bg-blue-50 transition-all rounded px-1"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
              <span className="truncate max-w-[120px] group-hover:text-[#1a2744]">{item.tipo_beca}</span>
            </div>
            <span className="text-[#1a2744] font-black bg-slate-100 px-2 py-0.5 rounded">{item.total}</span>
          </div>
        ))}
      </div>
    </div>
  )
}