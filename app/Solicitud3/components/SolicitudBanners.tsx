"use client"

import { Lock, AlertCircle, FileSearch, ShieldAlert } from "lucide-react"

interface SolicitudBannersProps {
  estatus: string;
}

export function SolicitudBanners({ estatus }: SolicitudBannersProps) {
  // 🟢 Solo mostramos banners para estados de trámite activos en esta página.
  const mostrarBanner = ['Pendiente', 'En Revisión', 'Revisión Especial'].includes(estatus);

  // 🟢 CONFIGURACIÓN DE ESTILOS Y CONTENIDO (REFINADO PARA DISEÑO INMERSIVO)
  const getConfig = () => {
    switch (estatus) {
      case 'En Revisión':
        return {
          borde: "border-blue-100",
          fondo: "bg-blue-50/30",
          iconoColor: "text-blue-500",
          iconoBg: "bg-blue-50",
          textoTitulo: "text-blue-900",
          textoDetalle: "text-blue-600/80",
          Icono: FileSearch,
          titulo: "Expediente en Análisis"
        };
      case 'Revisión Especial':
        return {
          borde: "border-orange-100",
          fondo: "bg-orange-50/30",
          iconoColor: "text-orange-500",
          iconoBg: "bg-orange-50",
          textoTitulo: "text-orange-900",
          textoDetalle: "text-orange-600/80",
          Icono: ShieldAlert,
          titulo: "Revisión Académica Especial"
        };
      case 'Pendiente':
      default:
        return {
          borde: "border-[#d4a843]/20",
          fondo: "bg-[#d4a843]/5",
          iconoColor: "text-[#d4a843]",
          iconoBg: "bg-white",
          textoTitulo: "text-[#1e3a5f]",
          textoDetalle: "text-[#1e3a5f]/60",
          Icono: AlertCircle,
          titulo: "Solicitud en Trámite"
        };
    }
  };

  const config = getConfig();

  return (
    <>
      {mostrarBanner && (
        <div className={`mb-10 p-8 border-2 border-dashed rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-sm transition-all duration-700 animate-in fade-in slide-in-from-top-4 ${config.borde} ${config.fondo}`}>
          
          {/* Icono con contenedor estilizado */}
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-sm border border-white ${config.iconoBg}`}>
            <config.Icono className={`h-8 w-8 ${config.iconoColor}`} />
          </div>

          {/* Textos informativos con jerarquía visual de la Imagen 1 */}
          <div className="flex-1 text-center md:text-left space-y-1">
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${config.textoTitulo}`}>
              {config.titulo}
            </h3>
            <p className={`text-[11px] font-bold uppercase tracking-tight ${config.textoDetalle}`}>
              Estado de la postulación: <span className="font-black italic text-[#d4a843]">"{estatus}"</span>
            </p>
            
            {/* Nota aclaratoria con estilo institucional */}
            {estatus === 'Revisión Especial' && (
              <p className="text-[10px] font-bold mt-3 text-orange-700/70 max-w-2xl italic leading-relaxed uppercase tracking-tighter">
                * Su solicitud requiere una evaluación detallada por parte de la comisión debido al índice académico reportado.
              </p>
            )}
          </div>

          {/* Badge de seguridad visual */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full border border-white shadow-sm">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronizado</span>
          </div>
        </div>
      )}
    </>
  )
}