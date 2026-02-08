import { Search, Loader2, Edit3, Trash2, X, User } from "lucide-react"

export function StudentIdentity({ 
  student, 
  loading, 
  cedulaBusqueda, 
  setCedulaBusqueda, 
  handleSearch, 
  mostrarResultado, 
  setMostrarResultado, 
  setPasoActual, 
  borrarEstudio, 
  setStudent 
}: any) {

  // Función para cerrar la ficha actual y permitir una nueva búsqueda
  const handleClose = () => {
    setStudent(null);
    setMostrarResultado(false);
    setCedulaBusqueda(""); 
  };

  return (
    <div className="w-full">
      
      {/* --- BARRA DE BÚSQUEDA (Minimalista) --- */}
      {!student && (
        <div className="group bg-white p-2 pl-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center transition-all hover:shadow-md hover:border-slate-200">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#d4a843] transition-colors" />
            <input 
              type="text" 
              value={cedulaBusqueda} 
              onChange={(e) => setCedulaBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por Cédula, Nombre o Correo..." 
              autoFocus
              className="w-full bg-transparent border-none py-4 pl-8 pr-4 font-medium text-[#1a2744] outline-none placeholder:text-slate-300 placeholder:font-normal text-lg" 
            />
          </div>
          <button 
            onClick={handleSearch} 
            disabled={loading}
            className="w-full md:w-auto bg-[#1a2744] hover:bg-[#253659] text-white px-8 py-3.5 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Consultar"}
          </button>
        </div>
      )}

      {/* --- FICHA DEL ESTUDIANTE (Diseño Limpio) --- */}
      {student && (
        <div className="relative bg-[#1a2744] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 text-white group">
          
          {/* Fondo decorativo sutil */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-[#d4a843] opacity-10 rounded-full blur-3xl pointer-events-none"></div>

          {/* BOTÓN CERRAR (Posicionado EXTREMO SUPERIOR DERECHO) */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all"
            title="Cerrar ficha"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex flex-col md:flex-row items-center p-6 md:p-8 gap-6">
            
            {/* AVATAR */}
            <div className="shrink-0 relative">
               <div className="h-20 w-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#d4a843] font-black text-3xl shadow-inner">
                  {student.nombre?.[0]}
               </div>
            </div>

            {/* INFO TEXTUAL */}
            <div className="flex-1 min-w-0 w-full text-center md:text-left">
              <h2 className="text-3xl font-black tracking-tight text-white leading-tight truncate pr-10">
                {student.nombre} <span className="text-white/60 font-medium">{student.apellido}</span>
              </h2>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-2 mt-3 text-sm font-medium text-slate-300">
                <span className="flex items-center gap-1.5 text-[#d4a843]">
                  <span className="text-[11px] bg-[#d4a843]/10 px-2 py-0.5 rounded border border-[#d4a843]/20 font-bold">V-{student.cedula}</span>
                </span>
                <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                <span className="truncate">{student.carrera}</span>
                {student.email && (
                  <>
                    <span className="w-1 h-1 bg-white/20 rounded-full hidden md:block"></span>
                    <span className="truncate opacity-70 hidden md:block">{student.email}</span>
                  </>
                )}
              </div>
            </div>

            {/* ACCIONES (Separadas totalmente: EXTREMO INFERIOR DERECHO o Columna separada) */}
            {mostrarResultado && (
              <div className="w-full md:w-auto flex items-center justify-center md:justify-end gap-3 md:pl-8 md:border-l border-white/10 mt-4 md:mt-0">
                 {/* Contenedor de botones */}
                 <div className="flex gap-2">
                    <button 
                      onClick={() => { setMostrarResultado(false); setPasoActual(1); }} 
                      className="group/btn flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-white/5 transition-all active:scale-95"
                      title="Editar Estudio"
                    >
                      <div className="p-2 bg-white/10 rounded-lg text-[#d4a843] group-hover/btn:bg-[#d4a843] group-hover/btn:text-[#1a2744] transition-colors">
                        <Edit3 className="h-5 w-5" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 group-hover/btn:text-white/80">Editar</span>
                    </button>

                    <button 
                      onClick={async () => { 
                        if(confirm("¿Eliminar estudio permanentemente?")) { 
                          await borrarEstudio(student.id); 
                          handleClose(); 
                        }
                      }} 
                      className="group/btn flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-white/5 transition-all active:scale-95"
                      title="Eliminar Estudio"
                    >
                      <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 group-hover/btn:bg-rose-500 group-hover/btn:text-white transition-colors">
                        <Trash2 className="h-5 w-5" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 group-hover/btn:text-white/80">Borrar</span>
                    </button>
                 </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}