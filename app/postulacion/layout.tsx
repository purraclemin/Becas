import React from "react"

export const metadata = {
  title: "Postulación de Becas | UNIMAR",
  description: "Sistema modular de postulación institucional",
}

export default function PostulacionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-[#f8fafc] flex flex-col">
      {/* Retícula Maestra Ajustada:
          - Se eliminó el 'pt-[73px] sm:pt-[81px]' que forzaba un margen superior externo 
            separado del flujo y dejaba la franja blanca superior.
          - Se mantiene 'w-full bg-[#f8fafc] flex flex-col' para que el contenedor ocupe 
            limpiamente el espacio disponible y se acople de manera fluida al Navbar y al contenido.
      */}
      {children}
    </div>
  )
}