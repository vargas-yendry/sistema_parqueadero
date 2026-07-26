import sqlite3 from "sqlite3";

import { prepararCarpetas, rutaBaseDatos } from "./rutas-datos.js";

prepararCarpetas();

const db = new sqlite3.Database(rutaBaseDatos, (error) => {
  if (error) {
    console.error("Error conectando SQLite:", error.message);
    return;
  }

  console.log("Base de datos SQLite conectada:", rutaBaseDatos);
  crearEsquema();
});

function crearEsquema() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        usuario TEXT UNIQUE,
        password TEXT,
        rol TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS vehiculos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        placa TEXT,
        tipo TEXT,
        ficha TEXT,
        cascos INTEGER DEFAULT 0,
        horaIngreso DATETIME,
        estado TEXT,
        modalidad TEXT DEFAULT 'HORA'
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS salidas(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        placa TEXT,
        ficha TEXT,
        horaIngreso DATETIME,
        horaSalida DATETIME,
        tiempo TEXT,
        valor REAL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS mensualidades(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente TEXT NOT NULL,
        placa TEXT NOT NULL,
        telefono TEXT,
        fechaInicio DATE,
        fechaVencimiento DATE,
        valor REAL DEFAULT 0
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS gastos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        concepto TEXT NOT NULL,
        valor REAL DEFAULT 0,
        fecha DATE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS accesorios(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        emoji TEXT,
        precio REAL DEFAULT 0,
        costo REAL DEFAULT 0,
        ganancia REAL DEFAULT 0,
        stock INTEGER DEFAULT 0,
        minStock INTEGER DEFAULT 5,
        ventas INTEGER DEFAULT 0
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS ventas_accesorios(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        accesorioId INTEGER,
        producto TEXT,
        cantidad INTEGER,
        precio REAL,
        costo REAL,
        ganancia REAL,
        total REAL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS configuracion(
        clave TEXT PRIMARY KEY,
        valor TEXT
      )
    `);

    aplicarMigraciones();

    console.log("Tablas listas");
  });
}

/**
 * Columnas añadidas después de la primera versión.
 * SQLite no tiene ADD COLUMN IF NOT EXISTS: si la columna ya está, el error se ignora.
 */
function aplicarMigraciones() {
  const columnas = [
    "ALTER TABLE vehiculos ADD COLUMN cascos INTEGER DEFAULT 0",
    "ALTER TABLE vehiculos ADD COLUMN modalidad TEXT DEFAULT 'HORA'",
    "ALTER TABLE accesorios ADD COLUMN costo REAL DEFAULT 0",
    "ALTER TABLE accesorios ADD COLUMN ganancia REAL DEFAULT 0",
    "ALTER TABLE ventas_accesorios ADD COLUMN costo REAL DEFAULT 0",
    "ALTER TABLE ventas_accesorios ADD COLUMN ganancia REAL DEFAULT 0",
  ];

  for (const sentencia of columnas) {
    db.run(sentencia, () => {});
  }
}

export default db;
