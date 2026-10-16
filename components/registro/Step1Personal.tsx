import React, { useState, useEffect } from "react"
import { User, CreditCard, Phone, Mail, Calendar, MapPin, Users, Send, CheckCircle2, Loader2, ShieldCheck } from "lucide-react"
import { validateLetters, validateNumbers } from "./validations"
import { sendVerificationCode, verifyEmailCode } from "@/lib/actions-registro"

// 🟢 INTERFAZ ESTRICTA PARA EL ESTADO DEL FORMULARIO
export interface RegistroFormState {
  nombre: string;
  apellido: string;
  cedula: string;
  sexo: string;
  fecha_nacimiento: string;
  municipio: string;
  telefono: string;
  email: string;
  password: string;
  confirmPassword: string;
  carrera: string;
  semestre: string;
  aceptaTerminos: boolean;
}

interface Step1PersonalProps {
  form: RegistroFormState;
  updateField: (field: keyof RegistroFormState, value: string | boolean) => void;
  emailVerified: boolean;
  setEmailVerified: (verified: boolean) => void;
}

export const Step1Personal = ({ form, updateField, emailVerified, setEmailVerified }: Step1PersonalProps) => {
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!emailVerified) {
      setLocalSuccess(null);
    }
  }, [emailVerified]);

  // 🟢 Cálculo dinámico para restringir la fecha a personas de 14 años en adelante
  const today = new Date();
  const maxYear = today.getFullYear() - 14;
  const maxDate = `${maxYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const minYear = today.getFullYear() - 100; // Límite lógico de 100 años atrás
  const minDate = `${minYear}-01-01`;

  const handleSendCode = async () => {
    setLocalError(null);
    setLocalSuccess(null);

    const emailBase = form.email.replace("@unimar.edu.ve", "").trim();
    if (!emailBase) {
      setLocalError("Por favor ingresa tu usuario de correo antes de enviar el código.");
      return;
    }

    const fullEmail = emailBase + "@unimar.edu.ve";
    setLoadingAction(true);

    try {
      const res = await sendVerificationCode(fullEmail);
      if (res.success) {
        setOtpSent(true);
        setLocalSuccess("¡Código enviado con éxito! Revisa tu bandeja o la consola.");
      } else {
        setLocalError(res.error || "No se pudo enviar el código.");
      }
    } catch (e) {
      setLocalError("Error de conexión al enviar el código.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleVerifyCode = async () => {
    setLocalError(null);
    setLocalSuccess(null);

    if (otpCode.length !== 4 && otpCode.length !== 6) {
      setLocalError("El código debe tener 4 (maestro) o 6 dígitos.");
      return;
    }

    const fullEmail = form.email.replace("@unimar.edu.ve", "").trim() + "@unimar.edu.ve";
    setLoadingAction(true);

    try {
      const res = await verifyEmailCode(fullEmail, otpCode);
      if (res.success) {
        setEmailVerified(true);
        setLocalSuccess("¡Correo institucional verificado correctamente!");
      } else {
        setLocalError(res.error || "Código incorrecto o expirado.");
      }
    } catch (e) {
      setLocalError("Error al verificar el código.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* NOMBRE */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Nombre</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={(e) => updateField("nombre", validateLetters(e.target.value))}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843]"
              placeholder="Ej: Juan"
              required
            />
          </div>  
        </div>

        {/* APELLIDO */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Apellido</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <input
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={(e) => updateField("apellido", validateLetters(e.target.value))}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843]"
              placeholder="Ej: Pérez"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* CÉDULA */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Cédula de Identidad</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <input
              type="text"
              name="cedula"
              value={form.cedula}
              onChange={(e) => updateField("cedula", validateNumbers(e.target.value, 8))}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843]"
              placeholder="Ej: 22333444"
              required
            />
          </div>
        </div>

        {/* TELÉFONO */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Teléfono de Contacto</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <input
              type="text"
              name="telefono"
              value={form.telefono}
              onChange={(e) => updateField("telefono", validateNumbers(e.target.value, 11))}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843]"
              placeholder="Ej: 04121234567"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* SEXO */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Sexo</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <select
              name="sexo"
              value={form.sexo}
              onChange={(e) => updateField("sexo", e.target.value)}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843] appearance-none font-bold text-[#1e3a5f]"
              required
            >
              <option value="">Selecciona</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {/* FECHA DE NACIMIENTO */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Fecha de Nacimiento</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <input
              type="date"
              name="fecha_nacimiento"
              value={form.fecha_nacimiento}
              max={maxDate}
              min={minDate}
              onChange={(e) => updateField("fecha_nacimiento", e.target.value)}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843] font-bold text-[#1e3a5f]"
              required
            />
          </div>
        </div>
      </div>

      {/* MUNICIPIO */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Municipio de Residencia</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          <select
            name="municipio"
            value={form.municipio}
            onChange={(e) => updateField("municipio", e.target.value)}
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843] appearance-none font-bold text-[#1e3a5f]"
            required
          >
            <option value="">Selecciona tu municipio</option>
            <option value="Antolín del Campo">Antolín del Campo</option>
            <option value="Arismendi">Arismendi</option>
            <option value="Díaz">Díaz</option>
            <option value="García">García</option>
            <option value="Gómez">Gómez</option>
            <option value="Maneiro">Maneiro</option>
            <option value="Marcano">Marcano</option>
            <option value="Mariño">Mariño</option>
            <option value="Península de Macanao">Península de Macanao</option>
            <option value="Tubores">Tubores</option>
            <option value="Villalba">Villalba</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      {/* EMAIL INSTITUCIONAL Y VERIFICACIÓN OTP */}
      <div className="space-y-2 pt-1">
        <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Email Institucional</label>
        
        <div className="relative flex">
          <input type="hidden" name="email" value={form.email} />
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af] z-10" />
            <input
              type="text"
              value={form.email.replace("@unimar.edu.ve", "")}
              onChange={(e) => {
                if (!emailVerified) {
                  updateField("email", e.target.value.split("@")[0] + "@unimar.edu.ve");
                }
              }}
              disabled={emailVerified}
              placeholder="ej: juan.perez"
              className={`w-full rounded-l-lg border border-[#e2e8f0] py-3 pl-10 pr-4 text-sm outline-none font-bold text-[#1e3a5f] ${
                emailVerified ? "bg-emerald-50/50 text-emerald-800" : "bg-[#fcfdfe] focus:border-[#d4a843]"
              }`}
              required
            />
          </div>
          <div className="bg-[#f8fafc] border border-l-0 border-[#e2e8f0] rounded-r-lg px-4 flex items-center">
            <span className="text-xs font-bold text-[#1e3a5f]">@unimar.edu.ve</span>
          </div>
        </div>

        {/* BOTÓN ENVIAR CÓDIGO */}
        {!emailVerified && (
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSendCode}
              disabled={loadingAction || !form.email || form.email === "@unimar.edu.ve"}
              className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-50"
            >
              {loadingAction && !otpSent ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-[#d4a843]" />}
              {otpSent ? "Reenviar Código" : "Enviar Código de Verificación"}
            </button>
            <span className="text-[11px] text-gray-500 font-medium">
              {otpSent ? "Código enviado" : "Requiere verificación previa."}
            </span>
          </div>
        )}

        {/* INPUT DE CÓDIGO Y BOTÓN VERIFICAR */}
        {otpSent && !emailVerified && (
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-2 mt-2 animate-in fade-in">
            <label className="block text-[10px] font-black uppercase text-amber-800">
              Ingresa el código (Ej. Maestro: 1234):
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="1234 o 123456"
                  className="w-full rounded-lg border border-amber-300 bg-white py-2 pl-10 pr-4 text-sm font-mono tracking-widest outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={loadingAction || (otpCode.length !== 4 && otpCode.length !== 6)}
                className="px-5 py-2 bg-[#d4a843] hover:bg-[#c29a3a] text-[#1e3a5f] text-xs font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-50 shadow-sm"
              >
                {loadingAction ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Verificar"}
              </button>
            </div>
          </div>
        )}

        {/* MENSAJES DE ESTADO */}
        {localError && (
          <p className="text-red-600 text-xs font-semibold mt-1 ml-1 animate-in fade-in">{localError}</p>
        )}
        {localSuccess && (
          <p className="text-emerald-700 text-xs font-semibold mt-1 ml-1 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {localSuccess}
          </p>
        )}
      </div>
    </div>
  );
};