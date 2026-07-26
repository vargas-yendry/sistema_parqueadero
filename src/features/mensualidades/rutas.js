import express from "express";
const router = express.Router();
import db from "../../servidor/base-datos.js";

// Listar
router.get("/", (req, res) => {

  db.all(
    "SELECT * FROM mensualidades ORDER BY id DESC",
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json(rows);

    }
  );

});

// Crear
router.post("/", (req, res) => {

  const {
    cliente,
    placa,
    telefono,
    fechaInicio,
    fechaVencimiento,
    valor
  } = req.body;

  db.run(

    `INSERT INTO mensualidades(
      cliente,
      placa,
      telefono,
      fechaInicio,
      fechaVencimiento,
      valor
    )
    VALUES(?,?,?,?,?,?)`,

    [
      cliente,
      placa,
      telefono,
      fechaInicio,
      fechaVencimiento,
      valor
    ],

    function(err){

      if(err){
        return res.status(500).json(err);
      }

      res.json({
        id: this.lastID,
        mensaje: "Mensualidad creada"
      });

    }

  );

});

// Eliminar
router.delete("/:id", (req,res)=>{

  db.run(

    "DELETE FROM mensualidades WHERE id=?",

    [req.params.id],

    function(err){

      if(err){
        return res.status(500).json(err);
      }

      res.json({
        mensaje:"Mensualidad eliminada"
      });

    }

  );

});

// Actualizar mensualidad
router.put("/:id", (req, res) => {

  const {
    cliente,
    placa,
    telefono,
    fechaInicio,
    fechaVencimiento,
    valor
  } = req.body;

  db.run(

    `UPDATE mensualidades
     SET
       cliente=?,
       placa=?,
       telefono=?,
       fechaInicio=?,
       fechaVencimiento=?,
       valor=?
     WHERE id=?`,

    [
      cliente,
      placa,
      telefono,
      fechaInicio,
      fechaVencimiento,
      valor,
      req.params.id
    ],

    function(err){

      if(err){
        return res.status(500).json(err);
      }

      res.json({
        mensaje:"Mensualidad actualizada"
      });

    }

  );

});

export default router;