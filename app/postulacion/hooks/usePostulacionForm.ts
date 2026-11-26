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

function parsearPromedioSeguro(valor: string | number | null | undefined): string {
  if (valor !== undefined && valor !== null && String(valor).trim() !== "") {
    const num = parseFloat(String(valor).replace(",", "."));
    if (Number.isFinite(num) && num >= 0 && num <= 20) {
      return num.toFixed(2);
    }
  }
  return "0.00";
}

function obtenerPromedioTrimestralInicial(user: PostulacionUser): string {
  return parsearPromedioSeguro(user?.promedio_trimestre ?? user?.promedio_notas);
}

function obtenerIndiceGlobalInicial(user: PostulacionUser): string {
  return parsearPromedioSeguro(user?.indice_global);
}

export function usePostulacionForm({ user, trimestreActual }: UsePostulacionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [pasoActual, setPasoActual] = useState<number>(1);
  const [isPending, setIsPending] = useState<boolean>(false);

  // Separación estricta: promedio (trimestre anterior) e indiceGlobal (acumulado de carrera)
  const [promedio] = useState<string>(() => obtenerPromedioTrimestralInicial(user || {}));
  const [indiceGlobal] = useState<string>(() => obtenerIndiceGlobalInicial(user || {}));
  const [materiasValidas, setMateriasValidas] = useState<boolean>(true);
  const [detallesValidos, setDetallesValidos] = useState<boolean>(false);
  const [encuestaValida, setEncuestaValida] = useState<boolean>(true);
  const [archivosValidos, setArchivosValidos] = useState<boolean>(false);
  const [tipoBecaSeleccionada, setTipoBecaSeleccionada] = useState<string>(user?.tipo_beca || "");

  const [personalValido, setPersonalValido] = useState<boolean>(true);
  const [uniValido, setUniValido] = useState<boolean>(true);
  const [familiaValido, setFamiliaValido] = useState<boolean>(true);
  const [laboralValido, setLaboralValido] = useState<boolean>(true);
  const [ingresosValido, setIngresosValido] = useState<boolean>(true);
  const [hogarValido, setHogarValido] = useState<boolean>(true);
  const [saludValido, setSaludValido] = useState<boolean>(true);

  const [formData, setFormData] = useState<PostulacionUser>(user || {});
  const [activeEncuestaTab, setActiveEncuestaTab] = useState<string>("familia");

  const { toast } = useToast();
  const router = useRouter();

  const progreso = (pasoActual / TOTAL_PASOS) * 100;

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

  const handleSiguiente = useCallback(() => {
    syncFormData();

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
    pasoActual,
    isPending,
    promedio,
    indiceGlobal,
    materiasValidas,
    detallesValidos,
    encuestaValida,
    archivosValidos,
    tipoBecaSeleccionada,
    formData,
    activeEncuestaTab,
    progreso,
    personalValido,
    uniValido,
    familiaValido,
    laboralValido,
    ingresosValido,
    hogarValido,
    saludValido,
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
    handleSiguiente,
    handleAnterior,
    handleTrimestreChange,
    handleMateriasChange,
    handleSubmit,
  };
}