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

app.use(cors());
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

app.listen(PUERTO, () => {
  console.log(`Servidor ejecutándose en el puerto ${PUERTO}`);
  crearRespaldoAutomatico();
});
