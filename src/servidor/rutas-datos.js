import fs from "node:fs";
import path from "node:path";

/**
 * Dónde vive la base de datos.
 *
 * - En desarrollo: la carpeta `data/` del repo.
 * - Instalado: la carpeta de usuario que le pasa Electron por PARQUEADERO_DATOS
 *   (escribir dentro de Archivos de programa falla en Windows).
 */
export const carpetaDatos = process.env.PARQUEADERO_DATOS
  ? path.resolve(process.env.PARQUEADERO_DATOS)
  : path.resolve(process.cwd(), "data");

export const carpetaRespaldos = path.join(carpetaDatos, "respaldos");

export const rutaBaseDatos = path.join(carpetaDatos, "parqueadero.db");

/** Crea las carpetas de datos si es la primera vez que corre la app. */
export function prepararCarpetas() {
  fs.mkdirSync(carpetaRespaldos, { recursive: true });
}
