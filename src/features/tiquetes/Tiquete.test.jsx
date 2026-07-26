import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import Tiquete from "@/features/tiquetes/Tiquete";

const TIQUETE = {
  ficha: 12,
  placa: "ABC123",
  tipo: "MOTO",
  cascos: 2,
  fecha: "26/07/2026",
  hora: "08:15",
  horaSalida: "10:30",
  tiempo: "2h 15m",
  tarifa: "$1.000",
  modalidad: "HORA",
  total: "$3.000",
};

it("pinta el tiquete de ingreso con el id de impresión", () => {
  render(<Tiquete tiquete={TIQUETE} tipo="ingreso" onClose={vi.fn()} />);

  expect(document.querySelector("#tiquete-impresion")).toBeInTheDocument();
  expect(screen.getByText("F-0012")).toBeInTheDocument();
  expect(screen.getByText("Parqueadero Y&G")).toBeInTheDocument();
  expect(screen.getByText("0012-ABC123")).toBeInTheDocument();
  expect(screen.queryByText(/TOTAL/)).not.toBeInTheDocument();
});

it("muestra salida, tiempo y total cuando el tipo es salida", () => {
  render(<Tiquete tiquete={TIQUETE} tipo="salida" onClose={vi.fn()} />);

  expect(screen.getByText("10:30")).toBeInTheDocument();
  expect(screen.getByText("2h 15m")).toBeInTheDocument();
  expect(screen.getByText(/TOTAL: \$3\.000/)).toBeInTheDocument();
});

it("cierra con el botón Cerrar e imprime con el botón Imprimir", async () => {
  const usuario = userEvent.setup();
  const alCerrar = vi.fn();
  window.print = vi.fn();

  render(<Tiquete tiquete={TIQUETE} onClose={alCerrar} />);

  await usuario.click(screen.getByRole("button", { name: "Imprimir" }));
  expect(window.print).toHaveBeenCalledTimes(1);

  await usuario.click(screen.getByRole("button", { name: "Cerrar" }));
  expect(alCerrar).toHaveBeenCalled();
});

it("al cerrar devuelve el foco a donde le digan", async () => {
  // En el mostrador se encadena una salida tras otra: si el foco no vuelve al
  // campo, el operario tiene que ir al mouse entre cada vehículo.
  function Mostrador() {
    const [abierto, setAbierto] = useState(true);

    return (
      <>
        <input aria-label="Ficha" />

        {abierto && (
          <Tiquete
            tiquete={TIQUETE}
            onClose={() => setAbierto(false)}
            alCerrarFoco={() => screen.getByLabelText("Ficha").focus()}
          />
        )}
      </>
    );
  }

  const usuario = userEvent.setup();
  render(<Mostrador />);

  await usuario.click(screen.getByRole("button", { name: "Cerrar" }));

  await waitFor(() => expect(screen.getByLabelText("Ficha")).toHaveFocus());
});
