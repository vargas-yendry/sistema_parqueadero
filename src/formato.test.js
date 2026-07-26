import { describe, expect, it } from "vitest";

import { formatearFecha, formatearFechaHora, formatearHora, formatearPesos } from "./formato.js";

describe("formatearPesos", () => {
  it("formatea en pesos colombianos sin decimales", () => {
    expect(formatearPesos(12000)).toMatch(/12\.000/);
    expect(formatearPesos(12000)).toContain("$");
  });

  it("trata los valores vacíos o inválidos como cero", () => {
    expect(formatearPesos(null)).toMatch(/0/);
    expect(formatearPesos(undefined)).toMatch(/0/);
    expect(formatearPesos("no es un número")).toMatch(/0/);
  });

  it("acepta números en texto, como los que llegan de la API", () => {
    expect(formatearPesos("2500")).toMatch(/2\.500/);
  });
});

describe("formatearFecha", () => {
  it("usa el formato día/mes/año", () => {
    expect(formatearFecha("2026-07-26T15:30:00")).toBe("26/07/2026");
  });

  it("devuelve un guion cuando no hay fecha", () => {
    expect(formatearFecha(null)).toBe("—");
    expect(formatearFecha("cualquier cosa")).toBe("—");
  });
});

describe("formatearHora", () => {
  it("muestra la hora con am/pm", () => {
    expect(formatearHora("2026-07-26T15:30:00")).toMatch(/03:30/);
  });

  it("devuelve un guion cuando no hay fecha", () => {
    expect(formatearHora(undefined)).toBe("—");
  });
});

describe("formatearFechaHora", () => {
  it("junta fecha y hora", () => {
    expect(formatearFechaHora("2026-07-26T15:30:00")).toMatch(/^26\/07\/2026 /);
  });
});
