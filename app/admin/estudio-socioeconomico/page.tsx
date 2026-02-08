"use client"

import React, { useState } from "react"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { buscarEstudianteConEstudio, guardarOActualizarEstudio, borrarEstudio } from "@/lib/ActionsSocioeconomico"
import { ResultCard } from "@/components/socioeconomico/ResultCard"
import { StepForm } from "@/components/socioeconomico/StepForm"
import { SocioHeader } from "@/components/socioeconomico/SocioHeader"
import { StudentIdentity } from "@/components/socioeconomico/StudentIdentity"

export default function EstudioSocioeconomicoPage() {
  const [loading, setLoading] = useState(false)
  const [cedulaBusqueda, setCedulaBusqueda] = useState("")
  const [student, setStudent] = useState<any>(null)
  const [pasoActual, setPasoActual] = useState(1)
  const [mostrarResultado, setMostrarResultado] = useState(false)
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success' | 'error'} | null>(null)
  
  const [formData, setFormData] = useState<any>({
    tipo_vivienda: "", tenencia_vivienda: "", numero_habitaciones: "", material_vivienda: "",
    num_personas_hogar: "", num_personas_trabajan: "", dependencia_economica: "", carga_familiar_discapacidad: "",
    ingreso_mensual_familiar: "", egreso_mensual_aproximado: "", empleo_jefe_hogar: "", ayuda_otros_familiares: "",
    acceso_internet: "", equipo_computacion: "", servicio_agua_luz: "", transporte_universidad: "", 
    gastos_medicos_mensuales: "", pago_alquiler_residencia: "", hermanos_estudiando: "", beca_otra_institucion: ""
  })

  const labels: any = { /* ... tus labels se mantienen igual ... */ }

  const notify = (msg: string, tipo: 'success' | 'error' = 'error') => {
    setNotificacion({ msg, tipo });
    setTimeout(() => setNotificacion(null), 4000);
  };

  const handleSearch = async () => {
    if(!cedulaBusqueda) return notify("Ingrese una cédula");
    setLoading(true);
    const res = await buscarEstudianteConEstudio(cedulaBusqueda);
    if (res) {
      setStudent(res);
      if (res.respuestas_json) {
        setFormData(JSON.parse(res.respuestas_json));
        setMostrarResultado(true);
      } else {
        setMostrarResultado(false);
        setPasoActual(1);
      }
    } else notify("Estudiante no encontrado");
    setLoading(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    // La acción ahora incluye el cambio automático a "En Revisión"
    const res = await guardarOActualizarEstudio({ ...formData, student_id: student.id });
    if (res.success) {
      notify("Estudio guardado. Estatus actualizado a 'En Revisión'", "success");
      await handleSearch(); 
    } else notify("Error al guardar");
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc]">
      {notificacion && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${notificacion.tipo === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {notificacion.tipo === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="text-xs font-black uppercase tracking-widest">{notificacion.msg}</p>
        </div>
      )}

      <SocioHeader />

      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8 pb-20">
        <StudentIdentity 
          student={student} loading={loading} 
          cedulaBusqueda={cedulaBusqueda} setCedulaBusqueda={setCedulaBusqueda}
          handleSearch={handleSearch} mostrarResultado={mostrarResultado}
          setMostrarResultado={setMostrarResultado} setPasoActual={setPasoActual}
          borrarEstudio={borrarEstudio} setStudent={setStudent}
        />

        {student && (
          <div className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            {mostrarResultado ? (
              <ResultCard student={student} formData={formData} labels={labels} />
            ) : (
              <StepForm 
                pasoActual={pasoActual} setPasoActual={setPasoActual} 
                handleNext={(e:any) => { e.preventDefault(); setPasoActual((p:number) => p + 1); }} 
                handleSubmit={handleSubmit} loading={loading} 
                formData={formData} setFormData={setFormData} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}