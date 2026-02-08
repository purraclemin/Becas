import { Search, Loader2, Edit3, Trash2, X, Mail, ShieldAlert, ShieldCheck, Shield } from "lucide-react"

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

  const handleClose = () => {
    setStudent(null);
    setMostrarResultado(false);
    setCedulaBusqueda(""); 
  };

  const getRiskTheme = (nivel: string) => {
    switch (nivel) {
      case 'Alto': 
        return { border: 'border-rose-500/50', text: 'text-rose-400', bg: 'bg-rose-500/10', icon: <ShieldAlert className="h-3 w-3" /> };
      case 'Medio': 
        return { border: 'border-amber-500/50', text: 'text-amber-400', bg: 'bg-amber-500/10', icon: <Shield className="h-3 w-3" /> };
      case 'Bajo': 
        return { border: 'border-emerald-500/50', text: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <ShieldCheck className="h-3 w-3" /> };
      default: 
        return { border: 'border-slate-500/30', text: 'text-slate-400', bg: 'bg-slate-500/10', icon: null };
    }
  };

  const theme = getRiskTheme(student?.nivel_riesgo);

  return (
    <div className="w-full">
      
      {/* --- BUSCADOR --- */}
      {!student && (
        <div className="bg-white p-1.5 pl-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-2 transition-all focus-within:shadow-md focus-within:border-slate-300">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            value={cedulaBusqueda} 
            onChange={(e) => setCedulaBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Cédula, nombre o correo..." 
            className="flex-1 bg-transparent border-none py-2 text-sm font-medium text-[#1a2744] outline-none placeholder:text-slate-400 placeholder:font-normal" 
          />
          <button 
            onClick={handleSearch} 
            disabled={loading}
            className="w-full md:w-auto bg-[#1a2744] text-white px-6 py-2 rounded-lg font-bold uppercase text-[9px] tracking-[0.2em] transition-all hover:bg-[#253659] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : "Consultar"}
          </button>
        </div>
      )}

      {/* --- FICHA DEL ESTUDIANTE --- */}
      {student && (
        <div className={`relative bg-[#0f172a] rounded-xl border-t-2 ${theme.border} shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-400`}>
          
          {/* BOTÓN CERRAR: En la esquina superior derecha, independiente */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 flex flex-col items-center justify-center w-12 h-12 bg-white text-[#0f172a] hover:bg-slate-100 rounded-xl shadow-xl transition-all z-20 active:scale-90"
          >
            <X className="h-4 w-4" />
            <span className="text-[7px] font-black uppercase mt-1">Cerrar</span>
          </button>

          <div className="flex flex-col md:flex-row items-center p-6 md:p-8 gap-8">
            
            {/* Avatar */}
            <div className={`h-14 w-14 shrink-0 rounded-xl ${theme.bg} border ${theme.border} flex items-center justify-center text-[#d4a843] font-black text-xl shadow-lg`}>
              {student.nombre?.[0]}
            </div>

            {/* Información Principal */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-x-3 gap-y-1">
                <h2 className="text-xl font-black text-white uppercase tracking-tight truncate">
                  {student.nombre} {student.apellido}
                </h2>
                {student.nivel_riesgo && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${theme.bg} ${theme.text} text-[8px] font-black uppercase border ${theme.border} w-fit mx-auto md:mx-0`}>
                    {theme.icon} Riesgo {student.nivel_riesgo}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-3 mt-2 text-[10px] font-bold text-slate-400">
                <span className="text-[#d4a843] tabular-nums font-black">V-{student.cedula}</span>
                <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                <span className="uppercase tracking-wide opacity-80">{student.carrera}</span>
                <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                <span className="flex items-center gap-1 opacity-60 lowercase font-medium">
                  <Mail className="h-3 w-3" />
                  {student.email}
                </span>
              </div>
            </div>

            {/* ACCIONES: Cuadradas, alejadas del botón cerrar (margin-right aplicado) */}
            {mostrarResultado && (
              <div className="flex items-center gap-2 md:mr-16">
                
                {/* BOTÓN EDITAR */}
                <button 
                  onClick={() => { setMostrarResultado(false); setPasoActual(1); }} 
                  className="flex flex-col items-center justify-center w-14 h-14 bg-white/5 border border-white/10 rounded-xl text-[#d4a843] hover:bg-[#d4a843]/10 hover:border-[#d4a843]/30 transition-all active:scale-95 group"
                >
                  <Edit3 className="h-4 w-4 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black uppercase tracking-wider">Editar</span>
                </button>

                {/* BOTÓN BORRAR */}
                <button 
                  onClick={async () => { 
                    if(confirm("¿Eliminar este estudio?")) { 
                      await borrarEstudio(student.id); 
                      handleClose(); 
                    }
                  }} 
                  className="flex flex-col items-center justify-center w-14 h-14 bg-white/5 border border-white/10 rounded-xl text-rose-400 hover:bg-rose-400/10 hover:border-rose-400/30 transition-all active:scale-95 group"
                >
                  <Trash2 className="h-4 w-4 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black uppercase tracking-wider">Borrar</span>
                </button>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}