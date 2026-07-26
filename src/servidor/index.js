import cors from "cors";
import express from "express";

import accesoriosRutas from "../features/accesorios/rutas.js";
import gastosRutas from "../features/gastos/rutas.js";
import ingresosRutas from "../features/ingresos/rutas.js";
import jornadaRutas from "../features/jornada/rutas.js";
import mensualidadesRutas from "../features/mensualidades/rutas.js";
import reportesRutas from "../features/reportes/rutas.js";
import salidasRutas from "../features/salidas/rutas.js";
import vehiculosRutas from "../features/vehiculos/rutas.js";
import { crearRespaldoAutomatico } from "./respaldo.js";

const PUERTO = Number(process.env.PARQUEADERO_PUERTO ?? 3333);

const app = express();

// La API solo la consume esta máquina: la interfaz servida por Vite en desarrollo
// y la ventana de Electron (origen file://, que llega como "null") ya instalada.
const ORIGENES = ["http://localhost:5173", "http://127.0.0.1:5173", "null"];

app.disable("x-powered-by");
app.use(cors({ origin: ORIGENES }));
app.use(express.json());

app.use("/api/ingresos", ingresosRutas);
app.use("/api/vehiculos", vehiculosRutas);
app.use("/api/salidas", salidasRutas);
app.use("/api/mensualidades", mensualidadesRutas);
app.use("/api/accesorios", accesoriosRutas);
app.use("/api/reportes", reportesRutas);
app.use("/api/gastos", gastosRutas);
app.use("/api/nuevo-dia", jornadaRutas);

app.get("/api/salud", (req, res) => {
  res.json({ estado: "ok", mensaje: "Servidor Parqueadero Y&G funcionando 🚀" });
});

// Solo escucha en la máquina: aunque el equipo esté en una red del local, nadie
// de afuera puede entrar a la API. La interfaz la llama por 127.0.0.1 explícito
// (ver src/api.js): "localhost" resuelve a ::1 en muchos equipos.
const servidor = app.listen(PUERTO, "127.0.0.1", () => {
  // Express llama a este callback AUNQUE el bind haya fallado (queda listening
  // en false y address en null, y el error llega justo después). Sin esta
  // comprobación, una segunda copia de la app creaba un respaldo de más antes
  // de rendirse.
  if (!servidor.listening) {
    return;
  }

  console.log(`Servidor ejecutándose en el puerto ${PUERTO}`);
  avisarAlPadre({ tipo: "listo", puerto: PUERTO });
  crearRespaldoAutomatico();
});

servidor.on("error", (error) => {
  const ocupado = error.code === "EADDRINUSE";

  console.error(
    ocupado
      ? `El puerto ${PUERTO} ya está ocupado por otro programa.`
      : `Error arrancando el servidor: ${error.message}`,
  );

  avisarAlPadre({
    tipo: "error",
    motivo: ocupado ? "puerto-ocupado" : "desconocido",
    puerto: PUERTO,
  });
  process.exit(ocupado ? 2 : 1);
});

/**
 * Si Electron lo lanzó como proceso hijo, le avisa por el canal de IPC.
 * Así la ventana no tiene que adivinar cuándo está listo el servidor.
 */
function avisarAlPadre(mensaje) {
  process.send?.(mensaje);
}

/**
 * Cuando Electron muere —incluso de golpe— el canal de IPC se cierra y este
 * proceso se entera. Sin esto el servidor quedaba huérfano ocupando el puerto,
 * y el siguiente arranque de la app fallaba.
 */
process.on("disconnect", () => {
  console.log("Electron se cerró: apagando el servidor.");
  servidor.close(() => process.exit(0));

  // Si alguna conexión queda colgada, no esperamos indefinidamente.
  setTimeout(() => process.exit(0), 2000).unref();
});

for (const senal of ["SIGINT", "SIGTERM"]) {
  process.on(senal, () => servidor.close(() => process.exit(0)));
}
