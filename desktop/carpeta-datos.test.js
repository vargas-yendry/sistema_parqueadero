import path from "node:path";

import { describe, expect, it } from "vitest";

import { carpetaPortatil, resolverCarpetaDatos } from "./carpeta-datos.js";

// Las rutas se arman con path.join porque el separador cambia entre Windows y Linux.
const CARPETA_USUARIO = path.join("/home", "ana", ".config", "parqueadero-yg");
const USB = path.join("/mnt", "usb");
const DATOS_USB = path.join(USB, "datos");
const APPIMAGE = path.join(USB, "parqueadero-yg.AppImage");

const BASE = {
  empaquetada: true,
  carpetaUsuario: CARPETA_USUARIO,
  raizProyecto: path.join("/repo"),
  existe: () => false,
};

describe("resolverCarpetaDatos", () => {
  it("respeta PARQUEADERO_DATOS por encima de todo", () => {
    const carpeta = resolverCarpetaDatos({
      ...BASE,
      entorno: { PARQUEADERO_DATOS: path.join(USB, "parqueadero") },
    });

    expect(carpeta).toBe(path.resolve(path.join(USB, "parqueadero")));
  });

  it("en desarrollo usa la carpeta data/ del repo", () => {
    const carpeta = resolverCarpetaDatos({ ...BASE, empaquetada: false, entorno: {} });

    expect(carpeta).toBe(path.join("/repo", "data"));
  });

  it("instalada guarda en la carpeta del usuario", () => {
    expect(resolverCarpetaDatos({ ...BASE, entorno: {} })).toBe(
      path.join(CARPETA_USUARIO, "datos"),
    );
  });

  it("no escribe junto al programa aunque sea portátil, si no existe la carpeta datos", () => {
    const carpeta = resolverCarpetaDatos({
      ...BASE,
      entorno: { APPIMAGE },
      existe: () => false,
    });

    expect(carpeta).toBe(path.join(CARPETA_USUARIO, "datos"));
  });

  it("modo portátil: con una carpeta datos junto al AppImage, guarda ahí", () => {
    const carpeta = resolverCarpetaDatos({
      ...BASE,
      entorno: { APPIMAGE },
      existe: (ruta) => ruta === DATOS_USB,
    });

    expect(carpeta).toBe(DATOS_USB);
  });

  it("modo portátil también con el ejecutable portable de Windows", () => {
    const carpeta = resolverCarpetaDatos({
      ...BASE,
      entorno: { PORTABLE_EXECUTABLE_DIR: USB },
      existe: (ruta) => ruta === DATOS_USB,
    });

    expect(carpeta).toBe(DATOS_USB);
  });
});

describe("carpetaPortatil", () => {
  it("del AppImage saca la carpeta donde está el archivo", () => {
    expect(carpetaPortatil({ APPIMAGE: path.join(USB, "app.AppImage") })).toBe(DATOS_USB);
  });

  it("es null cuando la app no corre en formato portátil", () => {
    expect(carpetaPortatil({})).toBeNull();
  });
});
