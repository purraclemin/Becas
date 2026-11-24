import React from "react"
import { Inter, Montserrat } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { getSession } from "@/lib/ActionsSession"
import { ControladorNavbar } from "@/components/ControladorNavbar"

import "./globals.css"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" })

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialUser = await getSession()

  return (
    <html lang="es" className="h-full">
      <body
        className={`${_inter.variable} ${_montserrat.variable} font-sans antialiased bg-slate-50 text-slate-900 min-h-screen w-full overflow-x-hidden`}
      >
        <ControladorNavbar initialUser={initialUser}>{children}</ControladorNavbar>
        <Toaster />
      </body>
    </html>
  )
}