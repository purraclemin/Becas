"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Inter, Montserrat } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname();
  
  // Detectamos si la ruta actual debe excluirse del escalado (Admin o Postulación)
  const isExcluded = pathname?.startsWith('/admin') || pathname?.startsWith('/postulacion');

  return (
    <html lang="es" className="overflow-x-hidden">
      <body className={`${_inter.variable} ${_montserrat.variable} font-sans antialiased bg-slate-50`}>
        
        {isExcluded ? (
          /* SI ES ADMIN O POSTULACIÓN: 
             Renderizamos los children directamente al 100%. 
             Esto evita que el escalado global rompa estos diseños de pantalla completa.
          */
          <>{children}</>
        ) : (
          /* SI ES OTRA VISTA DEL ESTUDIANTE: 
             Aplicamos el escalado del 85% solicitado.
             Se compensa tanto el ancho (117.65%) como el alto (117.65vh).
          */
          <div className="origin-top scale-[0.85] w-[117.65%] h-[117.65vh] -ml-[8.82%]">
              {children}
          </div>
        )}

        <Toaster /> 
      </body>
    </html>
  )
}