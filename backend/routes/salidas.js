const express = require("express");
const router = express.Router();
const db = require("../database/db");

// Buscar vehículo por ficha
router.post("/buscar", (req, res) => {

  const {
  ficha,

  tarifaMoto = 1000,
  tarifaCarro = 2000,

  tarifaMotoDia = 8000,
  tarifaCarroDia = 15000,

  tarifaMotoNoche = 5000,
  tarifaCarroNoche = 10000

} = req.body;

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
          mensaje: "Ficha no encontrada"
        });
      }

      const horaIngreso = new Date(vehiculo.horaIngreso);
      const horaSalida = new Date();

      const minutos = Math.floor(
        (horaSalida - horaIngreso) / 1000 / 60
      );

      let valor = 0;

if (vehiculo.modalidad === "DIA") {

  valor =
    vehiculo.tipo === "CARRO"
      ? Number(tarifaCarroDia)
      : Number(tarifaMotoDia);

}
else if (vehiculo.modalidad === "NOCHE") {

  valor =
    vehiculo.tipo === "CARRO"
      ? Number(tarifaCarroNoche)
      : Number(tarifaMotoNoche);

}
else {

  const tarifaBase =
    vehiculo.tipo === "CARRO"
      ? Number(tarifaCarro)
      : Number(tarifaMoto);

  const horas = Math.max(
    1,
    Math.ceil(minutos / 65)
  );

  valor = tarifaBase * horas;

}

      res.json({

        ...vehiculo,
        minutos,
        valor,
        horaSalida

      });

    }

  );

});

// Finalizar salida
router.post("/finalizar", (req, res) => {
  
  console.log("BODY FINALIZAR:", req.body);

  const {
    id,
    valor
  } = req.body;

  db.get(

    `SELECT * FROM vehiculos WHERE id=?`,

    [id],

    (err, vehiculo) => {

      if (err) {
        return res.status(500).json(err);
      }

      if (!vehiculo) {
        return res.status(404).json({
          mensaje: "Vehículo no encontrado"
        });
      }

      console.log("VEHICULO ENCONTRADO:");
console.log(vehiculo);

      const horaSalida = new Date();

      const minutos = Math.floor(
        (horaSalida - new Date(vehiculo.horaIngreso))
        / 1000 / 60
      );


      let valorFinal = 0;

if (vehiculo.modalidad === "DIA") {

  valorFinal =
    vehiculo.tipo === "CARRO"
      ? Number(req.body.tarifaCarroDia || 15000)
      : Number(req.body.tarifaMotoDia || 8000);

}
else if (vehiculo.modalidad === "NOCHE") {

  valorFinal =
    vehiculo.tipo === "CARRO"
      ? Number(req.body.tarifaCarroNoche || 10000)
      : Number(req.body.tarifaMotoNoche || 5000);

}
else {

  const tarifaBase =
    vehiculo.tipo === "CARRO"
      ? Number(req.body.tarifaCarro || 2000)
      : Number(req.body.tarifaMoto || 1000);

  const horas = Math.max(
    1,
    Math.ceil(minutos / 65)
  );

  valorFinal = tarifaBase * horas;

}
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
  valorFinal
],

        function(err){

          if(err){
            return res.status(500).json(err);
          }

          // liberar ficha
          db.run(

            `UPDATE vehiculos
             SET estado='SALIO'
             WHERE id=?`,

            [id],

            function(err){

              if(err){
                return res.status(500).json(err);
              }

              res.json({
                mensaje:"Salida registrada"
              });

            }

          );

        }

      );

    }

  );

});

// Estadísticas reales dashboard
router.get("/estadisticas", (req,res)=>{

  db.get(

    `
    SELECT valor
    FROM configuracion
    WHERE clave='ultimaLiquidacion'
    `,

    [],

    (err,config)=>{

      if(err){
        return res.status(500).json(err);
      }

      const fechaBase =
        config?.valor ||
        "2000-01-01";
      
      console.log(
  "ULTIMA LIQUIDACION:",
  fechaBase
);

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

        [
          fechaBase,
          fechaBase,
          fechaBase
        ],

        (err,data)=>{

          if(err){
            return res.status(500).json(err);
          }

          res.json({

            vehiculosHoy:
              data.vehiculosHoy || 0,

            salidasHoy:
              data.salidasHoy || 0,

            ingresosHoy:
              data.ingresosHoy || 0,

            gananciaNeta:
              data.ingresosHoy || 0

          });

        }

      );

    }

  );

});

module.exports = router;