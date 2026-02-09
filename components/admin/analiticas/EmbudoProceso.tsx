"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { Filter } from "lucide-react"

const COLORS = ['#1e3a5f', '#2563eb', '#d4a843', '#10b981'];

export function EmbudoProceso({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-[#1a2744] text-sm uppercase tracking-widest">
          Embudo de Aprobación
        </h3>
        <Filter className="h-5 w-5 text-slate-300" />
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
          <Tooltip cursor={{fill: 'transparent'}} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList dataKey="value" position="right" style={{ fill: '#1a2744', fontWeight: 'bold', fontSize: 12 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}