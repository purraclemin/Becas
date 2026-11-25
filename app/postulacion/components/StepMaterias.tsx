"use client"

import React, { useEffect, useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { BookOpen, AlertCircle, Lock, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MateriaGuardada, MateriaPensum, PostulacionUser } from "../types"

const REGEX_NOTA_VALIDA = /^\d{1,2}(\.\d{1,2})?$/;

export function StepMaterias({
  disabled,
  materiasDelPensum = [],
  trimestreActual,
  onChangeNotas,
  materiasGuardadas = [],
  user,
  onValidationChange
}: {
  disabled: boolean;
  materiasDelPensum?: MateriaPensum[];
  trimestreActual: string;
  onChangeTrimestre: (trimestre: string) => void;
  onChangeNotas: (notas: string[]) => void;
  materiasGuardadas?: MateriaGuardada[];
  user?: PostulacionUser;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const [notas, setNotas] = useState<string[]>([]);
  const [errores, setErrores] = useState<number[]>([]);

  const onValidationChangeRef = useRef(onValidationChange);
  const onChangeNotasRef = useRef(onChangeNotas);
  const lastValidationRef = useRef<boolean | null>(null);
  const [lastMateriasIds, setLastMateriasIds] = useState<string>("");

  const esPrimerTrimestre = Number(user?.semestre ?? trimestreActual) === 1;

  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
    onChangeNotasRef.current = onChangeNotas;
  }, [onValidationChange, onChangeNotas]);

  useEffect(() => {
    const currentIds = materiasDelPensum
      .map((m, idx) => String(m.id ?? m.codigo_materia ?? m.codigo ?? idx))
      .join(",");

    if (currentIds !== lastMateriasIds) {
      if (materiasDelPensum.length === 0) {
        setNotas([]);
        setErrores([]);
        if (onChangeNotasRef.current) onChangeNotasRef.current([]);
        setLastMateriasIds(currentIds);
        return;
      }

      const notasPrecargadas = materiasDelPensum.map((m) => {
        const materiaConNota = m as MateriaPensum & { nota?: number | string };
        const codigoMateria = m.codigo_materia || m.codigo;
        const guardada = materiasGuardadas.find(
          (mg) =>
            (m.id !== undefined && mg.materia_id === m.id) ||
            (codigoMateria !== undefined && mg.codigo === codigoMateria)
        );

        const fuenteNota =
          materiaConNota.nota !== undefined && materiaConNota.nota !== null
            ? materiaConNota.nota
            : guardada?.nota;

        if (fuenteNota !== undefined && fuenteNota !== null && String(fuenteNota).trim() !== "") {
          const num = parseFloat(String(fuenteNota).replace(",", "."));
          if (Number.isFinite(num) && num >= 0 && num <= 20) {
            return num.toFixed(2);
          }
        }
        return "0.00";
      });

      setNotas(notasPrecargadas);
      if (onChangeNotasRef.current) onChangeNotasRef.current(notasPrecargadas);
      setLastMateriasIds(currentIds);
    }
  }, [materiasDelPensum, materiasGuardadas, lastMateriasIds]);

  useEffect(() => {
    // Estudiante de 1er trimestre sin materias precargadas: habilitado para avanzar
    if (materiasDelPensum.length === 0) {
      setErrores([]);
      const esValidoSinMaterias = esPrimerTrimestre;
      if (lastValidationRef.current !== esValidoSinMaterias) {
        lastValidationRef.current = esValidoSinMaterias;
        if (onValidationChangeRef.current) {
          onValidationChangeRef.current(esValidoSinMaterias);
        }
      }
      return;
    }

    if (notas.length === 0) return;

    const newErrores: number[] = [];

    notas.forEach((nota, index) => {
      const num = parseFloat(nota);
      if (
        nota.trim() === "" ||
        !REGEX_NOTA_VALIDA.test(nota) ||
        !Number.isFinite(num) ||
        num < 0 ||
        num > 20
      ) {
        newErrores.push(index);
      }
    });

    setErrores(newErrores);

    const allFilled =
      notas.length === materiasDelPensum.length &&
      notas.every((n) => n.trim() !== "");
    const isValid = allFilled && newErrores.length === 0;

    if (lastValidationRef.current !== isValid) {
      lastValidationRef.current = isValid;
      if (onValidationChangeRef.current) {
        onValidationChangeRef.current(isValid);
      }
    }
  }, [notas, materiasDelPensum.length, esPrimerTrimestre]);

  return (
    <div className="space-y-3 animate-in fade-in duration-500 h-full flex flex-col pb-4 lg:pb-0">
      {/* 1. Sincronización de Trimestre (Solo lectura) */}
      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[#1e3a5f] flex items-center justify-center shadow-sm shrink-0">
            <BookOpen className="h-3.5 w-3.5 text-[#d4a843]" />
          </div>
          <div>
            <h4 className="text-[#1e3a5f] font-black text-[10px] uppercase tracking-tight leading-none">
              Periodo Académico
            </h4>
            <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-0.5 leading-none">
              {materiasDelPensum.length > 0
                ? "Calificaciones oficiales precargadas (Solo lectura)"
                : "Nivel académico institucional"}
            </p>
          </div>
        </div>

        <Input
          readOnly
          disabled={disabled}
          value={`TRIMESTRE ${trimestreActual}`}
          className="w-full sm:w-[160px] h-12 lg:h-9 rounded-lg border-slate-200 font-black text-sm lg:text-xs text-[#1e3a5f] bg-slate-200/50 shadow-inner text-center cursor-not-allowed"
        />
        <input type="hidden" name="trimestre_seleccionado" value={trimestreActual} />
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between px-1 mb-2 shrink-0">
          <Label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">
            Unidades Curriculares Precargadas
          </Label>
          <div className="flex items-center gap-1.5 text-[7px] font-bold text-[#1e3a5f] bg-[#d4a843]/10 px-2 py-0.5 rounded-full border border-[#d4a843]/20 leading-none">
            <Lock className="h-2.5 w-2.5 text-[#d4a843]" />
            Récord académico oficial (Escala 01 a 20)
          </div>
        </div>

        {errores.length > 0 && (
          <div className="bg-red-50 text-red-600 p-2 rounded-lg border border-red-200 flex items-center gap-2 text-[9px] font-bold mb-2 shrink-0 leading-none">
            <AlertCircle className="h-3 w-3 shrink-0" />
            Se detectó una inconsistencia en el récord académico precargado. Contacte a Control de Estudios.
          </div>
        )}

        {/* Cuadrícula en modo de solo lectura */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto pr-1 pb-2 custom-scrollbar">
          {materiasDelPensum.length > 0 ? (
            materiasDelPensum.map((materia, index) => {
              const tieneError = errores.includes(index);
              const codigoFinal = materia.codigo_materia || materia.codigo || "";
              const nombreFinal = materia.nombre_materia || materia.nombre || "";
              const notaMostrar = notas[index] ?? "0.00";
              const notaNumerica = parseFloat(notaMostrar);
              const esReprobada = Number.isFinite(notaNumerica) && notaNumerica < 10;

              return (
                <div
                  key={`materia-row-${materia.id ?? (codigoFinal || index)}`}
                  className={cn(
                    "group flex flex-row items-center justify-between p-2.5 bg-white border rounded-xl transition-all duration-300 shadow-sm",
                    tieneError || esReprobada
                      ? "border-red-300 bg-red-50/30"
                      : "border-slate-100 hover:border-[#1e3a5f]/20"
                  )}
                >
                  <input type="hidden" name="materias_codigos[]" value={codigoFinal} />
                  <input type="hidden" name="materias_nombres[]" value={nombreFinal} />
                  <input type="hidden" name="materias_notas[]" value={notaMostrar} />

                  <div className="flex flex-col flex-1 min-w-0 mr-3">
                    <span className="text-[7px] font-black text-[#d4a843] uppercase tracking-widest leading-none mb-1 truncate">
                      {codigoFinal}
                    </span>
                    <span className="text-sm lg:text-xs font-bold text-[#1e3a5f] uppercase leading-tight line-clamp-1">
                      {nombreFinal}
                    </span>
                  </div>

                  <div className="relative flex flex-col items-end shrink-0">
                    <Input
                      id={`nota-${index}`}
                      type="text"
                      readOnly
                      aria-readonly="true"
                      disabled={disabled}
                      value={notaMostrar}
                      className={cn(
                        "w-16 h-12 lg:h-9 text-center font-black text-sm lg:text-xs rounded-lg cursor-not-allowed select-none",
                        tieneError || esReprobada
                          ? "border-red-400 text-red-700 bg-red-100/80"
                          : "border-slate-200 bg-slate-100 text-[#1e3a5f]"
                      )}
                    />
                  </div>
                </div>
              );
            })
          ) : esPrimerTrimestre ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 px-4 bg-white border-2 border-dashed border-slate-200 rounded-xl text-center">
              <GraduationCap className="h-6 w-6 text-[#d4a843] mb-2" />
              <p className="text-[#1e3a5f] text-xs font-black uppercase tracking-wider">
                Estudiante de 1er Trimestre (Nuevo Ingreso)
              </p>
              <p className="text-slate-500 text-[10px] font-medium mt-1 max-w-md">
                No posee materias previas precargadas en UNIMAR. Puede continuar con su postulación y adjuntar sus recaudos correspondientes.
              </p>
            </div>
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-6 bg-white border-2 border-dashed border-slate-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-slate-300 mb-2" />
              <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">
                No hay materias sugeridas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}