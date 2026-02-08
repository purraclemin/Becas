import Link from "next/link"
import { Home, LogOut } from "lucide-react"
import { logout } from "@/lib/ActionsLogout"

export function SocioHeader() {
  return (
    <div className="sticky top-0 z-30 bg-[#f8fafc] h-16 flex items-center px-6 md:px-8 border-b border-transparent">
      <div className="w-full bg-white px-6 py-2 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center gap-4">
        <h1 className="text-lg font-black text-[#1a2744] uppercase tracking-widest">
          Gestión Socioeconómica
        </h1>
        <div className="flex items-center gap-5 border-l border-slate-100 pl-5">
          <Link href="/" title="Ir al Inicio">
            <Home className="h-5 w-5 text-slate-400 hover:text-[#1a2744] transition-colors cursor-pointer" />
          </Link>
          <button 
            onClick={() => logout()} 
            className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-all border border-rose-100 group"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Salir</span>
          </button>
        </div>
      </div>
    </div>
  )
}