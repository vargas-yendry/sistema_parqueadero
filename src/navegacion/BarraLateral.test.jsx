import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { expect, it, vi } from "vitest";

import { guardarConfig } from "@/features/configuracion/config";
import BarraLateral from "@/navegacion/BarraLateral";

const ETIQUETAS = [
  "Tablero",
  "Mensualidades",
  "Accesorios",
  "Reportes",
  "Configuración",
  "Nuevo Día",
];

it("pinta los seis destinos y resalta el activo", () => {
  render(<BarraLateral vista="reportes" setVista={vi.fn()} />);

  for (const etiqueta of ETIQUETAS) {
    expect(screen.getByRole("button", { name: etiqueta })).toBeInTheDocument();
  }

  expect(screen.getByRole("button", { name: "Reportes" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("button", { name: "Tablero" })).not.toHaveAttribute("aria-current");
});

it("avisa el destino elegido con el mismo id de siempre", async () => {
  const usuario = userEvent.setup();
  const cambiarVista = vi.fn();

  render(<BarraLateral vista="tablero" setVista={cambiarVista} />);

  await usuario.click(screen.getByRole("button", { name: "Nuevo Día" }));
  expect(cambiarVista).toHaveBeenCalledWith("nuevoDia");

  await usuario.click(screen.getByRole("button", { name: "Tablero" }));
  expect(cambiarVista).toHaveBeenCalledWith("tablero");
});

it("refresca el nombre cuando se guarda la configuración", () => {
  render(<BarraLateral vista="tablero" setVista={vi.fn()} />);

  expect(screen.getByText("Parqueadero Y&G")).toBeInTheDocument();

  act(() => {
    guardarConfig({ nombre: "Parqueadero Centro" });
  });

  expect(screen.getByText("Parqueadero Centro")).toBeInTheDocument();
});
