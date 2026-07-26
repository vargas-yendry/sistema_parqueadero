const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const ingresosRoutes = require("./routes/ingresos");
const vehiculosRoutes = require("./routes/vehiculos");
const salidasRoutes = require("./routes/salidas");
const mensualidadesRoutes = require("./routes/mensualidades");
const accesoriosRoutes = require("./routes/accesorios");
const reportesRoutes = require("./routes/reportes");
const gastosRoutes = require("./routes/gastos");
const nuevoDiaRoutes = require("./routes/nuevoDia");

require("./database/db");

const app = express();

app.use(cors());
app.use(express.json());

console.log("Cargando rutas...");

app.use("/api/ingresos", ingresosRoutes);
app.use("/api/vehiculos", vehiculosRoutes);
app.use("/api/salidas", salidasRoutes);
app.use("/api/mensualidades", mensualidadesRoutes);
app.use("/api/accesorios", accesoriosRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/gastos", gastosRoutes);
app.use("/api/nuevo-dia", nuevoDiaRoutes);

app.get("/", (req, res) => {
  res.json({
    mensaje: "Servidor Parqueadero Y&G funcionando 🚀"
  });
});

const PORT = 3333;

function crearBackupAutomatico() {

  try {

    const dbOrigen =
      path.join(
        __dirname,
        "database",
        "parqueadero.db"
      );

    const carpetaBackup =
      path.join(
        __dirname,
        "backup"
      );

    if (!fs.existsSync(carpetaBackup)) {

      fs.mkdirSync(carpetaBackup);

    }

    const fecha =
      new Date()
        .toISOString()
        .replace(/:/g, "-")
        .split(".")[0];

    const destino =
      path.join(
        carpetaBackup,
        `parqueadero_${fecha}.db`
      );

    fs.copyFileSync(
      dbOrigen,
      destino
    );

    // Mantener máximo 30 backups

const backups = fs
  .readdirSync(carpetaBackup)
  .filter(
    archivo => archivo.endsWith(".db")
  )
  .sort();

if(backups.length > 30){

  const cantidadEliminar =
    backups.length - 30;

  for(
    let i = 0;
    i < cantidadEliminar;
    i++
  ){

    fs.unlinkSync(
      path.join(
        carpetaBackup,
        backups[i]
      )
    );

    console.log(
      "🗑 Backup eliminado:",
      backups[i]
    );

  }

}

    console.log(
      "✅ Backup creado:",
      destino
    );

  } catch (error) {

    console.log(
      "❌ Error creando backup:",
      error
    );

  }

}

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  crearBackupAutomatico();
});