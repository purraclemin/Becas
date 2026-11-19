"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { CircleAlert, X, Info, Activity } from "lucide-react"

const COLORS = ['#2563eb', '#4f46e5', '#f59e0b', '#eab308', '#10b981', '#059669'];

export interface IEmbudoProcesoItem {
  name: string;
  value?: number;
  viejos?: number;
  nuevos?: number;
  [key: string]: unknown;
}

interface EmbudoProcesoProps {
  data: IEmbudoProcesoItem[];
}

interface YAxisTickProps {
  x?: string | number;
  y?: string | number;
  payload?: {
    value?: string | number;
  };
}

interface TooltipPayloadItem {
  name?: string | number;
  value?: string | number | Array<string | number>;
  payload?: IEmbudoProcesoItem;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

interface CustomLabelProps {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  value?: string | number | boolean | null;
}

interface BarClickData {
  payload?: IEmbudoProcesoItem;
  name?: string;
}

function CustomYAxisTick({ x = 0, y = 0, payload }: YAxisTickProps) {
  return (
    <g transform={`translate(${Number(x)},${Number(y)})`}>
      <text
        x={-10}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#64748b"
        fontSize="8px"
        fontWeight="900"
        className="uppercase tracking-tighter"
      >
        {String(payload?.value ?? '')}
      </text>
    </g>
  );
}

function CustomTooltipContent({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const itemData = payload[0]?.payload;
  const esBeneficiariosTotales = itemData?.name === 'BENEFICIARIOS TOTALES';

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        fontSize: '10px',
        color: '#1e293b',
      }}
      className="px-3 py-2 space-y-1"
    >
      {payload.map((entry, idx) => {
        const seriesName = String(entry.name ?? '');
        const rawVal = Array.isArray(entry.value) ? entry.value[0] : entry.value;

        if (esBeneficiariosTotales) {
          if (seriesName === 'viejos') {
            return (
              <div key={idx} className="flex items-center justify-between gap-3 font-semibold">
                <span>Becarios Antiguos:</span>
                <span className="font-black">{String(rawVal ?? 0)}</span>
              </div>
            );
          }
          if (seriesName === 'nuevos') {
            return (
              <div key={idx} className="flex items-center justify-between gap-3 font-semibold">
                <span>Nuevos Ingresos:</span>
                <span className="font-black">{String(rawVal ?? 0)}</span>
              </div>
            );
          }
          return null;
        }

        if (seriesName === 'viejos') {
          return (
            <div key={idx} className="flex items-center justify-between gap-3 font-semibold">
              <span>Total Estudiantes:</span>
              <span className="font-black">{String(rawVal ?? 0)}</span>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function CustomValueLabel({ x = 0, y = 0, width = 0, value }: CustomLabelProps) {
  if (!value) return null;

  const numX = Number(x);
  const numY = Number(y);
  const numWidth = Number(width);

  return (
    <g>
      <rect x={numX + numWidth + 10} y={numY - 2} width={35} height={22} rx={6} fill="#f1f5f9" />
      <text
        x={numX + numWidth + 27}
        y={numY + 12}
        fill="#1e293b"
        fontSize="10px"
        fontWeight="900"
        textAnchor="middle"
      >
        {String(value)}
      </text>
    </g>
  );
}

export function EmbudoProceso({ data }: EmbudoProcesoProps) {
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const router = useRouter();

  const maxVal = useMemo<number>(() => {
    if (!data || data.length === 0) return 100;
    const realMax = Math.max(...data.map((d) => Number(d.value || 0)));
    return Math.max(realMax, 10) * 1.2;
  }, [data]);

  const handleBarClick = (entry: BarClickData) => {
    const targetName = entry.payload?.name ?? entry.name;
    const baseUrl = "/admin/solicitudes";
    let params = "";

    switch (targetName) {
      case 'SUPERVIVENCIA ACADÉMICA':
        params = "?es_renovacion=true&promedioMin=16";
        break;
      case 'PRIORIDAD CRÍTICA':
        params = "?es_renovacion=true&promedioMin=16&vulnerabilidadMin=60";
        break;
      case 'ALERTA DE DESCENSO':
        params = "?vulnerabilidadMin=60&tendencia=descenso";
        break;
      case 'RENOVACIÓN GARANTIZADA':
        params = "?es_renovacion=true&status=Aprobada";
        break;
      case 'BENEFICIARIOS TOTALES':
        params = "?scope=total_beneficiarios";
        break;
    }

    if (params) router.push(`${baseUrl}${params}`);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px] flex flex-col relative overflow-hidden group">

      {/* Header Sincronizado con el Radar */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">
              Monitor de Continuidad
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              Análisis Predictivo de Becas
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowInfo(true)}
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl border border-slate-200 transition-all shadow-sm cursor-pointer"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
          >
            <XAxis type="number" hide domain={[0, maxVal]} />
            <YAxis
              dataKey="name"
              type="category"
              width={140}
              tick={<CustomYAxisTick />}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
              content={<CustomTooltipContent />}
            />

            <Bar
              name="viejos"
              dataKey={(d: IEmbudoProcesoItem) => d.name === 'BENEFICIARIOS TOTALES' ? Number(d.viejos || 0) : Number(d.value || 0)}
              stackId="a"
              barSize={18}
              onClick={handleBarClick}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-v-${index}`}
                  fill={entry.name === 'BENEFICIARIOS TOTALES' ? '#2563eb' : COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>

            <Bar
              name="nuevos"
              dataKey={(d: IEmbudoProcesoItem) => d.name === 'BENEFICIARIOS TOTALES' ? Number(d.nuevos || 0) : 0}
              stackId="a"
              radius={10}
              barSize={18}
              onClick={handleBarClick}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-n-${index}`} fill="#10b981" />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                content={<CustomValueLabel />}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend */}
      <div className="mt-4 flex items-center justify-start gap-6 border-t border-slate-100 pt-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-600 shadow-sm" />
          <span className="text-[8px] font-black text-slate-500 uppercase">Históricos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
          <span className="text-[8px] font-black text-slate-500 uppercase">Nuevos</span>
        </div>
      </div>

      {/* Modal Guía */}
      {showInfo && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <CircleAlert className="h-4 w-4 text-blue-600" /> Glosario Técnico
            </h4>
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            {[
              { t: "Supervivencia", d: "Continuidad del periodo anterior con rendimiento alto.", c: "bg-blue-600" },
              { t: "Prioridad Crítica", d: "Alto riesgo socioeconómico detectado por algoritmo.", c: "bg-indigo-600" },
              { t: "Alerta Descenso", d: "Disminución significativa en promedio histórico.", c: "bg-amber-500" },
              { t: "Renovación", d: "Aprobaciones automáticas por cumplimiento de norma.", c: "bg-yellow-500" },
              { t: "Beneficiarios", d: "Masa crítica aprobada para el periodo actual.", c: "bg-emerald-500" }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className={`h-6 w-1 rounded-full ${item.c}`} />
                <div>
                  <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{item.t}</p>
                  <p className="text-[9px] text-slate-500 font-medium leading-tight">{item.d}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowInfo(false)}
            className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            Cerrar Monitor
          </button>
        </div>
      )}
    </div>
  )
}