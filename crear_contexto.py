import os

# Nombre del archivo final que subiremos a Gemini
ARCHIVO_SALIDA = "contexto_proyecto_gemini.txt"

# Carpetas basura que NUNCA debemos escanear
IGNORAR_CARPETAS = {
    'node_modules', '.git', 'dist', 'build', '.next', 
    '__pycache__', 'venv', '.env', 'images', 'assets', '.vscode'
}

# Archivos específicos que debemos ignorar
IGNORAR_ARCHIVOS = {
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 
    '.DS_Store', 'contexto_proyecto_gemini.txt', 'crear_contexto.py'
}

# FILTRO EXTENDIDO: Todas las extensiones de texto relevantes y código fuente (.ts, .tsx, .sql, .js, .jsx)
EXTENSIONES_TEXTO = {'.ts', '.tsx', '.sql', '.js', '.jsx'}

def es_ruta_permitida(ruta_relativa):
    # Normalizar separadores de ruta para compatibilidad entre sistemas operativos
    ruta_normalizada = ruta_relativa.replace("\\", "/")
    
    # 1. Permitir específicamente el archivo unimar_becas.sql (en la raíz o cualquier subcarpeta)
    if ruta_normalizada.endswith('unimar_becas.sql') or ruta_normalizada.endswith('.sql'):
        return True
        
    # 2. Permitir TODO el proyecto de forma general (removiendo restricciones de carpetas estrictas anteriores)
    # Excluyendo únicamente las carpetas y archivos definidos en las listas de basura.
    return True

def generar_contexto():
    ruta_proyecto = os.getcwd()
    print(f" Analizando todo el proyecto de forma global: {ruta_proyecto}")
    
    with open(ARCHIVO_SALIDA, "w", encoding="utf-8") as f_salida:
        f_salida.write("==================================================\n")
        f_salida.write("ESTRUCTURA GENERAL DEL PROYECTO (TS, TSX, SQL, JS)\n")
        f_salida.write("==================================================\n\n")
        
        # 1. Crear el árbol visual del mapa completo del proyecto
        f_salida.write("--- ÁRBOL DE ARCHIVOS SELECCIONADOS ---\n")
        for raiz, carpetas, archivos in os.walk(ruta_proyecto):
            carpetas[:] = [c for c in carpetas if c not in IGNORAR_CARPETAS]
            
            # Filtrar archivos válidos según extensión
            archivos_validos = []
            for a in archivos:
                if a in IGNORAR_ARCHIVOS:
                    continue
                ext = os.path.splitext(a)[1].lower()
                if ext in EXTENSIONES_TEXTO or a.endswith('.sql'):
                    ruta_completa = os.path.join(raiz, a)
                    ruta_relativa = os.path.relpath(ruta_completa, ruta_proyecto)
                    if es_ruta_permitida(ruta_relativa):
                        archivos_validos.append(a)
            
            if archivos_validos or raiz == ruta_proyecto:
                nivel = raiz.replace(ruta_proyecto, '').count(os.sep)
                sangria = ' ' * 4 * nivel
                f_salida.write(f"{sangria}[📁] {os.path.basename(raiz)}/\n")
                sub_sangria = ' ' * 4 * (nivel + 1)
                for archivo in archivos_validos:
                    f_salida.write(f"{sub_sangria}[📄] {archivo}\n")
        
        f_salida.write("\n==================================================\n")
        f_salida.write("CONTENIDO EN TEXTO PLANO DE LOS ARCHIVOS\n")
        f_salida.write("==================================================\n\n")
        
        # 2. Volcar el código fuente de todos los archivos .ts, .tsx, .sql, .js, .jsx válidos
        for raiz, carpetas, archivos in os.walk(ruta_proyecto):
            carpetas[:] = [c for c in carpetas if c not in IGNORAR_CARPETAS]
            for archivo in archivos:
                if archivo in IGNORAR_ARCHIVOS:
                    continue
                
                _, ext = os.path.splitext(archivo)
                if ext.lower() in EXTENSIONES_TEXTO or archivo.endswith('.sql'):
                    ruta_completa = os.path.join(raiz, archivo)
                    ruta_relativa = os.path.relpath(ruta_completa, ruta_proyecto)
                    
                    if es_ruta_permitida(ruta_relativa):
                        f_salida.write(f"--- INICIO ARCHIVO: {ruta_relativa} ---\n")
                        try:
                            with open(ruta_completa, "r", encoding="utf-8", errors="ignore") as f_lectura:
                                f_salida.write(f_lectura.read())
                        except Exception as e:
                            f_salida.write(f"[Error al leer archivo: {str(e)}]\n")
                        f_salida.write(f"\n--- FIN ARCHIVO: {ruta_relativa} ---\n\n")
                        
    print(f" ¡Listo! Contexto global generado con éxito: {ARCHIVO_SALIDA}")

if __name__ == "__main__":
    generar_contexto()