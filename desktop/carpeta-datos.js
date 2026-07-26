import fs from "node:fs";
import path from "node:path";

/** Nombre de la carpeta que activa el modo portátil si está junto al ejecutable. */
export const CARPETA_PORTATIL = "datos";

/**
 * Dónde guarda la app la base de datos y los respaldos.
 *
 * El orden importa:
 *
 * 1. `PARQUEADERO_DATOS` — si alguien la define, manda.
 * 2. En desarrollo, la carpeta `data/` del repo.
 * 3. **Modo portátil**: si junto al ejecutable (el .AppImage o el .exe portable)
 *    hay una carpeta llamada `datos`, se usa esa. Así los datos viajan con la
 *    app en una USB. Es opt-in a propósito: si se usara siempre, una app puesta
 *    en Descargas o en un lugar de solo lectura no podría escribir.
 * 4. Si no, la carpeta del usuario:
 *    - Windows: `%APPDATA%\parqueadero-yg\datos`
 *    - Linux:   `~/.config/parqueadero-yg/datos`
 *
 * Nunca se escribe junto al programa instalado: en Windows, Archivos de
 * programa es de solo lectura para el usuario.
 */
export function resolverCarpetaDatos({
  empaquetada,
  carpetaUsuario,
  raizProyecto,
  entorno = {},
  existe = fs.existsSync,
}) {
  if (entorno.PARQUEADERO_DATOS) {
    return path.resolve(entorno.PARQUEADERO_DATOS);
  }

  if (!empaquetada) {
    return path.join(raizProyecto, "data");
  }

  const portatil = carpetaPortatil(entorno);

  if (portatil && existe(portatil)) {
    return portatil;
  }

  return path.join(carpetaUsuario, "datos");
}

/**
 * La carpeta `datos` que estaría al lado del ejecutable portátil, o null si la
 * app no se está ejecutando en formato portátil.
 *
 * `APPIMAGE` la pone el propio AppImage al arrancar; `PORTABLE_EXECUTABLE_DIR`
 * la pone el ejecutable portátil que genera electron-builder en Windows.
 */
export function carpetaPortatil(entorno = {}) {
  if (entorno.APPIMAGE) {
    return path.join(path.dirname(entorno.APPIMAGE), CARPETA_PORTATIL);
  }

  if (entorno.PORTABLE_EXECUTABLE_DIR) {
    return path.join(entorno.PORTABLE_EXECUTABLE_DIR, CARPETA_PORTATIL);
  }

  return null;
}
