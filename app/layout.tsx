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
  const pathname = usePathname()
  
  const isExcluded = pathname?.startsWith('/admin') || pathname?.startsWith('/postulacion')

  return (
    <html lang="es" className="h-full">
      <body className={`${_inter.variable} ${_montserrat.variable} font-sans antialiased bg-slate-50 text-slate-900 min-h-screen w-full overflow-x-hidden`}>
        {isExcluded ? (
          <>{children}</>
        ) : (
          <div className="w-full min-h-screen flex flex-col">
            {children}
          </div>
        )}

        <Toaster /> 
      </body>
    </html>
  )
}