import { beforeEach, describe, expect, it, vi } from "vitest";

import { CONFIG_DEFECTO, EVENTO_CONFIG, guardarConfig, obtenerConfig } from "./configuracion.js";

describe("obtenerConfig", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("devuelve los valores por defecto cuando no hay nada guardado", () => {
    expect(obtenerConfig()).toEqual(CONFIG_DEFECTO);
  });

  it("completa con los valores por defecto lo que falte en lo guardado", () => {
    window.localStorage.setItem(
      "configParqueadero",
      JSON.stringify({ nombre: "Parqueadero Central" }),
    );

    const config = obtenerConfig();

    expect(config.nombre).toBe("Parqueadero Central");
    expect(config.tarifaMoto).toBe(CONFIG_DEFECTO.tarifaMoto);
  });

  it("convierte a número las tarifas guardadas como texto", () => {
    window.localStorage.setItem("configParqueadero", JSON.stringify({ tarifaCarro: "3500" }));

    expect(obtenerConfig().tarifaCarro).toBe(3500);
  });

  it("no revienta si lo guardado está corrupto", () => {
    window.localStorage.setItem("configParqueadero", "{ esto no es json");

    expect(obtenerConfig()).toEqual(CONFIG_DEFECTO);
  });
});

describe("guardarConfig", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("guarda y avisa con el evento de configuración", () => {
    const escucha = vi.fn();
    window.addEventListener(EVENTO_CONFIG, escucha);

    guardarConfig({ ...CONFIG_DEFECTO, nombre: "Parqueadero Norte" });

    expect(obtenerConfig().nombre).toBe("Parqueadero Norte");
    expect(escucha).toHaveBeenCalledOnce();

    window.removeEventListener(EVENTO_CONFIG, escucha);
  });

  it("rechaza una tarifa negativa", () => {
    expect(() => guardarConfig({ ...CONFIG_DEFECTO, tarifaMoto: -100 })).toThrow();
  });
});
