"use client"

import React from "react"

export function RiskIndicator({ color, label, range }: any) {
  return (
    <div className="flex flex-col items-center md:items-start gap-2">
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${color}`}></div>
        <span className="text-[10px] font-black tracking-widest">{label}</span>
      </div>
      <span className="text-[18px] font-black text-white/40 tracking-tighter">{range}</span>
    </div>
  )
}

export const getColorByScore = (score: number) => {
  if (score >= 70) return "bg-rose-600";
  if (score >= 50) return "bg-orange-500";
  if (score >= 25) return "bg-amber-500";
  return "bg-emerald-500";
};