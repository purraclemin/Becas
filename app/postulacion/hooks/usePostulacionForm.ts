"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { enviarSolicitud } from "@/lib/ActionsSolicitud"
import type { PostulacionUser } from "../types"

export const TABS_ENCUESTA = ["familia", "laboral", "ingresos", "hogar", "salud"];
export const TOTAL_PASOS = 4;

export interface UsePostulacionFormProps {
  user: PostulacionUser;
  trimestreActual?: string | number;
}

function obtenerPromedioInicial(user: PostulacionUser): string {
  const candidata = user?.indice_global ?? user?.promedio_notas;
  if (candidata !== undefined && candidata !== null && String(candidata).trim() !== "") {
    const num = parseFloat(String(candidata).replace(",", "."));
    if (Number.isFinite(num) && num >= 0 && num <= 20) {
      return num.toFixed(2);
    }
  }
  return "0.00";
}

export function usePostulacionForm({ user, trimestreActual }: UsePostulacionFormProps) {
  // Referencia React al formulario (Cero DOM nativo)
  const formRef = useRef<HTMLFormElement>(null);

  // Estados principales de navegación y UI (4 pasos: Detalles, Estudio Social, Documentación, Resumen)
  const [pasoActual, setPasoActual] = useState<number>(1);
  const [isPending, setIsPending] = useState<boolean>(false);

  // Estados de valores y validaciones generales (anclado al Índice Global del estudiante)
  const [promedio] = useState<string>(() => obtenerPromedioInicial(user || {}));
  const [materiasValidas, setMateriasValidas] = useState<boolean>(true);
  const [detallesValidos, setDetallesValidos] = useState<boolean>(false);
  const [encuestaValida, setEncuestaValida] = useState<boolean>(true);
  const [archivosValidos, setArchivosValidos] = useState<boolean>(false);
  const [tipoBecaSeleccionada, setTipoBecaSeleccionada] = useState<string>(user?.tipo_beca || "");

  // Estados individuales de validación para cada sub-pestaña de la Encuesta Socioeconómica
  const [personalValido, setPersonalValido] = useState<boolean>(true);
  const [uniValido, setUniValido] = useState<boolean>(true);
  const [familiaValido, setFamiliaValido] = useState<boolean>(true);
  const [laboralValido, setLaboralValido] = useState<boolean>(true);
  const [ingresosValido, setIngresosValido] = useState<boolean>(true);
  const [hogarValido, setHogarValido] = useState<boolean>(true);
  const [saludValido, setSaludValido] = useState<boolean>(true);

  // Estado maestro para la persistencia de datos y control de pestañas (inicia en Familiar)
  const [formData, setFormData] = useState<PostulacionUser>(user || {});
  const [activeEncuestaTab, setActiveEncuestaTab] = useState<string>("familia");

  const { toast } = useToast();
  const router = useRouter();

  const progreso = (pasoActual / TOTAL_PASOS) * 100;

  // Sincronización del formulario vía useRef al estado maestro
  const syncFormData = useCallback((): PostulacionUser => {
    const form = formRef.current;
    const merged: PostulacionUser = { ...formData };
    if (form) {
      const formObj = new FormData(form);
      formObj.forEach((value, key) => {
        if (typeof value === "string") {
          merged[key] = value;
        }
      });
      setFormData(merged);
    }
    return merged;
  }, [formData]);

  // Lógica de Navegación Inteligente con feedback visual directo en los inputs
  const handleSiguiente = useCallback(() => {
    syncFormData();

    // Gestión de sub-pestañas en el Paso 2 (Estudio Social) con bloqueo y marcado visual
    if (pasoActual === 2) {
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
      if (currentIndex >= 0 && currentIndex < TABS_ENCUESTA.length - 1) {
        setActiveEncuestaTab(TABS_ENCUESTA[currentIndex + 1]);
        return;
      }
    }

    // Bloqueo de avance en Paso 3 (Documentación) si faltan archivos obligatorios
    if (pasoActual === 3 && !archivosValidos) {
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

    // Gestión de sub-pestañas en el Paso 2 (Estudio Social)
    if (pasoActual === 2) {
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

  const handleMateriasChange = useCallback((_notas: string[]) => {
    void _notas;
  }, []);

  // Envío de la Postulación
  const handleSubmit = async () => {
    const snapshotDatos = syncFormData();
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

    const finalFormData = new FormData();

    Object.entries(snapshotDatos).forEach(([key, val]) => {
      if (
        val !== undefined &&
        val !== null &&
        typeof val !== "object"
      ) {
        finalFormData.set(key, String(val));
      }
    });

    const liveFormData = new FormData(form);
    const arrayKeysVistos = new Set<string>();
    liveFormData.forEach((value, key) => {
      if (key.endsWith("[]")) {
        if (!arrayKeysVistos.has(key)) {
          arrayKeysVistos.add(key);
          finalFormData.delete(key);
          liveFormData.getAll(key).forEach((item) => {
            finalFormData.append(key, item);
          });
        }
      } else {
        finalFormData.set(key, value);
      }
    });

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