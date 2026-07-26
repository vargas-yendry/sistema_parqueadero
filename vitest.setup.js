import "@testing-library/jest-dom/vitest";

/**
 * jsdom 29 ya no implementa Storage y el localStorage nativo de Node exige
 * --localstorage-file. En Electron existe de verdad, así que aquí basta con
 * una versión en memoria para que las pruebas puedan leer y escribir.
 */
if (typeof window !== "undefined" && !window.localStorage) {
  const datos = new Map();

  window.localStorage = {
    getItem: (clave) => (datos.has(clave) ? datos.get(clave) : null),
    setItem: (clave, valor) => datos.set(clave, String(valor)),
    removeItem: (clave) => datos.delete(clave),
    clear: () => datos.clear(),
    key: (indice) => [...datos.keys()][indice] ?? null,
    get length() {
      return datos.size;
    },
  };
}
