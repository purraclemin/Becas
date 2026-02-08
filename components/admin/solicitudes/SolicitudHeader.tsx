import Link from "next/link"
import { Home, LogOut } from "lucide-react"
import { logout } from "@/lib/ActionsAuth"

export function SolicitudesHeader({ currentStatus, onStatusChange }: any) {
  const tabs = ["Todas", "Pendiente", "En Revisión", "Aprobada", "Rechazada"]

  return (
    <div className="bg-white px-4 md:px-8 py-4 shadow-sm border-b border-slate-200 sticky top-0 z-30">
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
        <h1 className="text-xl font-bold text-[#1a2744] uppercase tracking-widest truncate">
          Gestionar Solicitudes
        </h1>

        <div className="flex items-center gap-4 w-full xl:w-auto overflow-x-auto no-scrollbar">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onStatusChange({ status: tab })}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                  currentStatus === tab
                    ? "bg-[#1a2744] text-white shadow-sm"
                    : "text-slate-500 hover:text-[#1a2744]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/">
              <button className="p-2 bg-slate-100 text-[#1a2744] rounded-lg hover:bg-slate-200 transition-colors">
                <Home className="h-4 w-4" />
              </button>
            </Link>
            <button
              onClick={() => logout()}
              className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}