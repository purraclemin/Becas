import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Mail, IdCard, CalendarDays, BookOpen, Clock, User2, Trophy, LucideIcon } from "lucide-react"

// 1. INTERFACES ESTRICTAS (Cero 'any')
export interface IAcademicInfoUser {
  id?: number | string;
  cedula?: string | number;
  email?: string;
  carrera?: string;
  trimestre?: number | string;
  semestre?: number | string;
  periodoActual?: string;
  indiceGlobal?: number | string | null;
}

interface IAcademicInfoProps {
  user: IAcademicInfoUser;
}

export function AcademicInfo({ user }: IAcademicInfoProps) {
  // 🟢 Formateo seguro para el Índice Global:
  // Evitamos que un valor de 0 sea tratado como "falso" y aseguramos la conversión a decimal.
  const displayIndice = (user.indiceGlobal !== undefined && user.indiceGlobal !== null) 
    ? parseFloat(user.indiceGlobal.toString()).toFixed(2) 
    : "0.00";

  return (
    <Card className="border-none shadow-2xl bg-white overflow-hidden">
      <CardHeader className="bg-[#fcfdfe] border-b border-gray-100 p-6 md:p-8">
        <CardTitle className="text-[#1e3a5f] font-serif text-lg md:text-xl flex items-center gap-3 uppercase tracking-tight">
          <div className="p-2 bg-[#1e3a5f]/5 rounded-lg">
            <GraduationCap className="h-6 w-6 text-[#d4a843]" />
          </div>
          Expediente Académico
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 md:p-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-10 gap-x-8">
          <InfoItem icon={IdCard} label="Cédula" value={`V-${user.cedula || "---"}`} />
          
          <InfoItem icon={Mail} label="Correo" value={user.email} isLowercase />
          
          <InfoItem icon={BookOpen} label="Carrera" value={user.carrera} isUppercase />
          
          <InfoItem 
            icon={CalendarDays} 
            label="Nivel Académico" 
            value={`${user.trimestre || user.semestre || "0"}° Trimestre`} 
          />
          
          <InfoItem 
            icon={Clock} 
            label="Periodo Actual" 
            value={user.periodoActual && user.periodoActual !== "N/A" ? user.periodoActual : "Sin Periodo Activo"} 
            isUppercase 
          />

          <InfoItem 
            icon={Trophy} 
            label="Índice Global" 
            value={displayIndice} 
          />

          <InfoItem 
            icon={User2} 
            label="Expediente" 
            value={user.id ? user.id.toString().slice(0, 8).toUpperCase() : "---"} 
            isUppercase 
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface IInfoItemProps {
  icon: LucideIcon;
  label: string;
  value: string | number | undefined | null;
  isLowercase?: boolean;
  isUppercase?: boolean;
}

function InfoItem({ icon: Icon, label, value, isLowercase, isUppercase }: IInfoItemProps) {
  return (
    <div className="space-y-2 group cursor-default">
      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest group-hover:text-[#d4a843] transition-colors">
        <Icon className="h-4 w-4" /> 
        {label}
      </div>
      <p className={`text-sm md:text-base font-bold text-[#1e3a5f] border-b border-gray-100 pb-2 transition-all group-hover:border-[#d4a843]/30 ${isLowercase ? 'lowercase' : isUppercase ? 'uppercase tracking-tighter' : ''}`}>
        {value || "---"}
      </p>
    </div>
  )
}