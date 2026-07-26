const express = require("express");
const router = express.Router();
const db = require("../database/db");

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

module.exports = router;