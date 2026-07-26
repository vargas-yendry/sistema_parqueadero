import express from "express";

import { todasLasFilas, unaFila } from "../../servidor/consulta.js";

const router = express.Router();

/**
 * Cada filtro define su ventana de tiempo. Son fragmentos SQL fijos elegidos
 * por nombre: nunca se interpola nada que venga del usuario.
 */
const VENTANAS = {
  Hoy: {
    salidas: "DATE(horaSalida)=DATE('now','localtime')",
    ventas: "DATE(fecha)=DATE('now','localtime')",
  },
  Semana: {
    salidas: "horaSalida >= datetime('now','-7 day')",
    ventas: "fecha >= datetime('now','-7 day')",
  },
  Mes: {
    salidas: "strftime('%Y-%m',horaSalida)=strftime('%Y-%m','now')",
    ventas: "strftime('%Y-%m',fecha)=strftime('%Y-%m','now')",
  },
  "Año": {
    salidas: "strftime('%Y',horaSalida)=strftime('%Y','now')",
    ventas: "strftime('%Y',fecha)=strftime('%Y','now')",
  },
};

router.get("/", async (req, res) => {
  const ventana = VENTANAS[req.query.filtro] ?? VENTANAS.Hoy;

  try {
    const [tendencia, parking, accesorios, mensualidades] = await Promise.all([
      todasLasFilas(`
        SELECT
          DATE(horaSalida) AS fecha,
          COALESCE(SUM(valor), 0) AS total
        FROM salidas
        WHERE horaSalida >= date('now','-6 day')
        GROUP BY DATE(horaSalida)
        ORDER BY fecha ASC
      `),

      unaFila(`
        SELECT
          COALESCE(SUM(valor), 0) AS total,
          COUNT(*) AS vehiculos
        FROM salidas
        WHERE ${ventana.salidas}
      `),

      unaFila(`
        SELECT
          COALESCE(SUM(total), 0) AS ventasAccesorios,
          COALESCE(SUM(ganancia), 0) AS gananciaAccesorios
        FROM ventas_accesorios
        WHERE ${ventana.ventas}
      `),

      unaFila(`
        SELECT
          IFNULL(SUM(valor), 0) AS ingresoMensualidades,
          COUNT(*) AS clientes
        FROM mensualidades
      `),
    ]);

    res.json({
      ingresosParking: parking.total || 0,
      vehiculos: parking.vehiculos || 0,
      ventasAccesorios: accesorios.ventasAccesorios || 0,
      gananciaAccesorios: accesorios.gananciaAccesorios || 0,
      ingresoMensualidades: mensualidades.ingresoMensualidades || 0,
      clientesMensualidad: mensualidades.clientes || 0,
      tendencia,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
