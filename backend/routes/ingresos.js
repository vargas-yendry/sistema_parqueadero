const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.post("/", (req, res) => {
  const {
  placa,
  tipo,
  cascos = 0,
  modalidad = "HORA"
} = req.body;

  db.get(
  `SELECT ficha
   FROM vehiculos
   WHERE placa = ?
   AND estado = 'ACTIVO'`,
  [placa.toUpperCase()],
  (err, existe) => {

    if (err) {
      return res.status(500).json(err);
    }

    if (existe) {
      return res.status(409).json({
        mensaje: `La placa ${placa.toUpperCase()} ya está dentro del parqueadero`,
        ficha: existe.ficha
      });
    }

    continuarRegistro();
  }
);

  function continuarRegistro() {

    if (!placa) {
      return res.status(400).json({ mensaje: "Placa requerida" });
    }

    db.all(
      `SELECT ficha FROM vehiculos WHERE estado='ACTIVO'`,
      [],
      (err, rows) => {
        if (err) return res.status(500).json(err);

        const usadas = rows.map(r => parseInt(r.ficha.replace("F-", "")));

        let numeroFicha = 1;
        while (usadas.includes(numeroFicha)) {
          numeroFicha++;
        }

        const ficha = `F-${String(numeroFicha).padStart(4, "0")}`;

        db.run(
          `INSERT INTO vehiculos (
placa,
tipo,
ficha,
cascos,
horaIngreso,
estado,
modalidad
)
VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
placa,
tipo || "MOTO",
ficha,
parseInt(cascos),
new Date().toISOString(),
"ACTIVO",
modalidad
],
          function (err) {
            if (err) return res.status(500).json(err);
            res.json({ mensaje: "Ingreso registrado", placa, ficha, id: this.lastID });
          }
        );
      }
    );
  }
});

module.exports = router;
