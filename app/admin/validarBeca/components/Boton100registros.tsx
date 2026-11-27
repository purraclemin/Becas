"use client"

import React, { useState, useCallback } from "react"
import {
  Database,
  Loader2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"
import {
  seedDatabase,
  cleanSeedData,
  obtenerEstadoLoteSeed,
  type EstadoLoteSeed
} from "@/lib/ActionsSeedData"

interface Boton100registrosProps {
  disabled?: boolean;
}

type AccionConfirmable = 'seed' | 'clean' | null;

interface ResultadoOperacion {
  tipo: 'success' | 'error';
  mensaje: string;
}

export function Boton100registros({ disabled = false }: Boton100registrosProps) {
  const [accionPendiente, setAccionPendiente] = useState<AccionConfirmable>(null);
  const [estadoLote, setEstadoLote] = useState<EstadoLoteSeed | null>(null);
  const [consultandoEstado, setConsultandoEstado] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);
  const [resultado, setResultado] = useState<ResultadoOperacion | null>(null);

  const abrirModalAccion = useCallback(async (accion: AccionConfirmable) => {
    if (!accion) return;
    setResultado(null);
    setAccionPendiente(accion);

    if (accion === 'seed') {
      setConsultandoEstado(true);
      try {
        const info = await obtenerEstadoLoteSeed();
        setEstadoLote(info);
      } catch {
        setEstadoLote(null);
      } finally {
        setConsultandoEstado(false);
      }
    }
  }, []);

  const ejecutarAccion = async () => {
    if (!accionPendiente || procesando) return;
    setProcesando(true);
    setResultado(null);

    try {
      const res =
        accionPendiente === 'seed' ? await seedDatabase() : await cleanSeedData();

      if (res.success) {
        setResultado({
          tipo: 'success',
          mensaje:
            res.message ||
            (accionPendiente === 'seed'
              ? 'Bloque de 100 estudiantes sincronizado correctamente.'
              : 'Registros de prueba eliminados correctamente.'),
        });
        if (accionPendiente === 'seed') {
          const actualizado = await obtenerEstadoLoteSeed().catch(() => null);
          if (actualizado) setEstadoLote(actualizado);
        } else {
          setEstadoLote(null);
        }
      } else {
        setResultado({
          tipo: 'error',
          mensaje: res.error || 'No se pudo completar la operación.',
        });
      }
    } catch {
      setResultado({
        tipo: 'error',
        mensaje: 'Ocurrió un error inesperado al comunicarse con el servidor.',
      });
    } finally {
      setProcesando(false);
    }
  };

  const cerrarModal = () => {
    if (procesando) return;
    const debeRecargar = resultado?.tipo === 'success';
    setAccionPendiente(null);
    setResultado(null);
    if (debeRecargar) {
      window.location.reload();
    }
  };

  const rangoTexto =
    estadoLote?.proximoRangoInicio && estadoLote?.proximoRangoFin
      ? `prueba${estadoLote.proximoRangoInicio}@unimar.edu.ve a prueba${estadoLote.proximoRangoFin}@unimar.edu.ve`
      : 'siguiente bloque de 100 (hasta prueba1000@unimar.edu.ve)';

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => void abrirModalAccion('seed')}
          disabled={disabled || procesando}
          className="h-12 w-12 md:h-9 md:w-9 rounded-xl border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
          title="Generar siguiente bloque de 100 estudiantes (prueba1..prueba1000@unimar.edu.ve | clave 123456)"
        >
          {procesando && accionPendiente === 'seed' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => void abrirModalAccion('clean')}
          disabled={disabled || procesando}
          className="h-12 w-12 md:h-9 md:w-9 rounded-xl border bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
          title="Limpiar los registros de prueba"
        >
          {procesando && accionPendiente === 'clean' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {accionPendiente && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#1e3a5f]/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-[#1e3a5f] px-5 py-3.5 border-b-2 border-[#d4a843] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {accionPendiente === 'seed' ? (
                  <Database className="h-4 w-4 text-[#d4a843] shrink-0" />
                ) : (
                  <Trash2 className="h-4 w-4 text-[#d4a843] shrink-0" />
                )}
                <h3 className="text-xs font-black text-white uppercase tracking-widest">
                  {accionPendiente === 'seed'
                    ? 'Generar Bloque de 100 (Meta: 1,000)'
                    : 'Limpiar Registros de Prueba'}
                </h3>
              </div>
              <button
                type="button"
                disabled={procesando}
                onClick={cerrarModal}
                className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-40"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {resultado ? (
                <div
                  className={`p-3.5 rounded-xl border text-sm md:text-xs font-bold flex items-start gap-2.5 ${
                    resultado.tipo === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {resultado.tipo === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <p className="leading-relaxed">{resultado.mensaje}</p>
                </div>
              ) : accionPendiente === 'seed' ? (
                consultandoEstado ? (
                  <div className="py-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin text-[#d4a843]" />
                    <span>Verificando progreso del lote de 1,000...</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-sm md:text-xs text-slate-600 leading-relaxed">
                    <div className="px-3 py-2 rounded-xl bg-[#f8fafc] border border-slate-200 flex items-center justify-between text-xs font-black text-[#1e3a5f]">
                      <span>Progreso actual:</span>
                      <span>
                        {estadoLote?.creadosActuales ?? 0} / {estadoLote?.totalEsperado ?? 1000}
                      </span>
                    </div>

                    <p className="font-bold text-[#1e3a5f]">
                      Siguiente bloque: <strong>{rangoTexto}</strong> (clave <strong>123456</strong>).
                    </p>

                    <ul className="list-disc pl-5 space-y-1 text-slate-600">
                      <li><strong>prueba1 a prueba20:</strong> sin solicitud ni estudio socioeconómico, listos para crear desde cero.</li>
                      <li><strong>Pendiente y Convocado:</strong> solo estudio socioeconómico del estudiante.</li>
                      <li><strong>En Revisión (máx. 20), Aprobada y Rechazada:</strong> ambos estudios (estudiante y administrador) sincronizados.</li>
                    </ul>
                  </div>
                )
              ) : (
                <p className="text-sm md:text-xs text-slate-600 leading-relaxed">
                  Se eliminarán todos los registros de prueba (<strong>prueba1..prueba1000@unimar.edu.ve</strong> y lotes anteriores) junto con sus récords académicos, solicitudes, historial y estudios socioeconómicos.
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                {resultado ? (
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="h-12 md:h-9 px-5 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-sm md:text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Aceptar
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={cerrarModal}
                      className="h-12 md:h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm md:text-xs font-bold uppercase cursor-pointer disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    {!estadoLote?.completado && (
                      <button
                        type="button"
                        disabled={procesando || consultandoEstado}
                        onClick={() => void ejecutarAccion()}
                        className={`h-12 md:h-9 px-5 rounded-lg text-sm md:text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                          accionPendiente === 'seed'
                            ? 'bg-[#d4a843] hover:bg-[#c2973b] text-[#1e3a5f]'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                      >
                        {procesando ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Procesando...</span>
                          </>
                        ) : accionPendiente === 'seed' ? (
                          <span>Crear Bloque de 100</span>
                        ) : (
                          <span>Eliminar Lote</span>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}