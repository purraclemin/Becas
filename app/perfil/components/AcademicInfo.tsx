import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Mail, IdCard, CalendarDays, BookOpen, Clock, User2, Trophy } from "lucide-react"

export function AcademicInfo({ user }: { user: any }) {
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
          <InfoItem icon={IdCard} label="Cédula" value={`V-${user.cedula}`} />
          
          <InfoItem icon={Mail} label="Correo" value={user.email} isLowercase />
          
          <InfoItem icon={BookOpen} label="Carrera" value={user.carrera} isUppercase />
          
          <InfoItem 
            icon={CalendarDays} 
            label="Nivel Académico" 
            value={`${user.trimestre}° Trimestre`} 
          />
          
          <InfoItem 
            icon={Clock} 
            label="Periodo Actual" 
            value={user.periodoActual} 
            isUppercase 
          />

          <InfoItem 
            icon={Trophy} 
            label="Índice Global" 
            value={user.indiceGlobal ? parseFloat(user.indiceGlobal).toFixed(2) : "0.00"} 
          />

          <InfoItem 
            icon={User2} 
            label="Expediente" 
            value={user.id?.slice(0, 8).toUpperCase()} 
            isUppercase 
          />
        </div>
      </CardContent>
    </Card>
  )
}

function InfoItem({ icon: Icon, label, value, isLowercase, isUppercase }: any) {
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