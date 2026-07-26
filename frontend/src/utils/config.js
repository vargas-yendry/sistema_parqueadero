export const CONFIG_DEFAULT = {
  nombre: "Parqueadero Y&G",
  nit: "700539446-2",
  telefono1: "3148124372",
  telefono2: "3015836567",
  direccion: "Calle 17 #23-51",
  horario: "Lunes-Sábado 6:30AM a 9:30PM",
  tarifaMoto: 1000,
  tarifaCarro: 2000,
  mensaje: "¡Gracias por su visita!"
};

export function getConfig() {
  try {
    const guardado = localStorage.getItem("configParqueadero");

    if (!guardado) {
      return CONFIG_DEFAULT;
    }

    return {
      ...CONFIG_DEFAULT,
      ...JSON.parse(guardado)
    };
  } catch {
    return CONFIG_DEFAULT;
  }
}