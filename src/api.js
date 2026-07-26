import axios from "axios";

/**
 * Cliente HTTP contra la API local del parqueadero.
 * La app instalada abre la interfaz con file://, así que la URL debe ser absoluta.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3333/api",
  timeout: 10_000,
});
