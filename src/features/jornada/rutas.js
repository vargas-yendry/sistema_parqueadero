import express from "express";
const router = express.Router();
import db from "../../servidor/base-datos.js";

router.post("/", (req, res) => {
  const fechaCorte = new Date().toISOString();

  db.run(
    `
    INSERT OR REPLACE INTO configuracion(
      clave,
      valor
    )
    VALUES(
      'ultimaLiquidacion',
      ?
    )
    `,

    [fechaCorte],

    function (err) {
      if (err) {
        return res.status(500).json(err);
      }

      db.run(
        `
        UPDATE vehiculos
        SET estado='SALIO'
        WHERE estado='ACTIVO'
        `,

        [],

        function (err) {
          if (err) {
            return res.status(500).json(err);
          }

          res.json({
            mensaje: "Nuevo día iniciado",
          });
        },
      );
    },
  );
});

export default router;
