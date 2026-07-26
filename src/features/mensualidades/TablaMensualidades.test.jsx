import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import TablaMensualidades from "@/features/mensualidades/TablaMensualidades";
import { fechaMasDias, formatearPesos } from "@/formato";

/**
 * Fecha "AAAA-MM-DD" a tantos días de hoy, en hora local: así el estado no
 * depende ni del día ni de la zona horaria en que se corra la prueba.
 */
function enDias(dias) {
  return fechaMasDias(dias);
}

/** El formato de moneda trae un espacio duro que Testing Library normaliza al buscar texto. */
function enPesos(valor) {
  return formatearPesos(valor).replace(/\s/g, " ");
}

/** La tabla muestra la fecha a la colombiana: "2026-08-25" se lee "25/08/2026". */
function enFechaCorta(fecha) {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

const ACTIVA = {
  id: 1,
  cliente: "Ana Ríos",
  placa: "ABC123",
  telefono: "3001112233",
  fechaInicio: enDias(-30),
  fechaVencimiento: enDias(30),
  valor: 120_000,
};

const POR_VENCER = {
  id: 2,
  cliente: "Beto Cruz",
  placa: "XYZ789",
  telefono: "3004445566",
  fechaInicio: enDias(-27),
  fechaVencimiento: enDias(3),
  valor: 90_000,
};

const VENCIDA = {
  id: 3,
  cliente: "Carla Díaz",
  placa: "JKL456",
  telefono: "3007778899",
  fechaInicio: enDias(-32),
  fechaVencimiento: enDias(-2),
  valor: 80_000,
};

const MENSUALIDADES = [ACTIVA, POR_VENCER, VENCIDA];

function pintar(props = {}) {
  const onRenovar = vi.fn();
  const onEditar = vi.fn();
  const onEliminar = vi.fn();

  render(
    <TablaMensualidades
      mensualidades={MENSUALIDADES}
      cargando={false}
      onRenovar={onRenovar}
      onEditar={onEditar}
      onEliminar={onEliminar}
      {...props}
    />,
  );

  return { usuario: userEvent.setup(), onRenovar, onEditar, onEliminar };
}

it("pinta una fila por mensualidad con el valor en pesos y el vencimiento", () => {
  pintar();

  expect(screen.getByText("Ana Ríos")).toBeInTheDocument();
  expect(screen.getByText("ABC123")).toBeInTheDocument();
  expect(screen.getByText(enPesos(120_000))).toBeInTheDocument();
  expect(screen.getByText(enFechaCorta(ACTIVA.fechaVencimiento))).toBeInTheDocument();

  expect(screen.getByText("Carla Díaz")).toBeInTheDocument();
  expect(screen.getByText(enPesos(80_000))).toBeInTheDocument();
});

it("marca cada mensualidad con el estado que le toca según el vencimiento", () => {
  pintar();

  expect(screen.getByText("Activa")).toBeInTheDocument();
  expect(screen.getByText("Por vencer")).toBeInTheDocument();
  expect(screen.getByText("Vencida")).toBeInTheDocument();
});

it("muestra esqueletos mientras cargan las mensualidades", () => {
  pintar({ mensualidades: [], cargando: true });

  expect(document.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(3);
  expect(screen.queryByText("Sin resultados")).not.toBeInTheDocument();
});

it("avisa que no hay resultados cuando la lista llega vacía", () => {
  pintar({ mensualidades: [] });

  expect(screen.getByText("Sin resultados")).toBeInTheDocument();
  expect(screen.queryByText("Ana Ríos")).not.toBeInTheDocument();
});

it("entrega la mensualidad de la fila a renovar, editar o eliminar", async () => {
  const { usuario, onRenovar, onEditar, onEliminar } = pintar();

  await usuario.click(screen.getByRole("button", { name: "Renovar la mensualidad de XYZ789" }));
  expect(onRenovar).toHaveBeenCalledWith(POR_VENCER);

  await usuario.click(screen.getByRole("button", { name: "Editar la mensualidad de ABC123" }));
  expect(onEditar).toHaveBeenCalledWith(ACTIVA);

  await usuario.click(screen.getByRole("button", { name: "Eliminar la mensualidad de JKL456" }));
  expect(onEliminar).toHaveBeenCalledWith(VENCIDA);
});
