import axios from "axios";

/**
 * Cliente HTTP contra la API local del parqueadero.
 *
 * La app instalada abre la interfaz con file://, así que la URL debe ser absoluta.
 *
 * Va a 127.0.0.1 y no a "localhost" a propósito: en muchos equipos (este
 * incluido) "localhost" resuelve primero a ::1, y el servidor solo escucha en
 * IPv4 para no quedar expuesto en la red del local. Con la IP explícita no
 * dependemos de en qué orden resuelva cada sistema.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3333/api",
  timeout: 10_000,
});
