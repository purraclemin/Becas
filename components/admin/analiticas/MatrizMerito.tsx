"use client"

import { useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Cell
} from 'recharts'
import { CircleAlert, X, Info } from "lucide-react"

export interface IMatrizMeritoItem {
  cedula: string | number;
  nombre?: string;
  apellido?: string;
  carrera?: string;
  promedio_notas: number;
  vulnerabilidad_puntos: number;
  [key: string]: unknown;
}

interface MatrizMeritoProps {
  data: IMatrizMeritoItem[];
  onPointClick: (cedula: string) => void;
}

interface ScatterPayloadEntry {
  payload?: IMatrizMeritoItem;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ScatterPayloadEntry[];
}

interface ScatterClickEvent {
  cedula?: string | number;
  payload?: IMatrizMeritoItem;
}

const getBaremoNivel = (puntos: number): string => {
  if (puntos >= 70) return "CRÍTICO (70+)";
  if (puntos >= 50) return "ALTO (50-69)";
  if (puntos >= 25) return "MEDIO (25-49)";
  return "BAJO (0-24)";
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length > 0 && payload[0].payload) {
    const item = payload[0].payload;
    const promedio = Number(item.promedio_notas ?? 0);
    const vulnerabilidad = Number(item.vulnerabilidad_puntos ?? 0);

    return (
      <div className="bg-white dark:bg-[#1e293b] p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
        <p className="font-bold text-[#1a2744] dark:text-white">
          {String(item.nombre ?? "")} {String(item.apellido ?? "")}
        </p>
        <p className="text-slate-400 text-[9px] uppercase mb-2">{String(item.carrera ?? "")}</p>
        <div className="space-y-1 border-t pt-2 border-slate-100 dark:border-slate-800">
          <p className="flex justify-between gap-4">
            <span>Promedio:</span>
            <strong>{promedio}</strong>
          </p>
          <p className="flex justify-between gap-4">
            <span>Vulnerabilidad:</span>
            <strong>{vulnerabilidad}</strong>
          </p>
          <p className="flex justify-between gap-4">
            <span>Baremo:</span>
            <strong>{getBaremoNivel(vulnerabilidad)}</strong>
          </p>
        </div>
        <p className="mt-2 text-[8px] text-blue-500 font-bold uppercase text-center">
          Click para ver solicitud
        </p>
      </div>
    );
  }
  return null;
}

export function MatrizMerito({ data, onPointClick }: MatrizMeritoProps) {
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const handleScatterClick = (clicked: ScatterClickEvent) => {
    const cedulaValor = clicked?.payload?.cedula ?? clicked?.cedula;
    if (cedulaValor !== undefined && cedulaValor !== null && String(cedulaValor).trim() !== "") {
      onPointClick(String(cedulaValor));
    }
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
      <div className="mb-6 flex justify-between items-start gap-4">
        <div>
          <h2 className="text-lg font-black text-[#1a2744] dark:text-white uppercase tracking-widest">
            Matriz de Justicia Social
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Click en un estudiante para gestionar su beca
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowInfo(true)}
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl border border-slate-200 transition-all shadow-sm cursor-pointer shrink-0"
          title="Ver glosario y baremo"
        >
          <Info className="h-4 w-4" />
        </button>
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
              label={{
                value: 'Mérito Académico',
                position: 'bottom',
                offset: 20,
                fontSize: 10,
                fontWeight: 800,
                fill: '#94a3b8'
              }}
            />

            <YAxis
              type="number"
              dataKey="vulnerabilidad_puntos"
              domain={[0, 100]}
              ticks={[0, 25, 50, 70, 100]}
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

            {/* Zona de prioridad crítica (70+) y promedio de mérito (>= 16) */}
            <ReferenceArea x1={16} x2={20} y1={70} y2={100} fill="#10b981" fillOpacity={0.06} />
            <ReferenceLine x={16} stroke="#ef4444" strokeDasharray="3 3" />
            <ReferenceLine y={70} stroke="#e11d48" strokeDasharray="3 3" />
            <ReferenceLine y={50} stroke="#f97316" strokeDasharray="3 3" />
            <ReferenceLine y={25} stroke="#d4a843" strokeDasharray="3 3" />

            <Scatter
              data={data}
              onClick={handleScatterClick}
              style={{ cursor: 'pointer' }}
            >
              {data.map((entry, index) => {
                const promedio = Number(entry.promedio_notas ?? 0);
                const vulnerabilidad = Number(entry.vulnerabilidad_puntos ?? 0);

                let color = '#64748b';

                if (promedio >= 16 && vulnerabilidad >= 70) {
                  color = '#10b981';
                } else if (vulnerabilidad >= 70) {
                  color = '#e11d48';
                } else if (vulnerabilidad >= 50) {
                  color = '#f97316';
                } else if (promedio >= 16) {
                  color = '#d4a843';
                } else if (vulnerabilidad >= 25) {
                  color = '#3b82f6';
                }

                return <Cell key={`cell-${index}`} fill={color} stroke="white" strokeWidth={1} />;
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Modal Glosario Técnico */}
      {showInfo && (
        <div className="absolute inset-0 z-50 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <CircleAlert className="h-4 w-4 text-blue-600" /> Glosario Técnico y Baremo
            </h4>
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-3 p-3 rounded-xl bg-blue-50/70 dark:bg-slate-800/90 border border-blue-100 dark:border-slate-700">
            <p className="text-[10px] text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              Esta matriz cruza el <strong>mérito académico</strong> (promedio de notas, eje horizontal) con el{" "}
              <strong>índice de vulnerabilidad socioeconómica</strong> (puntaje de baremo, eje vertical) para identificar
              y priorizar a los estudiantes con mayor necesidad y rendimiento. Haz clic sobre cualquier punto para abrir y
              gestionar directamente su solicitud.
            </p>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            {[
              { t: "CRÍTICO (70+)", d: "Nivel de vulnerabilidad crítico en el baremo socioeconómico.", c: "bg-rose-600" },
              { t: "ALTO (50-69)", d: "Nivel de vulnerabilidad alto con requerimientos prioritarios de atención.", c: "bg-orange-500" },
              { t: "MEDIO (25-49)", d: "Nivel de vulnerabilidad moderado según evaluación socioeconómica.", c: "bg-[#d4a843]" },
              { t: "BAJO (0-24)", d: "Nivel de vulnerabilidad bajo en la escala de baremo.", c: "bg-emerald-500" },
              { t: "MÉRITO ACADÉMICO (16+)", d: "Promedio destacado que, combinado con vulnerabilidad crítica, prioriza la asignación.", c: "bg-blue-600" }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-center p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className={`h-6 w-1 rounded-full ${item.c}`} />
                <div>
                  <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{item.t}</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-300 font-medium leading-tight">{item.d}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowInfo(false)}
            className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            Cerrar Glosario
          </button>
        </div>
      )}
    </div>
  )
}