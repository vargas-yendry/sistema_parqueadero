import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";

import { CONFIG_DEFECTO } from "@/features/configuracion/configuracion";
import SalidaRapida from "@/features/salidas/SalidaRapida";
import { formatearPesos } from "@/formato";

const { publicar, avisoExito, avisoError } = vi.hoisted(() => ({
  publicar: vi.fn(),
  avisoExito: vi.fn(),
  avisoError: vi.fn(),
}));

const imprimir = vi.fn();

vi.mock("@/api", () => ({ api: { post: publicar } }));
vi.mock("sonner", () => ({ toast: { success: avisoExito, error: avisoError } }));

// El tiquete ya tiene sus propias pruebas: aquí solo interesa que aparezca.
vi.mock("@/features/tiquetes/Tiquete", () => ({
  default: ({ tiquete }) => <div>tiquete:{tiquete.ficha}</div>,
}));

const TARIFAS = {
  tarifaMoto: CONFIG_DEFECTO.tarifaMoto,
  tarifaCarro: CONFIG_DEFECTO.tarifaCarro,
  tarifaMotoDia: CONFIG_DEFECTO.tarifaMotoDia,
  tarifaCarroDia: CONFIG_DEFECTO.tarifaCarroDia,
  tarifaMotoNoche: CONFIG_DEFECTO.tarifaMotoNoche,
  tarifaCarroNoche: CONFIG_DEFECTO.tarifaCarroNoche,
};

/** El formato de moneda trae un espacio duro que Testing Library normaliza al buscar texto. */
function enPesos(valor) {
  return formatearPesos(valor).replace(/\s/g, " ");
}

const VEHICULO = {
  id: 7,
  ficha: "F-0008",
  placa: "ABC123",
  tipo: "MOTO",
  modalidad: "HORA",
  cascos: 1,
  minutos: 45,
  valor: 1000,
  horaIngreso: "2026-07-26T14:00:00.000Z",
};

function pintar(onRefrescar = vi.fn()) {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={cliente}>
      <SalidaRapida onRefrescar={onRefrescar} />
    </QueryClientProvider>,
  );

  return {
    usuario: userEvent.setup(),
    onRefrescar,
    campo: screen.getByLabelText("Número de ficha"),
  };
}

beforeEach(() => {
  publicar.mockReset();
  avisoExito.mockReset();
  avisoError.mockReset();
  imprimir.mockReset();
  vi.stubGlobal("print", imprimir);
  window.localStorage.clear();

  publicar.mockImplementation((ruta) => {
    if (ruta === "/salidas/buscar") {
      return Promise.resolve({ data: VEHICULO });
    }

    return Promise.resolve({ data: { mensaje: "Salida registrada" } });
  });
});

it("busca la ficha con Enter y muestra el cobro", async () => {
  const { usuario, campo } = pintar();

  await usuario.type(campo, "8");
  await usuario.keyboard("{Enter}");

  await waitFor(() => {
    expect(publicar).toHaveBeenCalledWith("/salidas/buscar", { ficha: "F-0008", ...TARIFAS });
  });

  expect(await screen.findByText("F-0008")).toBeInTheDocument();
  expect(screen.getByText("45 min")).toBeInTheDocument();
  expect(screen.getByText(enPesos(1000))).toBeInTheDocument();

  // El cursor salta al botón por defecto para poder cerrar la salida con otro Enter.
  await waitFor(() => expect(screen.getByRole("button", { name: "Sin Tiquete" })).toHaveFocus());
});

it("finaliza sin tiquete, limpia la ficha y avisa al tablero", async () => {
  const { usuario, onRefrescar, campo } = pintar();

  await usuario.type(campo, "8");
  await usuario.keyboard("{Enter}");
  await screen.findByText("F-0008");

  await usuario.click(screen.getByRole("button", { name: "Sin Tiquete" }));

  await waitFor(() => {
    expect(publicar).toHaveBeenCalledWith("/salidas/finalizar", { id: 7, ...TARIFAS });
  });

  expect(onRefrescar).toHaveBeenCalledTimes(1);
  expect(avisoExito).toHaveBeenCalledWith("Salida registrada");
  expect(campo).toHaveValue(null);
  expect(campo).toHaveFocus();
  expect(screen.queryByText("F-0008")).not.toBeInTheDocument();
  expect(screen.queryByText("tiquete:8")).not.toBeInTheDocument();
});

it("con tiquete muestra el papel y lo manda a la impresora", async () => {
  const { usuario, campo } = pintar();

  await usuario.type(campo, "8");
  await usuario.keyboard("{Enter}");
  await screen.findByText("F-0008");

  await usuario.click(screen.getByRole("button", { name: "Con Tiquete" }));

  expect(await screen.findByText("tiquete:8")).toBeInTheDocument();
  await waitFor(() => expect(imprimir).toHaveBeenCalledTimes(1), { timeout: 2000 });
});

it("avisa cuando la ficha no existe y deja el campo listo otra vez", async () => {
  publicar.mockRejectedValue({ response: { data: { mensaje: "Ficha no encontrada" } } });

  const { usuario, campo } = pintar();

  await usuario.type(campo, "99");
  await usuario.keyboard("{Enter}");

  await waitFor(() => expect(avisoError).toHaveBeenCalledWith("Ficha no encontrada"));

  expect(campo).toHaveValue(null);
  expect(campo).toHaveFocus();
  expect(screen.getByText("Escribe el número de ficha y presiona Enter")).toBeInTheDocument();
});
