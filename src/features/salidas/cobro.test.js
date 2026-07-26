import { describe, expect, it } from "vitest";

import { calcularCobro, calcularMinutos, TARIFAS_DEFECTO } from "./cobro.js";

describe("calcularMinutos", () => {
  it("cuenta los minutos completos entre ingreso y salida", () => {
    const ingreso = new Date("2026-07-26T08:00:00");
    const salida = new Date("2026-07-26T09:30:45");

    expect(calcularMinutos(ingreso, salida)).toBe(90);
  });

  it("da cero si la salida es en el mismo instante", () => {
    const momento = new Date("2026-07-26T08:00:00");

    expect(calcularMinutos(momento, momento)).toBe(0);
  });
});

describe("calcularCobro por hora", () => {
  const porHora = (tipo, minutos, tarifas) =>
    calcularCobro({ tipo, modalidad: "HORA", minutos, tarifas });

  it("cobra mínimo una hora aunque el vehículo salga enseguida", () => {
    expect(porHora("MOTO", 1)).toBe(TARIFAS_DEFECTO.tarifaMoto);
    expect(porHora("CARRO", 0)).toBe(TARIFAS_DEFECTO.tarifaCarro);
  });

  it("respeta los 5 minutos de gracia: a los 65 minutos sigue siendo una hora", () => {
    expect(porHora("MOTO", 65)).toBe(TARIFAS_DEFECTO.tarifaMoto);
    expect(porHora("MOTO", 66)).toBe(TARIFAS_DEFECTO.tarifaMoto * 2);
  });

  it("suma una hora por cada 65 minutos empezados", () => {
    expect(porHora("CARRO", 130)).toBe(TARIFAS_DEFECTO.tarifaCarro * 2);
    expect(porHora("CARRO", 131)).toBe(TARIFAS_DEFECTO.tarifaCarro * 3);
  });

  it("usa la tarifa que le manden en vez de la de por defecto", () => {
    expect(porHora("MOTO", 10, { tarifaMoto: 1500 })).toBe(1500);
  });

  it("acepta tarifas que llegan como texto desde la API", () => {
    expect(porHora("CARRO", 10, { tarifaCarro: "2500" })).toBe(2500);
  });

  it("ignora tarifas vacías o inválidas y cae en la de por defecto", () => {
    expect(porHora("MOTO", 10, { tarifaMoto: "" })).toBe(TARIFAS_DEFECTO.tarifaMoto);
    expect(porHora("MOTO", 10, { tarifaMoto: null })).toBe(TARIFAS_DEFECTO.tarifaMoto);
  });
});

describe("calcularCobro por día y por noche", () => {
  it("cobra tarifa plana de día sin importar cuánto estuvo", () => {
    expect(calcularCobro({ tipo: "MOTO", modalidad: "DIA", minutos: 5 })).toBe(
      TARIFAS_DEFECTO.tarifaMotoDia,
    );
    expect(calcularCobro({ tipo: "CARRO", modalidad: "DIA", minutos: 900 })).toBe(
      TARIFAS_DEFECTO.tarifaCarroDia,
    );
  });

  it("cobra tarifa plana de noche", () => {
    expect(calcularCobro({ tipo: "MOTO", modalidad: "NOCHE", minutos: 300 })).toBe(
      TARIFAS_DEFECTO.tarifaMotoNoche,
    );
    expect(calcularCobro({ tipo: "CARRO", modalidad: "NOCHE", minutos: 300 })).toBe(
      TARIFAS_DEFECTO.tarifaCarroNoche,
    );
  });

  it("trata cualquier modalidad desconocida como cobro por hora", () => {
    expect(calcularCobro({ tipo: "MOTO", modalidad: undefined, minutos: 10 })).toBe(
      TARIFAS_DEFECTO.tarifaMoto,
    );
  });
});
