const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const { fork } = require("child_process");

let servidor = null;

function iniciarBackend() {

  const backendPath =
  app.isPackaged
    ? path.join(
        process.resourcesPath,
        "app.asar.unpacked",
        "backend",
        "server.js"
      )
    : path.join(
        __dirname,
        "../backend/server.js"
      );

servidor = fork(backendPath);

}

function crearVentana() {

  const win = new BrowserWindow({

    width: 1400,
    height: 900,

    webPreferences: {

      nodeIntegration: false,
      contextIsolation: true

    }

  });

  Menu.setApplicationMenu(null);

  win.loadFile(

    path.join(
      __dirname,
      "../frontend/dist/index.html"
    )

  );

}

app.whenReady().then(() => {

  iniciarBackend();

  setTimeout(() => {

    crearVentana();

  }, 2000);

});

app.on("window-all-closed", () => {

  if (servidor) {

    servidor.kill();

  }

  app.quit();

});