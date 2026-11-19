import React from "react"
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { getPasswordStrength } from "./validations"
import { RegistroFormState } from "./Step1Personal"

interface Step3SecurityProps {
  form: RegistroFormState;
  updateField: (field: keyof RegistroFormState, value: string | boolean) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirm: boolean;
  setShowConfirm: (show: boolean) => void;
}

export const Step3Security = ({ 
  form, updateField, showPassword, setShowPassword, showConfirm, setShowConfirm 
}: Step3SecurityProps) => {
  const strength = getPasswordStrength(form.password);
  const strengthColor = ["bg-slate-200", "bg-red-500", "bg-amber-400", "bg-emerald-500"];
  const strengthText = ["", "Débil", "Media", "Segura"];
  const strengthWidth = ["w-0", "w-1/3", "w-2/3", "w-full"];

  return (
    <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#6b7280] ml-1">Contraseña</label>
          <span className={`text-[9px] font-bold uppercase ${strength === 3 ? "text-emerald-600" : strength === 2 ? "text-amber-500" : "text-red-500"}`}>
            {strengthText[strength]}
          </span>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9ca3af]" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            className="w-full h-11 sm:h-9 rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] pl-9 pr-9 text-sm sm:text-xs outline-none focus:border-[#d4a843]"
            placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#1e3a5f] transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
          <div className={`h-full transition-all duration-500 ${strengthColor[strength]} ${strengthWidth[strength]}`} />
        </div>
      </div>

      <div className="space-y-1 pt-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-[#6b7280] ml-1">Confirmar Contraseña</label>
        <div className="relative">
          <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9ca3af]" />
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            placeholder="Repite tu contraseña"
            className={`w-full h-11 sm:h-9 rounded-lg border bg-[#fcfdfe] pl-9 pr-9 text-sm sm:text-xs outline-none transition-all ${
              form.confirmPassword && form.password === form.confirmPassword
                ? "border-emerald-300 focus:border-emerald-500"
                : "border-[#e2e8f0] focus:border-[#d4a843]"
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#1e3a5f] transition-colors"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] cursor-pointer mt-3 hover:bg-slate-50 transition-colors">
        <input
          type="checkbox"
          name="aceptaTerminos"
          checked={form.aceptaTerminos}
          onChange={(e) => updateField("aceptaTerminos", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
          required
        />
        <span className="text-[11px] text-[#6b7280] leading-relaxed">
          Declaro bajo juramento que soy estudiante activo de la <b>Universidad de Margarita</b>.
        </span>
      </label>
    </div>
  );
};