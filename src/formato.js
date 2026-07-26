import { addDays, format, parseISO } from "date-fns";

const PESOS = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const FECHA = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const HORA = new Intl.DateTimeFormat("es-CO", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

/** Valor en pesos colombianos, sin decimales: 12000 → "$ 12.000". */
export function formatearPesos(valor) {
  return PESOS.format(Number(valor) || 0);
}

/** Fecha corta: "26/07/2026". Devuelve "—" si la fecha no sirve. */
export function formatearFecha(fecha) {
  const valor = aFecha(fecha);
  return valor ? FECHA.format(valor) : "—";
}

/** Hora del día: "09:30 p. m.". Devuelve "—" si la fecha no sirve. */
export function formatearHora(fecha) {
  const valor = aFecha(fecha);
  return valor ? HORA.format(valor) : "—";
}

/** Fecha y hora juntas: "26/07/2026 09:30 p. m.". */
export function formatearFechaHora(fecha) {
  const valor = aFecha(fecha);
  return valor ? `${FECHA.format(valor)} ${HORA.format(valor)}` : "—";
}

/**
 * Fecha en formato AAAA-MM-DD para mandar a la API, en hora LOCAL.
 *
 * Con `toISOString()` la fecha se calcula en UTC: como Colombia va cinco horas
 * atrás, todo lo que se guardara entre las 7:00 p.m. y la medianoche quedaba
 * fechado al día siguiente — y el parqueadero atiende hasta las 9:30 p.m.
 */
export function fechaParaApi(fecha = new Date()) {
  return format(comoFechaLocal(fecha), "yyyy-MM-dd");
}

/** La misma fecha corrida N días, lista para la API. */
export function fechaMasDias(dias, desde = new Date()) {
  return fechaParaApi(addDays(comoFechaLocal(desde), dias));
}

/**
 * Las fechas de los <input type="date"> llegan como "2026-08-01", y `new Date()`
 * las interpreta en UTC. `parseISO` las toma como el día local que el usuario vio.
 */
function comoFechaLocal(fecha) {
  return typeof fecha === "string" ? parseISO(fecha) : fecha;
}

function aFecha(fecha) {
  if (!fecha) {
    return null;
  }

  const valor = fecha instanceof Date ? fecha : new Date(fecha);
  return Number.isNaN(valor.getTime()) ? null : valor;
}
