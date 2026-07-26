// Fuentes empaquetadas: la app instalada puede quedar sin internet.
// Solo el subconjunto latino: los demás alfabetos pesan y aquí no se usan.
import "@fontsource/rajdhani/latin-400.css";
import "@fontsource/rajdhani/latin-500.css";
import "@fontsource/rajdhani/latin-600.css";
import "@fontsource/rajdhani/latin-700.css";
import "@fontsource-variable/inter"; // variable: un solo archivo por rango unicode
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-600.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./estilos.css";
import { Toaster } from "./interfaz/sonner.jsx";

const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={clienteConsultas}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
