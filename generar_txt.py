import os

# Directorio ajustado a la carpeta exacta
DIRECTORIO_OBJETIVO = "app/postulacion"
ARCHIVO_SALIDA = "proyecto_postulacion.txt"

def consolidar_archivos():
    if not os.path.exists(DIRECTORIO_OBJETIVO):
        print(f"Error: La ruta '{DIRECTORIO_OBJETIVO}' no existe. Revisa la ubicación.")
        return

    total_archivos = 0
    
    with open(ARCHIVO_SALIDA, "w", encoding="utf-8") as outfile:
        outfile.write("=== MAPA Y CONTENIDO DE LA CARPETA APP/POSTULACION ===\n\n")
        
        for root, dirs, files in os.walk(DIRECTORIO_OBJETIVO):
            for file in files:
                if file.endswith(".tsx") or file.endswith(".ts"):
                    ruta_completa = os.path.join(root, file)
                    total_archivos += 1
                    
                    outfile.write(f"\n// ========================================\n")
                    outfile.write(f"// ARCHIVO: {ruta_completa}\n")
                    outfile.write(f"// ========================================\n\n")
                    
                    try:
                        with open(ruta_completa, "r", encoding="utf-8") as infile:
                            outfile.write(infile.read())
                        outfile.write("\n\n" + "="*40 + "\n")
                    except Exception as e:
                        outfile.write(f"// Error al leer este archivo: {str(e)}\n")

    print(f"¡Listo! Se han consolidado {total_archivos} archivos en '{ARCHIVO_SALIDA}'.")

if __name__ == "__main__":
    consolidar_archivos()