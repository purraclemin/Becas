import React from "react"
import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

export const metadata: Metadata = {
  title: 'UNIMAR Becas - Sistema de Gestion de Becas',
  description: 'Plataforma web para la gestion de becas para los estudiantes regulares de pregrado de la Universidad de Margarita (UNIMAR)',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${_inter.variable} ${_montserrat.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
