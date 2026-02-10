"use client"

// 🟢 ARCHIVO LIMPIO: Solo sirve de contenedor, sin botones de edición.

interface SolicitudSectionActionProps {
  sectionNum: number;
  editingSection: number | null;
  setEditingSection: (num: number | null) => void;
  estaBloqueadoTotalmente: boolean;
  esPendiente: boolean;
  children: React.ReactNode;
}

export function SolicitudSectionAction({
  children
}: SolicitudSectionActionProps) {
  
  return (
    <div className="relative group">
      {/* El botón individual se ha eliminado completamente */}
      {children}
    </div>
  )
}