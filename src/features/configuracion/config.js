import { z } from "zod";

const CLAVE = "configParqueadero";

/** Evento que avisa al resto de la app que la configuración cambió. */
export const EVENTO_CONFIG = "configActualizada";

export const CONFIG_DEFECTO = {
  nombre: "Parqueadero Y&G",
  nit: "700539446-2",
  telefono1: "3148124372",
  telefono2: "3015836567",
  direccion: "Calle 17 #23-51",
  horario: "Lunes-Sábado 6:30AM a 9:30PM",
  tarifaMoto: 1000,
  tarifaCarro: 2000,
  tarifaMotoDia: 8000,
  tarifaCarroDia: 15000,
  tarifaMotoNoche: 5000,
  tarifaCarroNoche: 10000,
  mensaje: "¡Gracias por su visita!",
};

const tarifa = z.coerce.number().min(0, "La tarifa no puede ser negativa");

/** Validación en la frontera: lo que entra del formulario y de localStorage. */
export const esquemaConfig = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  nit: z.string().default(""),
  telefono1: z.string().default(""),
  telefono2: z.string().default(""),
  direccion: z.string().default(""),
  horario: z.string().default(""),
  tarifaMoto: tarifa,
  tarifaCarro: tarifa,
  tarifaMotoDia: tarifa,
  tarifaCarroDia: tarifa,
  tarifaMotoNoche: tarifa,
  tarifaCarroNoche: tarifa,
  mensaje: z.string().default(""),
});

/** Configuración guardada, completada con los valores por defecto. */
export function obtenerConfig() {
  try {
    const guardado = window.localStorage.getItem(CLAVE);

    if (!guardado) {
      return CONFIG_DEFECTO;
    }

    const resultado = esquemaConfig.safeParse({
      ...CONFIG_DEFECTO,
      ...JSON.parse(guardado),
    });

    return resultado.success ? resultado.data : CONFIG_DEFECTO;
  } catch {
    return CONFIG_DEFECTO;
  }
}

/** Guarda la configuración y avisa a las pantallas abiertas. */
export function guardarConfig(config) {
  const datos = esquemaConfig.parse({ ...CONFIG_DEFECTO, ...config });

  window.localStorage.setItem(CLAVE, JSON.stringify(datos));
  window.dispatchEvent(new Event(EVENTO_CONFIG));

  return datos;
}
