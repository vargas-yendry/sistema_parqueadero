import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import sonarjs from "eslint-plugin-sonarjs";
import globals from "globals";

/** Rutas del servidor Express: viven junto a su feature pero corren en Node. */
const ARCHIVOS_SERVIDOR = [
  "src/servidor/**/*.js",
  "src/features/*/rutas.js",
  "desktop/**/*.js",
  "*.config.js",
  "vitest.setup.js",
];

export default [
  {
    ignores: ["dist/**", "instalador/**", "data/**", "coverage/**", "node_modules/**"],
  },

  js.configs.recommended,
  sonarjs.configs.recommended,

  // Interfaz: React en el navegador.
  {
    files: ["src/**/*.{js,jsx}"],
    ignores: ARCHIVOS_SERVIDOR,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@stylistic": stylistic,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },

  // Servidor y herramientas: Node.
  {
    files: ARCHIVOS_SERVIDOR,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    plugins: { "@stylistic": stylistic },
  },

  // Pruebas: Vitest expone describe/it/expect como globales.
  {
    files: ["src/**/*.test.{js,jsx}", "vitest.setup.js"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "sonarjs/no-duplicate-string": "off",
    },
  },

  // Prettier manda en formato: va de último para desactivar las reglas que chocan.
  prettier,
];
