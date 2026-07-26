const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.get("/", (req, res) => {

  const filtro = req.query.filtro || "Hoy";

  let condicion = "";
  let condicionVentas = "";

  if (filtro === "Hoy") {

    condicion =
      "DATE(horaSalida)=DATE('now','localtime')";

    condicionVentas =
      "DATE(fecha)=DATE('now','localtime')";
  }

  if (filtro === "Semana") {

    condicion =
      "horaSalida >= datetime('now','-7 day')";

    condicionVentas =
      "fecha >= datetime('now','-7 day')";
  }

  if (filtro === "Mes") {

    condicion =
      "strftime('%Y-%m',horaSalida)=strftime('%Y-%m','now')";

    condicionVentas =
      "strftime('%Y-%m',fecha)=strftime('%Y-%m','now')";
  }

  if (filtro === "Año") {

    condicion =
      "strftime('%Y',horaSalida)=strftime('%Y','now')";

    condicionVentas =
      "strftime('%Y',fecha)=strftime('%Y','now')";
  }
    
    db.all(

  `
  SELECT

  DATE(horaSalida) as fecha,

  COALESCE(
    SUM(valor),
    0
  ) as total

  FROM salidas

  WHERE horaSalida >= date('now','-6 day')

  GROUP BY DATE(horaSalida)

  ORDER BY fecha ASC
  `,

  [],

  (err, tendencia) => {

    if(err){
      return res.status(500).json(err);
    }

  db.get(

    `
    SELECT
      COALESCE(SUM(valor),0) AS total,
      COUNT(*) AS vehiculos
    FROM salidas
    WHERE ${condicion}
    `,

    [],

    (err, parking) => {

      if (err) {
        return res.status(500).json(err);
      }

      db.get(

        `
        SELECT
          COALESCE(SUM(total),0) AS ventasAccesorios,
          COALESCE(SUM(ganancia),0) AS gananciaAccesorios
        FROM ventas_accesorios
        WHERE ${condicionVentas}
        `,

        [],

        (err, accesorios) => {

          if (err) {
            return res.status(500).json(err);
          }

          db.get(

            `
            SELECT
              IFNULL(SUM(valor),0) AS ingresoMensualidades,
              COUNT(*) AS clientes
            FROM mensualidades
            `,

            [],

            (err, mensualidades) => {

              if (err) {
                return res.status(500).json(err);
              }

              res.json({

  ingresosParking:
    parking.total || 0,

  vehiculos:
    parking.vehiculos || 0,

  ventasAccesorios:
    accesorios.ventasAccesorios || 0,

  gananciaAccesorios:
    accesorios.gananciaAccesorios || 0,

  ingresoMensualidades:
    mensualidades.ingresoMensualidades || 0,

  clientesMensualidad:
    mensualidades.clientes || 0,

  tendencia

});

            }

          );

        }

           );

    }

  );

  }

);

});

module.exports = router;