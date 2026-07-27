import path from "node:path";

import { BrowserWindow, Menu, dialog, shell } from "electron";

/**
 * Menú de la app.
 *
 * Va oculto (`autoHideMenuBar`) porque es una pantalla de mostrador, pero
 * existe: los roles de edición dejan garantizados Ctrl+C / Ctrl+V / Ctrl+X /
 * Ctrl+A donde se digitan las placas, sin depender de si Chromium los maneja
 * por su cuenta. Se muestra con Alt.
 */
function construirMenu() {
  return Menu.buildFromTemplate([
    {
      label: "Edición",
      submenu: [
        { role: "undo", label: "Deshacer" },
        { role: "redo", label: "Rehacer" },
        { type: "separator" },
        { role: "cut", label: "Cortar" },
        { role: "copy", label: "Copiar" },
        { role: "paste", label: "Pegar" },
        { role: "selectAll", label: "Seleccionar todo" },
      ],
    },
    {
      label: "Ver",
      submenu: [
        { role: "reload", label: "Recargar" },
        { role: "togglefullscreen", label: "Pantalla completa" },
        { type: "separator" },
        { role: "resetZoom", label: "Tamaño normal" },
        { role: "zoomIn", label: "Acercar" },
        { role: "zoomOut", label: "Alejar" },
      ],
    },
  ]);
}

/** Clic derecho sobre un campo de texto: copiar y pegar sin tocar el teclado. */
function menuContextual(ventana) {
  ventana.webContents.on("context-menu", (evento, parametros) => {
    if (!parametros.isEditable && !parametros.selectionText) {
      return;
    }

    Menu.buildFromTemplate([
      { role: "cut", label: "Cortar", enabled: parametros.isEditable },
      { role: "copy", label: "Copiar", enabled: Boolean(parametros.selectionText) },
      { role: "paste", label: "Pegar", enabled: parametros.isEditable },
      { type: "separator" },
      { role: "selectAll", label: "Seleccionar todo" },
    ]).popup({ window: ventana });
  });
}

/**
 * La interfaz es local y no navega a ninguna parte: cualquier intento de salir
 * o de abrir una ventana nueva se manda al navegador del sistema, nunca dentro
 * de la app.
 */
function blindarNavegacion(ventana) {
  ventana.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }

    return { action: "deny" };
  });

  ventana.webContents.on("will-navigate", (evento, url) => {
    const esLaApp = url.startsWith("file://") || url.startsWith("http://localhost:5173");

    if (!esLaApp) {
      evento.preventDefault();
    }
  });
}

/** Si la pantalla se cae o se cuelga, se dice qué pasó en vez de quedarse tiesa. */
function vigilarFallos(ventana) {
  ventana.webContents.on("render-process-gone", (evento, detalle) => {
    dialog.showErrorBox(
      "La pantalla se cerró sola",
      `Motivo: ${detalle.reason}.\n\nCierra y vuelve a abrir el Parqueadero. Los datos guardados están a salvo.`,
    );
  });

  ventana.on("unresponsive", () => {
    const respuesta = dialog.showMessageBoxSync(ventana, {
      type: "warning",
      buttons: ["Esperar", "Recargar"],
      defaultId: 0,
      title: "La app no responde",
      message: "La pantalla dejó de responder. ¿Esperas o la recargas?",
    });

    if (respuesta === 1) {
      ventana.webContents.reload();
    }
  });
}

/**
 * Abre la ventana de la app.
 *
 * @param urlDesarrollo  Si viene, se carga desde el servidor de Vite; si no, del build.
 */
export function crearVentana({ raizProyecto, urlDesarrollo }) {
  Menu.setApplicationMenu(construirMenu());

  const ventana = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#060d18",
    webPreferences: {
      // La interfaz no necesita nada de Node: cuanto más encerrada, mejor.
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  ventana.once("ready-to-show", () => ventana.show());

  menuContextual(ventana);
  blindarNavegacion(ventana);
  vigilarFallos(ventana);

  if (urlDesarrollo) {
    ventana.loadURL(urlDesarrollo);
  } else {
    ventana.loadFile(path.join(raizProyecto, "dist", "index.html"));
  }

  return ventana;
}
