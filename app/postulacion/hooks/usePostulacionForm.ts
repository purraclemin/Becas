"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { enviarSolicitud } from "@/lib/ActionsSolicitud"
import type { PostulacionUser } from "../types"

export const TABS_ENCUESTA = ["personal", "uni", "familia", "laboral", "ingresos", "hogar", "salud"];
export const TOTAL_PASOS = 5;

export interface UsePostulacionFormProps {
  user: PostulacionUser;
  trimestreActual?: string | number;
}

export function usePostulacionForm({ user, trimestreActual }: UsePostulacionFormProps) {
  // Referencia React al formulario (Cero DOM nativo)
  const formRef = useRef<HTMLFormElement>(null);

  // Estados principales de navegación y UI
  const [pasoActual, setPasoActual] = useState<number>(1);
  const [isPending, setIsPending] = useState<boolean>(false);

  // Estados de valores y validaciones generales
  const [promedio, setPromedio] = useState<string>(user?.promedio_notas?.toString() || "0.00");
  const [materiasValidas, setMateriasValidas] = useState<boolean>(false);
  const [detallesValidos, setDetallesValidos] = useState<boolean>(false);
  const [encuestaValida, setEncuestaValida] = useState<boolean>(false);
  const [archivosValidos, setArchivosValidos] = useState<boolean>(false);
  const [tipoBecaSeleccionada, setTipoBecaSeleccionada] = useState<string>(user?.tipo_beca || "");

  // Estados individuales de validación para cada sub-pestaña de la Encuesta Socioeconómica
  const [personalValido, setPersonalValido] = useState<boolean>(false);
  const [uniValido, setUniValido] = useState<boolean>(true);
  const [familiaValido, setFamiliaValido] = useState<boolean>(true);
  const [laboralValido, setLaboralValido] = useState<boolean>(true);
  const [ingresosValido, setIngresosValido] = useState<boolean>(true);
  const [hogarValido, setHogarValido] = useState<boolean>(true);
  const [saludValido, setSaludValido] = useState<boolean>(true);

  // Estado maestro para la persistencia de datos y control de pestañas
  const [formData, setFormData] = useState<PostulacionUser>(user || {});
  const [activeEncuestaTab, setActiveEncuestaTab] = useState<string>("personal");

  const { toast } = useToast();
  const router = useRouter();

  const progreso = (pasoActual / TOTAL_PASOS) * 100;

  // Sincronización del formulario vía useRef al estado maestro
  const syncFormData = useCallback(() => {
    const form = formRef.current;
    if (form) {
      const formObj = new FormData(form);
      const data: PostulacionUser = { ...formData };
      formObj.forEach((value, key) => {
        if (typeof value === "string") {
          data[key] = value;
        }
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

    // Bloqueo de avance en Paso 4 (Documentación) si faltan archivos obligatorios
    if (pasoActual === 4 && !archivosValidos) {
      window.dispatchEvent(new CustomEvent('intentar-avanzar-archivos'));
      toast({
        variant: "destructive",
        title: "Documentación Incompleta",
        description: "Debe adjuntar todos los documentos obligatorios antes de continuar."
      });
      return;
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
    archivosValidos,
    syncFormData,
    toast
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
    const notasNumericas = notas.map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n >= 1 && n <= 20);
    setPromedio(notasNumericas.length > 0
      ? (notasNumericas.reduce((a, b) => a + b, 0) / notasNumericas.length).toFixed(2)
      : "0.00"
    );
  }, []);

  // Envío de la Postulación
  const handleSubmit = async () => {
    syncFormData();
    const form = formRef.current;
    if (!form) return;

    if (!archivosValidos) {
      toast({
        variant: "destructive",
        title: "Documentación Incompleta",
        description: "Verifique que todos los documentos requeridos estén adjuntados."
      });
      return;
    }

    const finalFormData = new FormData(form);
    finalFormData.set('promedio', promedio);
    finalFormData.set('trimestre_seleccionado', trimestreActual?.toString() || "");
    if (tipoBecaSeleccionada) finalFormData.set('tipo_beca', tipoBecaSeleccionada);
    if (user?.id !== undefined) finalFormData.set('user_id', String(user.id));

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
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Error de comunicación." });
    } finally {
      setIsPending(false);
    }
  };

  return {
    formRef,
    // Estados
    pasoActual,
    isPending,
    promedio,
    materiasValidas,
    detallesValidos,
    encuestaValida,
    archivosValidos,
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
    setArchivosValidos,
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