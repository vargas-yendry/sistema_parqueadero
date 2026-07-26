import express from "express";
const router = express.Router();
import db from "../../servidor/base-datos.js";

router.get("/", (req, res) => {

  db.all(

    `
    SELECT *
    FROM vehiculos
    WHERE estado='ACTIVO'
    ORDER BY ficha ASC
    `,

    [],

    (err, rows) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json(rows);

    }

  );

});

export default router;