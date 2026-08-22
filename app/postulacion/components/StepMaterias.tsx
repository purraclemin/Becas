"use client"

import React, { useEffect, useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { BookOpen, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface Materia {
  id: string;
  nombre?: string;
  codigo?: string;
  nombre_materia?: string; 
  codigo_materia?: string; 
}

export function StepMaterias({
  disabled,
  materiasDelPensum = [],
  trimestreActual,
  onChangeNotas,
  materiasGuardadas = [],
  onValidationChange
}: {
  disabled: boolean;
  materiasDelPensum?: Materia[];
  trimestreActual: string;
  onChangeTrimestre: (trimestre: string) => void;
  onChangeNotas: (notas: string[]) => void;
  materiasGuardadas?: any[];
  user?: any;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const [notas, setNotas] = useState<string[]>([]);
  const [errores, setErrores] = useState<number[]>([]);
  
  const onValidationChangeRef = useRef(onValidationChange);
  const onChangeNotasRef = useRef(onChangeNotas);
  const lastValidationRef = useRef<boolean | null>(null);
  const [lastMateriasIds, setLastMateriasIds] = useState<string>("");

  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
    onChangeNotasRef.current = onChangeNotas;
  }, [onValidationChange, onChangeNotas]);

  useEffect(() => {
    const currentIds = materiasDelPensum.map(m => m.id).join(',');
    
    if (materiasDelPensum.length > 0 && currentIds !== lastMateriasIds) {
      const notasIniciales = materiasDelPensum.map(m => {
        const guardada = materiasGuardadas.find(mg => mg.materia_id === m.id);
        return guardada ? guardada.nota?.toString() : "";
      });
      
      setNotas(notasIniciales);
      if (onChangeNotasRef.current) onChangeNotasRef.current(notasIniciales);
      setLastMateriasIds(currentIds);
    }
  }, [materiasDelPensum, materiasGuardadas, lastMateriasIds]);

  useEffect(() => {
    if (notas.length === 0 && materiasDelPensum.length > 0) return;

    let hasZero = false;
    let newErrores: number[] = [];

    notas.forEach((nota, index) => {
      if (nota === "0" || nota === "00") {
        hasZero = true;
        newErrores.push(index);
      }
    });

    setErrores(newErrores);

    const allFilled = notas.length === materiasDelPensum.length && notas.every(n => n.trim() !== "");
    const isValid = allFilled && !hasZero;
    
    if (lastValidationRef.current !== isValid) {
      lastValidationRef.current = isValid;
      if (onValidationChangeRef.current) {
        onValidationChangeRef.current(isValid);
      }
    }
  }, [notas, materiasDelPensum.length]);

  const handleNotaChange = (index: number, valor: string) => {
    const num = parseFloat(valor);
    if (valor !== "" && (isNaN(num) || num < 0 || num > 20)) return;

    const nuevasNotas = [...notas];
    nuevasNotas[index] = valor;
    
    setNotas(nuevasNotas);
    if (onChangeNotasRef.current) onChangeNotasRef.current(nuevasNotas);
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500 h-full flex flex-col pb-4 lg:pb-0">

      {/* 1. Sincronización de Trimestre (Compacto) */}
      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[#1e3a5f] flex items-center justify-center shadow-sm shrink-0">
            <BookOpen className="h-3.5 w-3.5 text-[#d4a843]" />
          </div>
          <div>
            <h4 className="text-[#1e3a5f] font-black text-[10px] uppercase tracking-tight leading-none">Periodo Académico</h4>
            <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-0.5 leading-none">Trimestre activo asignado</p>
          </div>
        </div>

        <Input 
          readOnly
          disabled={disabled} 
          value={`TRIMESTRE ${trimestreActual}`} 
          className="w-full sm:w-[160px] h-8 rounded-lg border-slate-200 font-black text-[10px] text-[#1e3a5f] bg-slate-200/50 shadow-inner text-center cursor-not-allowed"
        />
        <input type="hidden" name="trimestre_seleccionado" value={trimestreActual} />
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between px-1 mb-2 shrink-0">
          <Label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">
            Unidades Curriculares
          </Label>
          <div className="flex items-center gap-1.5 text-[7px] font-bold text-[#1e3a5f] bg-[#d4a843]/10 px-2 py-0.5 rounded-full border border-[#d4a843]/20 leading-none">
            <Info className="h-2 w-2" />
            Solo valores entre 01 y 20
          </div>
        </div>

        {errores.length > 0 && (
          <div className="bg-red-50 text-red-600 p-2 rounded-lg border border-red-200 flex items-center gap-2 text-[9px] font-bold mb-2 shrink-0 leading-none">
            <AlertCircle className="h-3 w-3 shrink-0" />
            Existen materias con nota "0". Corríjalas para continuar.
          </div>
        )}

        {/* Cuadrícula compacta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto pr-1 pb-2 custom-scrollbar">
          {materiasDelPensum.length > 0 ? (
            materiasDelPensum.map((materia, index) => {
              const tieneError = errores.includes(index);
              const codigoFinal = materia.codigo_materia || materia.codigo || "";
              const nombreFinal = materia.nombre_materia || materia.nombre || "";
              
              return (
                <div 
                  key={`materia-row-${materia.id || index}`} 
                  className={cn(
                    "group flex flex-row items-center justify-between p-2.5 bg-white border rounded-xl transition-all duration-300 shadow-sm",
                    tieneError ? "border-red-300 bg-red-50/30" : "border-slate-100 hover:border-[#1e3a5f]/20"
                  )}
                >
                  <input type="hidden" name="materias_codigos[]" value={codigoFinal} />
                  <input type="hidden" name="materias_nombres[]" value={nombreFinal} />

                  <div className="flex flex-col flex-1 min-w-0 mr-3">
                    <span className="text-[7px] font-black text-[#d4a843] uppercase tracking-widest leading-none mb-1 truncate">
                      {codigoFinal}
                    </span>
                    <span className="text-[10px] font-bold text-[#1e3a5f] uppercase leading-tight line-clamp-1">
                      {nombreFinal}
                    </span>
                  </div>

                  <div className="relative flex flex-col items-end shrink-0">
                    <Input
                      id={`nota-${index}`}
                      name="materias_notas[]" 
                      type="number"
                      min="1"
                      max="20"
                      placeholder="00"
                      required
                      disabled={disabled}
                      value={notas[index] || ""}
                      onChange={(e) => handleNotaChange(index, e.target.value)}
                      className={cn(
                        "w-14 h-9 text-center font-black text-[11px] rounded-lg transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                        tieneError 
                          ? "border-red-500 text-red-600 focus:border-red-600 bg-red-100" 
                          : "border-slate-200 bg-slate-50 focus:bg-white focus:border-[#1e3a5f] text-[#1e3a5f]"
                      )}
                      />
                  </div>
                </div>
              );
            })
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