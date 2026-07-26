import express from "express";
const router = express.Router();
import db from "../../servidor/base-datos.js";


// LISTAR
router.get("/", (req,res)=>{

  db.all(
    "SELECT * FROM accesorios ORDER BY nombre",
    [],
    (err,rows)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json(rows);

    }
  );

});


// CREAR
router.post("/",(req,res)=>{

  const {
  nombre,
  emoji,
  precio,
  costo,
  stock,
  minStock
} = req.body;

  db.run(

    `INSERT INTO accesorios(
  nombre,
  emoji,
  precio,
  costo,
  ganancia,
  stock,
  minStock
)
VALUES(?,?,?,?,?,?,?)`,

    [
  nombre,
  emoji,
  precio,
  costo,
  precio - costo,
  stock,
  minStock
],

    function(err){

      if(err){
        return res.status(500).json(err);
      }

      res.json({
        id:this.lastID
      });

    }

  );

});


// EDITAR
router.put("/:id",(req,res)=>{

  const {
  nombre,
  emoji,
  precio,
  costo,
  stock,
  minStock
} = req.body;

  db.run(

  `UPDATE accesorios
     SET
     nombre=?,
     emoji=?,
     precio=?,
     costo=?,
     ganancia=?,
     stock=?,
     minStock=?
     WHERE id=?`,

    [
  nombre,
  emoji,
  precio,
  costo,
  precio - costo,
  stock,
  minStock,
  req.params.id
],

    function(err){

      if(err){
        return res.status(500).json(err);
      }

      res.json({
        mensaje:"Actualizado"
      });

    }

  );

});


// ELIMINAR
router.delete("/:id",(req,res)=>{

  db.run(

    "DELETE FROM accesorios WHERE id=?",

    [req.params.id],

    function(err){

      if(err){
        return res.status(500).json(err);
      }

      res.json({
        mensaje:"Eliminado"
      });

    }

  );

});


// REGISTRAR VENTA
router.post("/venta/:id",(req,res)=>{

  const { cantidad } = req.body;

  db.get(

    "SELECT * FROM accesorios WHERE id=?",

    [req.params.id],

    (err, producto)=>{

      if(err){
        return res.status(500).json(err);
      }

      if(!producto){
        return res.status(404).json({
          mensaje:"Producto no encontrado"
        });
      }

      const total =
        producto.precio * cantidad;
      
      const ganancia =
  (producto.precio - producto.costo)
  * cantidad;

      db.run(

        `
        UPDATE accesorios
        SET
        stock = stock - ?,
        ventas = ventas + ?
        WHERE id=?
        `,

        [
          cantidad,
          cantidad,
          req.params.id
        ],

        function(err){

          if(err){
            return res.status(500).json(err);
          }

          db.run(

            `
            INSERT INTO ventas_accesorios(
  accesorioId,
  producto,
  cantidad,
  precio,
  costo,
  ganancia,
  total
)
VALUES(?,?,?,?,?,?,?)
            `,

            [
  producto.id,
  producto.nombre,
  cantidad,
  producto.precio,
  producto.costo,
  ganancia,
  total
],

            function(err){

              if(err){
                return res.status(500).json(err);
              }

              res.json({
                mensaje:"Venta registrada"
              });

            }

          );

        }

      );

    }

  );

});

// HISTORIAL DE VENTAS

router.get("/ventas/historial",(req,res)=>{

  db.all(

    `
    SELECT *
    FROM ventas_accesorios
    ORDER BY fecha DESC
    `,

    [],

    (err,rows)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json(rows);

    }

  );

});

export default router;