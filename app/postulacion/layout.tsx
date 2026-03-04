// app/postulacion/layout.tsx

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
    <div className="h-full w-full bg-[#f8fafc] overflow-hidden flex flex-col">
      {/* Se eliminó 'h-screen' y 'fixed inset-0'. 
          Al usar 'h-full', este contenedor hereda la altura compensada del RootLayout
          y se encoge perfectamente sin dejar espacios en blanco.
      */}
      {children}
    </div>
  )
}