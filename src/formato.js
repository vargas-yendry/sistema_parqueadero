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

function aFecha(fecha) {
  if (!fecha) {
    return null;
  }

  const valor = fecha instanceof Date ? fecha : new Date(fecha);
  return Number.isNaN(valor.getTime()) ? null : valor;
}
