import path from "node:path";

import { defineConfig } from "vite";

/**
 * Empaqueta la API en UN archivo CommonJS.
 *
 * Por qué: dentro del instalador el servidor queda FUERA del `.asar` (necesita
 * el binario nativo de sqlite3) pero sus dependencias quedan DENTRO. Electron
 * sabe leer dentro del `.asar` con `require`, pero NO con `import`: un servidor
 * en ESM y sin empaquetar no encuentra express ni cors, y la app instalada
 * arranca con la ventana abierta y la API muerta.
 *
 * Al meter todo en un CommonJS ya no hay nada que resolver en tiempo de
 * ejecución. `sqlite3` se deja fuera a propósito: es binario nativo y se
 * resuelve desde node_modules, que también va desempaquetado.
 *
 * El target es node16 aunque hoy se corra sobre Node 22: no cuesta nada y deja
 * abierta la puerta a empaquetar con una Electron vieja.
 */
export default defineConfig({
  // El servidor no sirve archivos estáticos: sin esto Vite le copia public/ al lado.
  publicDir: false,

  build: {
    ssr: "src/servidor/index.js",
    outDir: "dist-servidor",
    emptyOutDir: true,
    target: "node16",
    minify: false,
    rollupOptions: {
      external: ["sqlite3"],
      output: {
        format: "cjs",
        entryFileNames: "servidor.cjs",
        codeSplitting: false,
      },
    },
  },

  ssr: {
    // Sin esto Vite deja las dependencias fuera del paquete, que es el problema a resolver.
    noExternal: true,
    external: ["sqlite3"],
  },

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
