import { Search, Loader2, Edit3, Trash2 } from "lucide-react"

export function StudentIdentity({ 
  student, loading, cedulaBusqueda, setCedulaBusqueda, handleSearch, mostrarResultado, setMostrarResultado, setPasoActual, borrarEstudio, setStudent, setCedula 
}: any) {
  return (
    <div className="space-y-6">
      {!mostrarResultado && !student && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" value={cedulaBusqueda} onChange={(e) => setCedulaBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ingrese Cédula del Estudiante..." 
              className="w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-4 rounded-xl font-bold text-[#1a2744] outline-none focus:border-[#d4a843] transition-all" 
            />
          </div>
          <button onClick={handleSearch} className="w-full md:w-auto bg-[#1a2744] text-[#d4a843] px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95">
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Buscar Expediente"}
          </button>
        </div>
      )}

      {student && (
        <div className="bg-[#1a2744] p-6 rounded-2xl text-white flex flex-col md:flex-row justify-between items-center gap-4 border-l-8 border-[#d4a843] shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-5 relative z-10">
            <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#d4a843] font-black text-xl border border-white/5">
              {student.nombre?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">{student.nombre} {student.apellido}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-[#d4a843] text-[#1a2744] px-2 py-0.5 rounded text-[10px] font-black uppercase">V-{student.cedula}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-slate-200">{student.carrera}</span>
              </div>
            </div>
          </div>
          {mostrarResultado && (
            <div className="flex gap-2 relative z-10">
              <button onClick={() => { setMostrarResultado(false); setPasoActual(1); }} className="p-3 bg-white/10 rounded-xl text-[#d4a843] border border-white/5"><Edit3 className="h-5 w-5" /></button>
              <button onClick={async () => { if(confirm("¿Borrar?")) { await borrarEstudio(student.id); setStudent(null); setMostrarResultado(false); setCedula(""); }}} className="p-3 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/20"><Trash2 className="h-5 w-5" /></button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}