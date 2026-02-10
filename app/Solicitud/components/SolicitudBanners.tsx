"use client"

import { Lock, AlertCircle, FileSearch, ShieldAlert } from "lucide-react"

interface SolicitudBannersProps {
  estatus: string;
  estaBloqueadoTotalmente: boolean;
}

export function SolicitudBanners({ estatus, estaBloqueadoTotalmente }: SolicitudBannersProps) {
  // 🟢 Determinamos si se debe mostrar el banner para los estados de trámite activos
  const mostrarBanner = ['Pendiente', 'En Revisión', 'Revisión Especial'].includes(estatus);

  // 🟢 CONFIGURACIÓN DE ESTILOS Y CONTENIDO SEGÚN ESTATUS
  const getConfig = () => {
    switch (estatus) {
      case 'En Revisión':
        return {
          borde: "border-blue-300",
          fondo: "bg-blue-50/80",
          iconoColor: "text-blue-600",
          iconoBorde: "border-blue-200",
          textoTitulo: "text-blue-900",
          textoDetalle: "text-blue-800",
          Icono: FileSearch,
          titulo: "Expediente en Análisis"
        };
      case 'Revisión Especial':
        return {
          borde: "border-orange-400",
          fondo: "bg-orange-50/80",
          iconoColor: "text-orange-600",
          iconoBorde: "border-orange-300",
          textoTitulo: "text-orange-900",
          textoDetalle: "text-orange-800",
          Icono: ShieldAlert,
          titulo: "Revisión Académica Especial"
        };
      case 'Pendiente':
      default:
        return {
          borde: "border-[#d4a843]",
          fondo: "bg-[#fffdf5]",
          iconoColor: "text-[#d4a843]",
          iconoBorde: "border-[#d4a843]",
          textoTitulo: "text-[#1e3a5f]",
          textoDetalle: "text-[#1e3a5f]",
          Icono: AlertCircle,
          titulo: "Solicitud en Trámite"
        };
    }
  };

  const config = getConfig();

  return (
    <>
      {/* 🟢 BANNER DINÁMICO: Adaptado para el flujo de solicitudes de UNIMAR */}
      {mostrarBanner && (
        <div className={`mb-6 p-6 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center shadow-sm animate-in fade-in duration-500 ${config.borde} ${config.fondo}`}>
          
          {/* Icono con color y borde dinámico */}
          <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full border bg-white ${config.iconoBorde}`}>
            <config.Icono className={`h-5 w-5 ${config.iconoColor}`} />
          </div>

          {/* Textos informativos del estatus de la solicitud */}
          <h3 className={`text-sm font-black uppercase tracking-widest ${config.textoTitulo}`}>
            {config.titulo}
          </h3>
          <p className={`text-[11px] font-bold mt-1 ${config.textoDetalle}`}>
            Estatus Actual: <span className="font-black italic">"{estatus}"</span>
          </p>
          
          {/* Nota aclaratoria exclusiva para Revisión Especial */}
          {estatus === 'Revisión Especial' && (
            <p className="text-[9px] font-medium mt-2 text-orange-700 max-w-md italic">
              Su solicitud requiere una evaluación detallada por parte de la comisión debido al índice académico reportado.
            </p>
          )}
        </div>
      )}
    </>
  )
}