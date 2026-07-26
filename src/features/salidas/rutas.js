import express from "express";
const router = express.Router();
import db from "../../servidor/base-datos.js";
import { calcularCobro, calcularMinutos } from "./cobro.js";

// Buscar vehículo por ficha
router.post("/buscar", (req, res) => {
  const { ficha, ...tarifas } = req.body;

  db.get(
    `SELECT * FROM vehiculos
     WHERE ficha=? AND estado='ACTIVO'`,

    [ficha],

    (err, vehiculo) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (!vehiculo) {
        return res.status(404).json({
          mensaje: "Ficha no encontrada",
        });
      }

      const horaSalida = new Date();
      const minutos = calcularMinutos(vehiculo.horaIngreso, horaSalida);

      const valor = calcularCobro({
        tipo: vehiculo.tipo,
        modalidad: vehiculo.modalidad,
        minutos,
        tarifas,
      });

      res.json({
        ...vehiculo,
        minutos,
        valor,
        horaSalida,
      });
    },
  );
});

// Finalizar salida
router.post("/finalizar", (req, res) => {
  // El valor lo recalcula el servidor: no se confía en el que manda el cliente.
  const { id, ...tarifas } = req.body;

  db.get(
    `SELECT * FROM vehiculos WHERE id=?`,

    [id],

    (err, vehiculo) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (!vehiculo) {
        return res.status(404).json({
          mensaje: "Vehículo no encontrado",
        });
      }

      const horaSalida = new Date();
      const minutos = calcularMinutos(vehiculo.horaIngreso, horaSalida);

      const valorFinal = calcularCobro({
        tipo: vehiculo.tipo,
        modalidad: vehiculo.modalidad,
        minutos,
        tarifas,
      });

      // guardar historial
      db.run(
        `INSERT INTO salidas(
  placa,
  ficha,
  horaIngreso,
  horaSalida,
  tiempo,
  valor
)

        VALUES(?,?,?,?,?,?)`,

        [
          vehiculo.placa,
          vehiculo.ficha,
          vehiculo.horaIngreso,
          horaSalida.toISOString(),
          `${minutos} minutos`,
          valorFinal,
        ],

        function (err) {
          if (err) {
            return res.status(500).json(err);
          }

          // liberar ficha
          db.run(
            `UPDATE vehiculos
             SET estado='SALIO'
             WHERE id=?`,

            [id],

            function (err) {
              if (err) {
                return res.status(500).json(err);
              }

              res.json({
                mensaje: "Salida registrada",
              });
            },
          );
        },
      );
    },
  );
});

// Estadísticas reales dashboard
router.get("/estadisticas", (req, res) => {
  db.get(
    `
    SELECT valor
    FROM configuracion
    WHERE clave='ultimaLiquidacion'
    `,

    [],

    (err, config) => {
      if (err) {
        return res.status(500).json(err);
      }

      const fechaBase = config?.valor || "2000-01-01";

      db.get(
        `
        SELECT

        (SELECT COUNT(*)
         FROM vehiculos
         WHERE horaIngreso >= ?)
         as vehiculosHoy,

        (SELECT COUNT(*)
         FROM salidas
         WHERE horaSalida >= ?)
         as salidasHoy,

        (SELECT IFNULL(SUM(valor),0)
         FROM salidas
         WHERE horaSalida >= ?)
         as ingresosHoy
        `,

        [fechaBase, fechaBase, fechaBase],

        (err, data) => {
          if (err) {
            return res.status(500).json(err);
          }

          res.json({
            vehiculosHoy: data.vehiculosHoy || 0,

            salidasHoy: data.salidasHoy || 0,

            ingresosHoy: data.ingresosHoy || 0,

            gananciaNeta: data.ingresosHoy || 0,
          });
        },
      );
    },
  );
});

export default router;
