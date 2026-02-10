"use client"

import { Lock, AlertCircle, FileSearch } from "lucide-react"

interface SolicitudBannersProps {
  estatus: string;
  estaBloqueadoTotalmente: boolean;
}

export function SolicitudBanners({ estatus, estaBloqueadoTotalmente }: SolicitudBannersProps) {
  const mostrarBanner = estatus === 'Pendiente' || estatus === 'En Revisión';
  const esRevision = estatus === 'En Revisión';

  // 🟢 CONFIGURACIÓN DE COLORES DINÁMICA
  // Si es Revisión -> Azul (Blue)
  // Si es Pendiente -> Amarillo (Gold/Amber)
  const estilos = esRevision 
    ? {
        borde: "border-blue-300",
        fondo: "bg-blue-50/80",
        iconoColor: "text-blue-600",
        iconoBorde: "border-blue-200",
        textoTitulo: "text-blue-900",
        textoDetalle: "text-blue-800"
      }
    : {
        borde: "border-[#d4a843]",
        fondo: "bg-[#fffdf5]",
        iconoColor: "text-[#d4a843]",
        iconoBorde: "border-[#d4a843]",
        textoTitulo: "text-[#1e3a5f]",
        textoDetalle: "text-[#1e3a5f]"
      };

  return (
    <>
      {/* 🟢 BANNER DINÁMICO: Cambia según el estatus */}
      {mostrarBanner && (
        <div className={`mb-6 p-6 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center shadow-sm animate-in fade-in duration-500 ${estilos.borde} ${estilos.fondo}`}>
          
          {/* Icono más pequeño con color dinámico */}
          <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full border bg-white ${estilos.iconoBorde}`}>
            {esRevision ? (
                <FileSearch className={`h-5 w-5 ${estilos.iconoColor}`} />
            ) : (
                <AlertCircle className={`h-5 w-5 ${estilos.iconoColor}`} />
            )}
          </div>

          {/* Textos condensados con color dinámico */}
          <h3 className={`text-sm font-black uppercase tracking-widest ${estilos.textoTitulo}`}>
            {esRevision ? "Expediente en Análisis" : "Solicitud en Trámite"}
          </h3>
          <p className={`text-[11px] font-bold mt-1 ${estilos.textoDetalle}`}>
            Estatus Actual: <span className="font-black italic">"{estatus}"</span>
          </p>
        </div>
      )}
    </>
  )
}