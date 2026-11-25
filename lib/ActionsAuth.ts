// lib/ActionsAuth.ts
"use server";

import type { RowDataPacket } from "mysql2/promise";
import { db } from "./db";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { sincronizarYObtenerRecordAcademico } from "./ActionsRecordAcademico";

export type UserAuthRole = "estudiante" | "admin" | "secretaria";

const EMAIL_SECRETARIA_GENERAL = "secretariageneral@unimar.edu.ve";

interface UserAuthRow extends RowDataPacket {
  id: number;
  email: string | null;
  password: string;
  role: UserAuthRole;
}

export interface LoginActionResult {
  success?: boolean;
  role?: UserAuthRole;
  redirectTo?: string;
  error?: string;
}

async function debeUsarCookieSegura(): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") return false;
  const headerStore = await headers();
  const forwardedProto = (headerStore.get("x-forwarded-proto") || "").toLowerCase();
  const host = (headerStore.get("host") || "").toLowerCase();
  const esLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("0.0.0.0");

  if (esLocal || forwardedProto === "http") {
    return false;
  }
  return true;
}

/**
 * Función para iniciar sesión.
 * Verifica credenciales contra 'users' (búsqueda insensible a mayúsculas),
 * sincroniza el récord académico en estudiantes y redirige de forma garantizada
 * a Secretaría General hacia '/admin/validarBeca'.
 */
export async function login(formData: FormData): Promise<LoginActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Debe ingresar su correo electrónico y contraseña." };
  }

  let redirigirASecretaria = false;

  try {
    // 1. Buscar al usuario por su correo institucional en la tabla de credenciales
    const [rows] = await db.execute<UserAuthRow[]>(
      "SELECT id, email, password, role FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1",
      [email]
    );

    // 2. Verificar si el usuario existe
    if (rows.length === 0) {
      return { error: "El correo electrónico no está registrado." };
    }

    const user = rows[0];

    // 3. VALIDACIÓN SEGURA DE CONTRASEÑA
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { error: "La contraseña es incorrecta." };
    }

    // 4. RESOLUCIÓN DE ROL EFECTIVO (Garantiza segregación para Secretaría General)
    const emailDb = String(user.email ?? email).trim().toLowerCase();
    const rolEfectivo: UserAuthRole =
      user.role === "secretaria" || emailDb === EMAIL_SECRETARIA_GENERAL
        ? "secretaria"
        : user.role;

    // 5. SINCRONIZACIÓN DE RÉCORD ACADÉMICO OFICIAL (Solo estudiantes)
    if (rolEfectivo === "estudiante") {
      await sincronizarYObtenerRecordAcademico(user.id);
    }

    // 6. CREACIÓN DE SESIÓN CON SAMESITE LAX PARA ENLACES DIRECTOS
    const cookieStore = await cookies();
    const sessionToken = `session_user_${user.id}`;
    const secureCookie = await debeUsarCookieSegura();

    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 horas
    });

    cookieStore.set("user_role", rolEfectivo, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    if (rolEfectivo === "secretaria") {
      redirigirASecretaria = true;
    } else {
      return {
        success: true,
        role: rolEfectivo,
        redirectTo: rolEfectivo === "admin" ? "/admin/dashboard" : "/postulacion",
      };
    }
  } catch (e: unknown) {
    console.error("Error en autenticación:", e);
    return { error: "Hubo un error al intentar iniciar sesión." };
  }

  // 7. REDIRECCIÓN SERVIDOR FUERA DE TRY/CATCH PARA SECRETARÍA GENERAL
  if (redirigirASecretaria) {
    redirect("/admin/validarBeca");
  }

  return {
    success: true,
    role: "secretaria",
    redirectTo: "/admin/validarBeca",
  };
}

/**
 * Función para cerrar sesión.
 * Elimina las cookies y redirige al inicio.
 */
export async function logout() {
  const cookieStore = await cookies();

  cookieStore.delete("session_token");
  cookieStore.delete("user_role");

  redirect("/");
}