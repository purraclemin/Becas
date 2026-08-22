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
  
  // Estados de valores y validaciones generales
  const [promedio, setPromedio] = useState(user?.promedio_notas?.toString() || "0.00");
  const [materiasValidas, setMateriasValidas] = useState(false);
  const [detallesValidos, setDetallesValidos] = useState(false);
  const [encuestaValida, setEncuestaValida] = useState(false);
  const [tipoBecaSeleccionada, setTipoBecaSeleccionada] = useState<string>(user?.tipo_beca || "");

  // 🟢 Estados individuales de validación para cada sub-pestaña de la Encuesta Socioeconómica
  const [personalValido, setPersonalValido] = useState(false);
  const [uniValido, setUniValido] = useState(true);
  const [familiaValido, setFamiliaValido] = useState(true);
  const [laboralValido, setLaboralValido] = useState(true);
  const [ingresosValido, setIngresosValido] = useState(true);
  const [hogarValido, setHogarValido] = useState(true);
  const [saludValido, setSaludValido] = useState(true);
  
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

  // Lógica de Navegación Inteligente con feedback visual directo en los inputs
  const handleSiguiente = useCallback(() => {
    syncFormData();

    // Gestión de sub-pestañas en el Paso 3 (Estudio Social) con bloqueo y marcado visual
    if (pasoActual === 3) {
      if (activeEncuestaTab === "personal" && !personalValido) {
        window.dispatchEvent(new CustomEvent('intentar-avanzar-personal'));
        return;
      }
      if (activeEncuestaTab === "uni" && !uniValido) {
        window.dispatchEvent(new CustomEvent('intentar-avanzar-uni'));
        return;
      }
      if (activeEncuestaTab === "familia" && !familiaValido) {
        window.dispatchEvent(new CustomEvent('intentar-avanzar-familia'));
        return;
      }
      if (activeEncuestaTab === "laboral" && !laboralValido) {
        window.dispatchEvent(new CustomEvent('intentar-avanzar-laboral'));
        return;
      }
      if (activeEncuestaTab === "ingresos" && !ingresosValido) {
        window.dispatchEvent(new CustomEvent('intentar-avanzar-ingresos'));
        return;
      }
      if (activeEncuestaTab === "hogar" && !hogarValido) {
        window.dispatchEvent(new CustomEvent('intentar-avanzar-hogar'));
        return;
      }
      if (activeEncuestaTab === "salud" && !saludValido) {
        window.dispatchEvent(new CustomEvent('intentar-avanzar-salud'));
        return;
      }

      const currentIndex = TABS_ENCUESTA.indexOf(activeEncuestaTab);
      if (currentIndex < TABS_ENCUESTA.length - 1) {
        setActiveEncuestaTab(TABS_ENCUESTA[currentIndex + 1]);
        return;
      }
    }
    
    if (pasoActual < TOTAL_PASOS) setPasoActual(prev => prev + 1);
  }, [
    pasoActual, 
    activeEncuestaTab, 
    personalValido, 
    uniValido, 
    familiaValido, 
    laboralValido, 
    ingresosValido, 
    hogarValido, 
    saludValido, 
    syncFormData
  ]);

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

    // Estados de sub-pestañas
    personalValido,
    uniValido,
    familiaValido,
    laboralValido,
    ingresosValido,
    hogarValido,
    saludValido,

    // Setters
    setMateriasValidas,
    setDetallesValidos,
    setEncuestaValida,
    setTipoBecaSeleccionada,
    setActiveEncuestaTab,
    setPersonalValido,
    setUniValido,
    setFamiliaValido,
    setLaboralValido,
    setIngresosValido,
    setHogarValido,
    setSaludValido,

    // Actions
    handleSiguiente,
    handleAnterior,
    handleTrimestreChange,
    handleMateriasChange,
    handleSubmit,
  };
}