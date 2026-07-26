/** Días antes del vencimiento en los que la mensualidad ya se avisa como "Por vencer". */
const DIAS_DE_AVISO = 5;

const MILISEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;

/**
 * Estado de una mensualidad según lo que le falta para vencer:
 * "Vencida" el mismo día del vencimiento, "Por vencer" en los últimos 5 días.
 */
export function obtenerEstado(fechaVencimiento) {
  const hoy = new Date();
  const vence = new Date(fechaVencimiento);
  const dias = Math.ceil((vence - hoy) / MILISEGUNDOS_POR_DIA);

  if (dias <= 0) {
    return "Vencida";
  }

  if (dias <= DIAS_DE_AVISO) {
    return "Por vencer";
  }

  return "Activa";
}
