import express from "express";
const router = express.Router();
import db from "../../servidor/base-datos.js";

router.get("/", (req, res) => {
  const filtro = req.query.filtro || "Hoy";

  let condicion = "";

  if (filtro === "Hoy") {
    condicion = "DATE(fecha)=DATE('now','localtime')";
  }

  if (filtro === "Semana") {
    condicion = "fecha >= date('now','-7 day')";
  }

  if (filtro === "Mes") {
    condicion = "strftime('%Y-%m',fecha)=strftime('%Y-%m','now')";
  }

  if (filtro === "Año") {
    condicion = "strftime('%Y',fecha)=strftime('%Y','now')";
  }

  db.all(
    `
    SELECT *
    FROM gastos
    WHERE ${condicion}
    ORDER BY fecha DESC
    `,

    [],

    (err, rows) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(rows);
    },
  );
});
router.post("/", (req, res) => {
  const { concepto, valor, fecha } = req.body;

  db.run(
    `
    INSERT INTO gastos(
      concepto,
      valor,
      fecha
    )
    VALUES(?,?,?)
    `,
    [concepto, valor, fecha],
    function (err) {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        id: this.lastID,
      });
    },
  );
});

router.delete("/:id", (req, res) => {
  db.run("DELETE FROM gastos WHERE id=?", [req.params.id], function (err) {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      mensaje: "Eliminado",
    });
  });
});

export default router;
