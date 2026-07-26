import { afterEach, describe, expect, it, vi } from "vitest";

import { obtenerEstado } from "./estadoMensualidad.js";

describe("obtenerEstado", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const conHoyEn = (momento) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(momento));
  };

  it("da 'Vencida' el mismo día del vencimiento y después", () => {
    conHoyEn("2026-07-26T12:00:00Z");

    expect(obtenerEstado("2026-07-26")).toBe("Vencida");
    expect(obtenerEstado("2026-07-20")).toBe("Vencida");
  });

  it("avisa 'Por vencer' dentro de los cinco días previos", () => {
    conHoyEn("2026-07-26T12:00:00Z");

    expect(obtenerEstado("2026-07-27")).toBe("Por vencer");
    expect(obtenerEstado("2026-07-31")).toBe("Por vencer");
  });

  it("deja 'Activa' lo que vence más allá de los cinco días", () => {
    conHoyEn("2026-07-26T12:00:00Z");

    expect(obtenerEstado("2026-08-01")).toBe("Activa");
    expect(obtenerEstado("2026-08-26")).toBe("Activa");
  });
});
