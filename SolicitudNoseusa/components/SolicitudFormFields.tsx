"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { enviarSolicitud } from "@/lib/ActionsSolicitud"
import { useToast } from "@/hooks/use-toast"
import { SolicitudArchivos } from "./SolicitudArchivos"
import { SolicitudMaterias } from "./SolicitudMaterias"
import { SolicitudEncuesta } from "./SolicitudEncuesta"
import { DetallesBeca } from "./DetallesBeca" 
import { SolicitudBanners } from "./SolicitudBanners"
import { SolicitudEmailField } from "./SolicitudEmailField"
import { SeccionFormulario } from "./EncuestaUI"
import { ClipboardList, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

// Importamos los módulos de apoyo
import { SolicitudFormWelcome } from "./SolicitudFormFieldsWelcome"
import { SolicitudPromedioAlert, SolicitudEditButton } from "./SolicitudFormFieldsAlerts"

/**
 * 🛠️ TYPE GUARD: Verifica si un elemento es un control de formulario válido.
 */
function isFormControl(el: unknown): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement;
}

export function SolicitudForm({ 
  user, 
  materiasDelPensum, 
  trimestreActual 
}: { 
  user: any, 
  materiasDelPensum?: any[], 
  trimestreActual?: any 
}) {
  const [isPending, setIsPending] = useState(false)
  const [promedio, setPromedio] = useState(user?.promedio_notas?.toString() || "0.00")
  const [isClient, setIsClient] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const estatus = user?.estatus || 'ninguna';
  const esPendiente = estatus === 'Pendiente';
  const [hasStarted, setHasStarted] = useState(esPendiente);

  useEffect(() => { setIsClient(true) }, [])
  
  const estaBloqueadoTotalmente = estatus === 'En Revisión' || estatus === 'Aprobada';
  const isFormDisabled = estaBloqueadoTotalmente || (esPendiente && !isEditing);
  const esPromedioBajo = parseFloat(promedio) < 16 && parseFloat(promedio) > 0;

  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(esPendiente ? "full" : "materias")

  const { toast } = useToast()
  const router = useRouter()

  const handleTrimestreChange = (trimestre: string) => {
    router.push(`/Solicitud?trimestre=${trimestre}`, { scroll: false });
  };

  /**
   * 🟢 LÓGICA DE SCROLL PARA SECCIONES PRINCIPALES
   */
  const toggleSeccion = (seccion: string) => {
    if (esPendiente && !isEditing) return;
    
    const nuevaSeccion = seccionAbierta === seccion ? null : seccion;
    setSeccionAbierta(nuevaSeccion);

    if (nuevaSeccion) {
      setTimeout(() => {
        const element = document.getElementById(`main-section-${seccion}`);
        if (element) {
          const offsetTop = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: offsetTop - 20, 
            behavior: "smooth"
          });
        }
      }, 150);
    }
  }

  const handleMateriasChange = useCallback((notas: string[]) => {
    const notasNumericas = notas.map(n => parseFloat(n)).filter(n => !isNaN(n));
    setPromedio(notasNumericas.length > 0 
      ? (notasNumericas.reduce((a, b) => a + b, 0) / notasNumericas.length).toFixed(2) 
      : "0.00");
  }, []);

  /**
   * 🟢 VALIDACIÓN SELECCIONADA Y CORRECCIÓN DE CAMPOS OBLIGATORIOS
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    const form = e.currentTarget;
    
    // Capturamos todos los elementos requeridos (incluyendo los hidden de Shadcn Select)
    const elements = Array.from(form.querySelectorAll('input[required], textarea[required], select[required], input[type="hidden"][required]'));
    
    // Filtramos para ignorar los de la encuesta socioeconómica en esta validación inicial
    const inputsParaValidar = elements.filter((el): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement => {
      if (!isFormControl(el)) return false;
      const prefijosEncuesta = ['socio_', 'familia_', 'vivienda_', 'monto_', 'padre_', 'madre_', 'salud_'];
      return !prefijosEncuesta.some(prefijo => el.name.startsWith(prefijo));
    });

    console.log("🔍 --- INICIANDO REVISIÓN DE FORMULARIO ---");
    let primerCampoInvalido: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null = null;

    // Limpiar marcas rojas previas
    inputsParaValidar.forEach((el) => {
      const parent = el.closest('.space-y-2') || el.parentElement;
      if (parent) parent.classList.remove('animate-shake');
      el.classList.remove('border-red-500', 'bg-red-50', 'ring-1', 'ring-red-200');
      
      const trigger = el.parentElement?.querySelector('button[role="combobox"]');
      if (trigger) trigger.classList.remove('border-red-500', 'bg-red-50', 'ring-1', 'ring-red-200');
    });

    // Validar valores e imprimir logs
    for (const el of inputsParaValidar) {
      const value = el.value?.trim();
      const isDetalleBeca = el.closest('#main-section-detalles-beca');
      
      if (isDetalleBeca) {
        console.log(`[LOG DETALLES BECA] Campo: ${el.name} | Valor capturado: "${value}"`);
      }

      // Corrección crítica: Considerar "undefined" o vacío como inválido
      if (!value || value === "" || value === "undefined") {
        console.warn(`[VALIDACIÓN] Campo faltante detectado: ${el.name}`);
        if (!primerCampoInvalido) primerCampoInvalido = el;
        
        el.classList.add('border-red-500', 'bg-red-50', 'ring-1', 'ring-red-200');

        const trigger = el.parentElement?.querySelector('button[role="combobox"]');
        if (trigger) trigger.classList.add('border-red-500', 'bg-red-50', 'ring-1', 'ring-red-200');
      }
    }

    if (primerCampoInvalido) {
      console.error("❌ VALIDACIÓN FALLIDA: Deteniendo envío por campos incompletos.");
      const esDeMaterias = primerCampoInvalido.closest('#main-section-materias');
      const esDeDetalles = primerCampoInvalido.closest('#main-section-detalles-beca');

      if (esDeMaterias) setSeccionAbierta("materias");
      else if (esDeDetalles) setSeccionAbierta("detalles-beca");

      toast({
        variant: "destructive",
        title: "Información Incompleta",
        description: "Existen campos vacíos en la sección de beneficios o materias. Revise las marcas en rojo.",
      });

      setTimeout(() => {
        if (primerCampoInvalido) {
          const rect = primerCampoInvalido.getBoundingClientRect();
          window.scrollTo({
            top: rect.top + window.pageYOffset - 150,
            behavior: "smooth"
          });

          const targetToFocus = (primerCampoInvalido instanceof HTMLInputElement && primerCampoInvalido.type === 'hidden') 
            ? (primerCampoInvalido.parentElement?.querySelector('button[role="combobox"]') as HTMLElement)
            : primerCampoInvalido;
          
          if (targetToFocus) targetToFocus.focus();
        }
      }, 300);
      return;
    }

    console.log("✅ VALIDACIÓN EXITOSA. Enviando al servidor...");
    setIsPending(true);
    const formData = new FormData(form);
    formData.set('promedio', promedio); 
    formData.set('trimestre_seleccionado', trimestreActual?.toString() || "");
    if (user?.id) formData.append('user_id', user.id);

    try {
      const result = await enviarSolicitud(formData);
      if (result?.error) {
        console.error("❌ ERROR DEL SERVIDOR:", result.error);
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        toast({ title: "Éxito", description: "Solicitud enviada correctamente." });
        setIsEditing(false);
        router.refresh();
        router.push("/perfil"); 
      }
    } catch (error) {
      console.error("❌ ERROR DE RED:", error);
      toast({ variant: "destructive", title: "Error", description: "Error de comunicación con el servidor." });
    } finally {
      setIsPending(false);
    }
  }

  if (isClient && !hasStarted) {
    return <SolicitudFormWelcome onStart={() => setHasStarted(true)} />;
  }

  return (
    <>
      <SolicitudBanners estatus={estatus} />

      <SolicitudEditButton 
        isPending={esPendiente} 
        isEditing={isEditing} 
        onEdit={() => setIsEditing(true)} 
      />

      <form onSubmit={handleSubmit} noValidate className={`space-y-8 relative animate-in fade-in slide-in-from-top-4 duration-700 ${estaBloqueadoTotalmente ? "opacity-75 pointer-events-none" : ""}`}>
        
        <SolicitudEmailField user={user} />
        
        <div className="w-full space-y-6">
            <div id="main-section-materias">
                <SolicitudMaterias 
                    disabled={isFormDisabled} 
                    materiasGuardadas={user?.materias_registradas} 
                    materiasDelPensum={materiasDelPensum} 
                    onChangeTrimestre={handleTrimestreChange}
                    trimestreActual={trimestreActual}
                    onChangeNotas={handleMateriasChange} 
                    isOpen={seccionAbierta === "materias" || esPendiente}
                    onToggle={() => toggleSeccion("materias")}
                />
            </div>

            <div id="main-section-detalles-beca">
                <DetallesBeca 
                    disabled={isFormDisabled} 
                    promedio={promedio} 
                    user={user} 
                    isOpen={seccionAbierta === "detalles-beca" || esPendiente} 
                    onToggle={() => toggleSeccion("detalles-beca")}
                />
            </div>

            <div id="main-section-encuesta">
              <SeccionFormulario
                  titulo="3. Investigación Socioeconómica"
                  icono={ClipboardList}
                  iconoBg="bg-[#1e3a5f]" 
                  iconoColor="text-[#d4a843]"
                  estaAbierto={seccionAbierta === "encuesta" || esPendiente}
                  alAlternar={() => toggleSeccion("encuesta")}
              >
                  <SolicitudEncuesta disabled={isFormDisabled} user={user} />
              </SeccionFormulario>
            </div>

            <SolicitudArchivos disabled={isFormDisabled} user={user} />
        </div>

        <div className="sticky bottom-6 z-30 space-y-4">
            <SolicitudPromedioAlert isVisible={isClient && esPromedioBajo} />

            <Button 
                type="submit" 
                disabled={isPending || isFormDisabled} 
                className={`w-full py-9 rounded-[1.5rem] transition-all duration-300 transform active:scale-[0.98] font-black uppercase tracking-[0.2em] text-[11px] border-b-4 ${
                isFormDisabled 
                    ? "bg-slate-100 text-slate-300 border-slate-200 shadow-none" 
                    : "bg-[#1e3a5f] text-[#d4a843] shadow-[0_20px_50px_rgba(30,58,95,0.3)] hover:bg-[#254674] border-[#d4a843]"
                }`}
            >
                {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className={`mr-2 h-5 w-5 ${isFormDisabled ? "text-slate-200" : ""}`} />}
                {isPending ? "Procesando..." : isFormDisabled ? "Solicitud Protegida" : esPendiente ? "Actualizar Registro" : "Enviar Postulación"}
            </Button>
        </div>
      </form>
    </>
  )
}