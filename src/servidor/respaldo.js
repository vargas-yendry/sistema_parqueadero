import fs from "node:fs";
import path from "node:path";

import { carpetaRespaldos, prepararCarpetas, rutaBaseDatos } from "./rutas-datos.js";

const MAXIMO_RESPALDOS = 30;

/** Copia la base de datos a data/respaldos/ y conserva solo los 30 más recientes. */
export function crearRespaldoAutomatico() {
  try {
    if (!fs.existsSync(rutaBaseDatos)) {
      return;
    }

    prepararCarpetas();

    const marcaDeTiempo = new Date().toISOString().replace(/:/g, "-").split(".")[0];
    const destino = path.join(carpetaRespaldos, `parqueadero_${marcaDeTiempo}.db`);

    fs.copyFileSync(rutaBaseDatos, destino);
    console.log("✅ Respaldo creado:", destino);

    eliminarRespaldosViejos();
  } catch (error) {
    console.error("❌ Error creando el respaldo:", error);
  }
}

function eliminarRespaldosViejos() {
  const respaldos = fs
    .readdirSync(carpetaRespaldos)
    .filter((archivo) => archivo.endsWith(".db"))
    .sort();

  for (const archivo of respaldos.slice(0, Math.max(0, respaldos.length - MAXIMO_RESPALDOS))) {
    fs.unlinkSync(path.join(carpetaRespaldos, archivo));
    console.log("🗑 Respaldo eliminado:", archivo);
  }
}
