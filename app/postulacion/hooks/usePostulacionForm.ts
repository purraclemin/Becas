"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { enviarSolicitud } from "@/lib/ActionsSolicitud"

export const TABS_ENCUESTA = ["personal", "uni", "familia", "laboral", "ingresos", "hogar", "salud"];
export const TOTAL_PASOS = 5;

export interface UsePostulacionFormProps {
  user: any;
  trimestreActual?: any;
}

export function usePostulacionForm({ user, trimestreActual }: UsePostulacionFormProps) {
  // Estados principales de navegación y UI
  const [pasoActual, setPasoActual] = useState(1);
  const [isPending, setIsPending] = useState(false);
  
  // Estados de valores y validaciones
  const [promedio, setPromedio] = useState(user?.promedio_notas?.toString() || "0.00");
  const [materiasValidas, setMateriasValidas] = useState(false);
  const [detallesValidos, setDetallesValidos] = useState(false);
  const [encuestaValida, setEncuestaValida] = useState(false);
  const [tipoBecaSeleccionada, setTipoBecaSeleccionada] = useState<string>(user?.tipo_beca || "");
  
  // Estado maestro para la persistencia de datos y control de pestañas
  const [formData, setFormData] = useState<any>(user || {});
  const [activeEncuestaTab, setActiveEncuestaTab] = useState("personal");

  const { toast } = useToast();
  const router = useRouter();
  
  const progreso = (pasoActual / TOTAL_PASOS) * 100;

  // Sincronización del DOM al estado maestro
  const syncFormData = useCallback(() => {
    const form = document.getElementById("form-postulacion") as HTMLFormElement;
    if (form) {
      const formObj = new FormData(form);
      const data: any = { ...formData };
      formObj.forEach((value, key) => {
        data[key] = value;
      });
      setFormData(data);
    }
  }, [formData]);

  // Lógica de Navegación Inteligente
  const handleSiguiente = useCallback(() => {
    syncFormData();

    // Gestión de sub-pestañas en el Paso 3 (Estudio Social)
    if (pasoActual === 3) {
      const currentIndex = TABS_ENCUESTA.indexOf(activeEncuestaTab);
      if (currentIndex < TABS_ENCUESTA.length - 1) {
        setActiveEncuestaTab(TABS_ENCUESTA[currentIndex + 1]);
        return;
      }
    }
    
    if (pasoActual < TOTAL_PASOS) setPasoActual(prev => prev + 1);
  }, [pasoActual, activeEncuestaTab, syncFormData]);

  const handleAnterior = useCallback(() => {
    syncFormData();

    // Gestión de sub-pestañas en el Paso 3 (Estudio Social)
    if (pasoActual === 3) {
      const currentIndex = TABS_ENCUESTA.indexOf(activeEncuestaTab);
      if (currentIndex > 0) {
        setActiveEncuestaTab(TABS_ENCUESTA[currentIndex - 1]);
        return;
      }
    }

    if (pasoActual > 1) setPasoActual(prev => prev - 1);
  }, [pasoActual, activeEncuestaTab, syncFormData]);

  const handleTrimestreChange = useCallback((trimestre: string) => {
    router.push(`/postulacion?trimestre=${trimestre}`, { scroll: false });
  }, [router]);

  const handleMateriasChange = useCallback((notas: string[]) => {
    const notasNumericas = notas.map(n => parseFloat(n)).filter(n => !isNaN(n));
    setPromedio(notasNumericas.length > 0 
      ? (notasNumericas.reduce((a, b) => a + b, 0) / notasNumericas.length).toFixed(2) 
      : "0.00"
    );
  }, []);

  // Envío de la Postulación
  const handleSubmit = async () => {
    syncFormData();
    const form = document.getElementById("form-postulacion") as HTMLFormElement;
    if (!form) return;

    const finalFormData = new FormData(form);
    finalFormData.set('promedio', promedio);
    finalFormData.set('trimestre_seleccionado', trimestreActual?.toString() || "");
    if (tipoBecaSeleccionada) finalFormData.set('tipo_beca', tipoBecaSeleccionada);
    if (user?.id) finalFormData.append('user_id', user.id);

    setIsPending(true);

    try {
      const result = await enviarSolicitud(finalFormData);
      if (result?.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        toast({ title: "Éxito", description: "Postulación enviada correctamente." });
        router.refresh();
        router.push("/perfil");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Error de comunicación." });
    } finally {
      setIsPending(false);
    }
  };

  return {
    // Estados
    pasoActual,
    isPending,
    promedio,
    materiasValidas,
    detallesValidos,
    encuestaValida,
    tipoBecaSeleccionada,
    formData,
    activeEncuestaTab,
    progreso,

    // Setters
    setMateriasValidas,
    setDetallesValidos,
    setEncuestaValida,
    setTipoBecaSeleccionada,
    setActiveEncuestaTab,

    // Actions
    handleSiguiente,
    handleAnterior,
    handleTrimestreChange,
    handleMateriasChange,
    handleSubmit,
  };
}