import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import GrillaParqueo from "@/features/tablero/GrillaParqueo";

const HACE_90_MINUTOS = new Date(Date.now() - 90 * 60_000).toISOString();

const VEHICULOS = [
  {
    ficha: "F-0001",
    placa: "ABC123",
    tipo: "MOTO",
    cascos: 2,
    horaIngreso: HACE_90_MINUTOS,
  },
  {
    ficha: "F-0002",
    placa: "XYZ789",
    tipo: "CARRO",
    cascos: 0,
    horaIngreso: new Date().toISOString(),
  },
];

function pintar(props = {}) {
  return render(
    <GrillaParqueo vehiculos={VEHICULOS} loading={false} onRefresh={() => {}} {...props} />,
  );
}

it("pinta una casilla por vehículo y completa la grilla con casillas libres", () => {
  pintar();

  expect(screen.getByText("ABC123")).toBeInTheDocument();
  expect(screen.getByText("XYZ789")).toBeInTheDocument();

  // La ficha va sin el prefijo y el tiempo transcurrido en horas + minutos.
  expect(screen.getByText("0001")).toBeInTheDocument();
  expect(screen.getByText("1h 30m")).toBeInTheDocument();
  expect(screen.getByText(/2 cascos/)).toBeInTheDocument();

  // 13 casillas mínimo: 2 ocupadas + 11 libres.
  expect(screen.getAllByText("Libre")).toHaveLength(11);
  expect(screen.getByText("2")).toBeInTheDocument();
});

it("muestra esqueletos mientras cargan los vehículos", () => {
  pintar({ vehiculos: [], loading: true });

  expect(document.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(13);
  expect(screen.queryByText("Libre")).not.toBeInTheDocument();
});

it("filtra en vivo por placa y esconde las casillas libres", async () => {
  const usuario = userEvent.setup();

  pintar();
  await usuario.type(screen.getByLabelText("Buscar placa o ficha"), "abc");

  expect(screen.getByText("ABC123")).toBeInTheDocument();
  expect(screen.queryByText("XYZ789")).not.toBeInTheDocument();
  expect(screen.queryByText("Libre")).not.toBeInTheDocument();
});

it("avisa cuando ninguna casilla coincide con la búsqueda", async () => {
  const usuario = userEvent.setup();

  pintar();
  await usuario.type(screen.getByLabelText("Buscar placa o ficha"), "ZZZ");

  expect(screen.getByText(/Ninguna casilla coincide/)).toBeInTheDocument();
  expect(screen.queryByText("ABC123")).not.toBeInTheDocument();
});

it("pide refrescar al pulsar Actualizar", async () => {
  const usuario = userEvent.setup();
  const refrescar = vi.fn();

  pintar({ onRefresh: refrescar });
  await usuario.click(screen.getByRole("button", { name: "Actualizar" }));

  expect(refrescar).toHaveBeenCalledOnce();
});
