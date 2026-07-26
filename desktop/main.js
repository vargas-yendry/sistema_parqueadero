import { fork } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { app, BrowserWindow, Menu } from "electron";

const carpetaActual = path.dirname(fileURLToPath(import.meta.url));
const raizProyecto = path.join(carpetaActual, "..");

/** Si se define, la interfaz se carga desde el servidor de Vite en vez de dist/. */
const urlDesarrollo = process.env.PARQUEADERO_UI_URL;

let servidor = null;

function iniciarServidor() {
  // Siempre el servidor ya empaquetado (dist-servidor/servidor.cjs), nunca el
  // código fuente: en ESM y sin empaquetar no encuentra sus dependencias dentro
  // del .asar. Lo genera `pnpm run build:servidor`.
  const rutaServidor = app.isPackaged
    ? path.join(process.resourcesPath, "app.asar.unpacked", "dist-servidor", "servidor.cjs")
    : path.join(raizProyecto, "dist-servidor", "servidor.cjs");

  // Instalado, la base de datos no puede vivir dentro de Archivos de programa.
  const carpetaDatos = app.isPackaged
    ? path.join(app.getPath("userData"), "datos")
    : path.join(raizProyecto, "data");

  servidor = fork(rutaServidor, [], {
    env: { ...process.env, PARQUEADERO_DATOS: carpetaDatos },
  });
}

function crearVentana() {
  const ventana = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    backgroundColor: "#060d18",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  Menu.setApplicationMenu(null);
  ventana.once("ready-to-show", () => ventana.show());

  if (urlDesarrollo) {
    ventana.loadURL(urlDesarrollo);
  } else {
    ventana.loadFile(path.join(raizProyecto, "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  iniciarServidor();

  // Margen para que Express abra el puerto antes del primer render.
  setTimeout(crearVentana, 1500);
});

app.on("window-all-closed", () => {
  if (servidor) {
    servidor.kill();
  }

  app.quit();
});
