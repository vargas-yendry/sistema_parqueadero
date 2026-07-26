/** Tarifas que se usan cuando el cliente no manda las suyas. */
export const TARIFAS_DEFECTO = {
  tarifaMoto: 1000,
  tarifaCarro: 2000,
  tarifaMotoDia: 8000,
  tarifaCarroDia: 15000,
  tarifaMotoNoche: 5000,
  tarifaCarroNoche: 10000,
};

/** Se cobra una hora cada 65 minutos: hay 5 minutos de gracia por hora. */
const MINUTOS_POR_HORA_COBRADA = 65;

/** Minutos completos entre el ingreso y la salida. */
export function calcularMinutos(horaIngreso, horaSalida = new Date()) {
  const entrada = new Date(horaIngreso);
  const salida = new Date(horaSalida);

  return Math.floor((salida - entrada) / 1000 / 60);
}

/**
 * Cuánto se le cobra a un vehículo.
 *
 * Por DIA y por NOCHE es tarifa plana; por hora se cobra mínimo una hora y
 * después una hora más por cada 65 minutos empezados.
 */
export function calcularCobro({ tipo, modalidad, minutos, tarifas = {} }) {
  const precios = { ...TARIFAS_DEFECTO, ...limpiarTarifas(tarifas) };
  const esCarro = tipo === "CARRO";

  if (modalidad === "DIA") {
    return esCarro ? precios.tarifaCarroDia : precios.tarifaMotoDia;
  }

  if (modalidad === "NOCHE") {
    return esCarro ? precios.tarifaCarroNoche : precios.tarifaMotoNoche;
  }

  const tarifaBase = esCarro ? precios.tarifaCarro : precios.tarifaMoto;
  const horas = Math.max(1, Math.ceil(minutos / MINUTOS_POR_HORA_COBRADA));

  return tarifaBase * horas;
}

/** Las tarifas llegan por HTTP: pueden venir como texto o venir vacías. */
function limpiarTarifas(tarifas) {
  return Object.fromEntries(
    Object.entries(tarifas)
      .map(([clave, valor]) => [clave, Number(valor)])
      .filter(([, valor]) => Number.isFinite(valor) && valor > 0),
  );
}
