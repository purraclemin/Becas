// lib/Actionslogout.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout() {
  const cookieStore = await cookies()
  
  // Eliminamos las cookies que el Middleware revisa
  cookieStore.delete('session_token')
  cookieStore.delete('user_role')

  // Redirigimos al login para que el Middleware bloquee el re-ingreso
  redirect('/')
}