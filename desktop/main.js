import { fork } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { app, BrowserWindow, dialog } from "electron";

import { resolverCarpetaDatos } from "./carpeta-datos.js";
import { crearVentana } from "./ventana.js";

const carpetaActual = path.dirname(fileURLToPath(import.meta.url));
const raizProyecto = path.join(carpetaActual, "..");

/** Si se define, la interfaz se carga desde el servidor de Vite en vez de dist/. */
const urlDesarrollo = process.env.PARQUEADERO_UI_URL;

/** Cuánto se espera a que el servidor avise que está listo antes de rendirse. */
const ESPERA_SERVIDOR = 15_000;

let servidor = null;
let cerrando = false;

// Windows agrupa la ventana y las notificaciones por este identificador; sin él
// la app sale suelta en la barra de tareas.
app.setAppUserModelId("com.parqueadero.yg");

// Salida para un equipo con tarjeta gráfica problemática: se arranca con
// PARQUEADERO_SIN_GPU=1 y se dibuja por software.
if (process.env.PARQUEADERO_SIN_GPU) {
  app.disableHardwareAcceleration();
}

// Dos instancias pelearían por el puerto de la API. La segunda le cede el turno
// a la primera y se cierra.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", enfocarVentanaExistente);
  arrancar();
}

async function arrancar() {
  await app.whenReady();

  try {
    await iniciarServidor();
  } catch (error) {
    mostrarFalloYSalir(error);
    return;
  }

  crearVentana({ raizProyecto, urlDesarrollo });
}

/**
 * Lanza la API como proceso hijo y espera a que ella misma avise que ya escucha.
 * Antes se esperaba un tiempo fijo y a ojo: en un equipo lento la ventana
 * cargaba antes que la API y salía sin datos.
 */
function iniciarServidor() {
  // Siempre el servidor ya empaquetado (dist-servidor/servidor.cjs), nunca el
  // código fuente: en ESM y sin empaquetar no encuentra sus dependencias dentro
  // del .asar. Lo genera `pnpm run build:servidor`.
  const rutaServidor = app.isPackaged
    ? path.join(process.resourcesPath, "app.asar.unpacked", "dist-servidor", "servidor.cjs")
    : path.join(raizProyecto, "dist-servidor", "servidor.cjs");

  const carpetaDatos = resolverCarpetaDatos({
    empaquetada: app.isPackaged,
    carpetaUsuario: app.getPath("userData"),
    raizProyecto,
    entorno: process.env,
  });

  console.log("Datos del parqueadero en:", carpetaDatos);

  servidor = fork(rutaServidor, [], {
    env: { ...process.env, PARQUEADERO_DATOS: carpetaDatos },
  });

  return new Promise((resolver, rechazar) => {
    const plazo = setTimeout(() => {
      rechazar(new Error("El servidor no respondió a tiempo."));
    }, ESPERA_SERVIDOR);

    servidor.on("message", (mensaje) => {
      if (mensaje?.tipo === "listo") {
        clearTimeout(plazo);
        resolver();
        return;
      }

      if (mensaje?.tipo === "error") {
        clearTimeout(plazo);
        rechazar(
          new Error(
            mensaje.motivo === "puerto-ocupado"
              ? `El puerto ${mensaje.puerto} ya está ocupado por otro programa.\n\n` +
                  "Puede ser otra copia de la app que quedó abierta. Cierra sesión o reinicia el equipo."
              : "El servidor no pudo arrancar.",
          ),
        );
      }
    });

    servidor.on("error", (error) => {
      clearTimeout(plazo);
      rechazar(error);
    });

    servidor.on("exit", (codigo) => {
      clearTimeout(plazo);
      servidor = null;

      if (!cerrando) {
        rechazar(new Error(`El servidor se cerró solo (código ${codigo}).`));
      }
    });
  });
}

function enfocarVentanaExistente() {
  const [ventana] = BrowserWindow.getAllWindows();

  if (!ventana) return;

  if (ventana.isMinimized()) ventana.restore();
  ventana.focus();
}

function mostrarFalloYSalir(error) {
  dialog.showErrorBox("No se pudo iniciar el Parqueadero", String(error.message ?? error));
  detenerServidor();
  app.quit();
}

function detenerServidor() {
  cerrando = true;

  if (!servidor) return;

  // El servidor también se apaga solo al perder el canal de IPC; esto es para
  // que el cierre normal sea inmediato.
  servidor.kill();
  servidor = null;
}

app.on("window-all-closed", () => {
  detenerServidor();
  app.quit();
});

app.on("before-quit", detenerServidor);

// Aviso claro si el paquete quedó incompleto, en vez de una ventana en blanco.
app.on("ready", () => {
  const interfaz = path.join(raizProyecto, "dist", "index.html");

  if (!urlDesarrollo && !fs.existsSync(interfaz)) {
    dialog.showErrorBox(
      "Falta la interfaz",
      `No se encontró ${interfaz}.\n\nEn desarrollo: corre "make build" antes de "make app".`,
    );
  }
});
