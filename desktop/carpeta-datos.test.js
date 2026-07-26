import { describe, expect, it } from "vitest";

import { carpetaPortatil, resolverCarpetaDatos } from "./carpeta-datos.js";

const BASE = {
  empaquetada: true,
  carpetaUsuario: "/home/ana/.config/parqueadero-yg",
  raizProyecto: "/repo",
  existe: () => false,
};

describe("resolverCarpetaDatos", () => {
  it("respeta PARQUEADERO_DATOS por encima de todo", () => {
    const carpeta = resolverCarpetaDatos({
      ...BASE,
      entorno: { PARQUEADERO_DATOS: "/mnt/usb/parqueadero" },
    });

    expect(carpeta).toBe("/mnt/usb/parqueadero");
  });

  it("en desarrollo usa la carpeta data/ del repo", () => {
    const carpeta = resolverCarpetaDatos({ ...BASE, empaquetada: false, entorno: {} });

    expect(carpeta).toBe("/repo/data");
  });

  it("instalada guarda en la carpeta del usuario", () => {
    expect(resolverCarpetaDatos({ ...BASE, entorno: {} })).toBe(
      "/home/ana/.config/parqueadero-yg/datos",
    );
  });

  it("no escribe junto al programa aunque sea portátil, si no existe la carpeta datos", () => {
    const carpeta = resolverCarpetaDatos({
      ...BASE,
      entorno: { APPIMAGE: "/mnt/usb/parqueadero-yg.AppImage" },
      existe: () => false,
    });

    expect(carpeta).toBe("/home/ana/.config/parqueadero-yg/datos");
  });

  it("modo portátil: con una carpeta datos junto al AppImage, guarda ahí", () => {
    const carpeta = resolverCarpetaDatos({
      ...BASE,
      entorno: { APPIMAGE: "/mnt/usb/parqueadero-yg.AppImage" },
      existe: (ruta) => ruta === "/mnt/usb/datos",
    });

    expect(carpeta).toBe("/mnt/usb/datos");
  });

  it("modo portátil también con el ejecutable portable de Windows", () => {
    const carpeta = resolverCarpetaDatos({
      ...BASE,
      entorno: { PORTABLE_EXECUTABLE_DIR: "/mnt/usb" },
      existe: (ruta) => ruta === "/mnt/usb/datos",
    });

    expect(carpeta).toBe("/mnt/usb/datos");
  });
});

describe("carpetaPortatil", () => {
  it("del AppImage saca la carpeta donde está el archivo", () => {
    expect(carpetaPortatil({ APPIMAGE: "/mnt/usb/app.AppImage" })).toBe("/mnt/usb/datos");
  });

  it("es null cuando la app no corre en formato portátil", () => {
    expect(carpetaPortatil({})).toBeNull();
  });
});
