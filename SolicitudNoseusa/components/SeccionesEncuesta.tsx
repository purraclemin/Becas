"use client"

import React, { useState } from "react"
import { 
  SeccionIdentificacion, 
  SeccionAcademica, 
  SeccionFamiliar, 
  SeccionEconomica, 
  SeccionVivienda, 
  SeccionSalud 
} from "./SeccionesEncuestaSub"

export default function SeccionesEncuesta({ user, disabled }: any) {
  // Estado para manejar el acordeón: solo una sección abierta a la vez
  const [openSection, setOpenSection] = useState<number | null>(3);

  /**
   * 🟢 SOLUCIÓN MAESTRA: Desplazamiento con compensación de escala (85%).
   * Multiplicamos el valor del rect por 0.85 para obtener la posición real
   * dentro del contenedor escalado del layout global.
   */
  const toggleSection = (id: number) => {
    if (openSection === id) {
      setOpenSection(null);
    } else {
      setOpenSection(id);

      // Usamos un tiempo de espera para que el DOM reconozca la expansión
      setTimeout(() => {
        const element = document.getElementById(`encuesta-section-${id}`);
        if (element) {
          // 1. Obtenemos la posición relativa al viewport
          const rect = element.getBoundingClientRect();
          
          // 2. Calculamos el scroll actual
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          
          // 3. Compensamos la escala del layout (0.85) para llegar al tope real
          const finalY = (rect.top * 0.85) + scrollTop;

          window.scrollTo({
            top: finalY - 40, // Margen de 40px para que el título no toque el borde
            behavior: "smooth"
          });
        }
      }, 350);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* SECCIÓN 3: Identificación */}
      <div id="encuesta-section-3" className="scroll-mt-28">
        <SeccionIdentificacion 
          user={user} 
          disabled={disabled} 
          isOpen={openSection === 3} 
          onToggle={() => toggleSection(3)} 
        />
      </div>
      
      {/* SECCIÓN 4: Académica */}
      <div id="encuesta-section-4" className="scroll-mt-28">
        <SeccionAcademica 
          user={user} 
          disabled={disabled} 
          isOpen={openSection === 4} 
          onToggle={() => toggleSection(4)} 
        />
      </div>

      {/* SECCIÓN 5: Familiar */}
      <div id="encuesta-section-5" className="scroll-mt-28">
        <SeccionFamiliar 
          user={user} 
          disabled={disabled} 
          isOpen={openSection === 5} 
          onToggle={() => toggleSection(5)} 
        />
      </div>

      {/* SECCIÓN 6: Económica */}
      <div id="encuesta-section-6" className="scroll-mt-28">
        <SeccionEconomica 
          user={user} 
          disabled={disabled} 
          isOpen={openSection === 6} 
          onToggle={() => toggleSection(6)} 
        />
      </div>

      {/* SECCIÓN 7: Vivienda */}
      <div id="encuesta-section-7" className="scroll-mt-28">
        <SeccionVivienda 
          user={user} 
          disabled={disabled} 
          isOpen={openSection === 7} 
          onToggle={() => toggleSection(7)} 
        />
      </div>

      {/* SECCIÓN 8: Salud */}
      <div id="encuesta-section-8" className="scroll-mt-28">
        <SeccionSalud 
          user={user} 
          disabled={disabled} 
          isOpen={openSection === 8} 
          onToggle={() => toggleSection(8)} 
        />
      </div>

    </div>
  )
}