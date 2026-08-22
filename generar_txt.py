import os

# Nombre del archivo final solicitado
ARCHIVO_SALIDA = "0Todoadmin.txt"

# Carpetas basura que NUNCA debemos escanear
IGNORAR_CARPETAS = {
    'node_modules', '.git', 'dist', 'build', '.next', 
    '__pycache__', 'venv', '.env', 'images', 'assets', '.vscode'
}

# Archivos específicos que debemos ignorar
IGNORAR_ARCHIVOS = {
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 
    '.DS_Store', '0Todoadmin.txt', 'Crear_admin.py'
}

def es_ruta_permitida(ruta_relativa):
    # Normalizar separadores de ruta para compatibilidad entre sistemas operativos
    ruta_normalizada = ruta_relativa.replace("\\", "/")
    
    # 1. Permitir específicamente el archivo de base de datos unimar_becas.sql
    if ruta_normalizada.endswith('unimar_becas.sql'):
        return True
        
    ext = os.path.splitext(ruta_normalizada)[1].lower()
    
    # 2. Permitir todos los archivos .ts de todo el proyecto
    if ext == '.ts':
        return True
        
    # 3. Permitir archivos .tsx que pertenezcan estrictamente a app/admin o app/components/admin
    if ext == '.tsx':
        if ('app/admin' in ruta_normalizada or ruta_normalizada.startswith('app/admin/') or
            'app/components/admin' in ruta_normalizada or ruta_normalizada.startswith('app/components/admin/')):
            return True
            
    return False

def generar_contexto():
    ruta_proyecto = os.getcwd()
    print(f" Analizando componentes de admin, app/components/admin, archivos .ts y base de datos en: {ruta_proyecto}")
    
    with open(ARCHIVO_SALIDA, "w", encoding="utf-8") as f_salida:
        f_salida.write("==================================================\n")
        f_salida.write("ESTRUCTURA DE ARCHIVOS (ADMIN TSX, COMPONENTS/ADMIN TSX, TODOS LOS TS, SQL)\n")
        f_salida.write("==================================================\n\n")
        
        # 1. Crear el árbol visual del mapa completo de archivos seleccionados
        f_salida.write("--- ÁRBOL DE ARCHIVOS SELECCIONADOS ---\n")
        for raiz, carpetas, archivos in os.walk(ruta_proyecto):
            carpetas[:] = [c for c in carpetas if c not in IGNORAR_CARPETAS]
            
            archivos_validos = []
            for a in archivos:
                if a in IGNORAR_ARCHIVOS:
                    continue
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
        
        # 2. Volcar el código fuente de los archivos permitidos
        for raiz, carpetas, archivos in os.walk(ruta_proyecto):
            carpetas[:] = [c for c in carpetas if c not in IGNORAR_CARPETAS]
            for archivo in archivos:
                if archivo in IGNORAR_ARCHIVOS:
                    continue
                
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
                    
    print(f" ¡Listo! Archivo de contexto generado con éxito: {ARCHIVO_SALIDA}")

if __name__ == "__main__":
    generar_contexto()