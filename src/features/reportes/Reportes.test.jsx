import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";

import Reportes from "@/features/reportes/Reportes";
import { fechaParaApi, formatearPesos } from "@/formato";

const { obtener, publicar, eliminar, avisoExito, avisoError } = vi.hoisted(() => ({
  obtener: vi.fn(),
  publicar: vi.fn(),
  eliminar: vi.fn(),
  avisoExito: vi.fn(),
  avisoError: vi.fn(),
}));

vi.mock("@/api", () => ({ api: { get: obtener, post: publicar, delete: eliminar } }));
vi.mock("sonner", () => ({ toast: { success: avisoExito, error: avisoError } }));

const REPORTE = {
  ingresosParking: 50_000,
  vehiculos: 12,
  ventasAccesorios: 30_000,
  gananciaAccesorios: 12_000,
  ingresoMensualidades: 100_000,
  clientesMensualidad: 4,
  tendencia: [
    { fecha: "2026-07-25", total: 20_000 },
    { fecha: "2026-07-26", total: 40_000 },
  ],
};

const GASTOS = [{ id: 3, concepto: "Escoba", valor: 8000, fecha: "2026-07-26" }];

/** El formato de moneda trae un espacio duro que Testing Library normaliza al buscar texto. */
function enPesos(valor) {
  return formatearPesos(valor).replace(/\s/g, " ");
}

function pintar() {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={cliente}>
      <Reportes />
    </QueryClientProvider>,
  );

  return userEvent.setup();
}

beforeEach(() => {
  publicar.mockReset();
  eliminar.mockReset();
  avisoExito.mockReset();
  avisoError.mockReset();

  obtener.mockReset();
  obtener.mockImplementation((ruta) =>
    Promise.resolve({ data: ruta === "/reportes" ? REPORTE : GASTOS }),
  );

  publicar.mockResolvedValue({ data: { id: 9 } });
  eliminar.mockResolvedValue({ data: { mensaje: "Eliminado" } });
});

it("arranca en Hoy y descuenta los gastos de la ganancia neta", async () => {
  pintar();

  expect(obtener).toHaveBeenCalledWith("/reportes", { params: { filtro: "Hoy" } });
  expect(obtener).toHaveBeenCalledWith("/gastos", { params: { filtro: "Hoy" } });

  // 50.000 de parking + 12.000 de accesorios + 100.000 de mensualidades − 8.000 de gastos.
  expect(await screen.findByText(enPesos(154_000))).toBeInTheDocument();
  expect(screen.getByText(enPesos(8000))).toBeInTheDocument();
  expect(screen.getByText("12")).toBeInTheDocument();
  expect(screen.getByText(`-${enPesos(8000)}`)).toBeInTheDocument();
});

it("cambia el rango y vuelve a preguntar por ese filtro", async () => {
  const usuario = pintar();

  await usuario.click(screen.getByRole("tab", { name: "Mes" }));

  await waitFor(() => {
    expect(obtener).toHaveBeenCalledWith("/reportes", { params: { filtro: "Mes" } });
  });

  expect(obtener).toHaveBeenCalledWith("/gastos", { params: { filtro: "Mes" } });
});

it("registra un gasto nuevo con el valor en número y la fecha de hoy", async () => {
  const usuario = pintar();

  await usuario.click(screen.getByRole("button", { name: "Nuevo" }));
  await usuario.type(screen.getByLabelText("Concepto"), "Aseo");
  await usuario.type(screen.getByLabelText("Valor"), "5000");
  await usuario.click(screen.getByRole("button", { name: "Guardar" }));

  await waitFor(() => {
    expect(publicar).toHaveBeenCalledWith("/gastos", {
      concepto: "Aseo",
      valor: 5000,
      fecha: fechaParaApi(),
    });
  });

  expect(avisoExito).toHaveBeenCalledWith("Gasto registrado");
  await waitFor(() => expect(screen.queryByText("Nuevo Gasto")).not.toBeInTheDocument());
});

it("no manda nada si el gasto viene sin concepto o sin valor", async () => {
  const usuario = pintar();

  await usuario.click(screen.getByRole("button", { name: "Nuevo" }));
  await usuario.type(screen.getByLabelText("Concepto"), "Aseo");
  await usuario.click(screen.getByRole("button", { name: "Guardar" }));

  expect(publicar).not.toHaveBeenCalled();
  expect(screen.getByText("Nuevo Gasto")).toBeInTheDocument();
});

it("pide confirmación antes de borrar un gasto", async () => {
  const usuario = pintar();

  await usuario.click(await screen.findByRole("button", { name: "Eliminar el gasto Escoba" }));
  expect(screen.getByText("¿Eliminar gasto?")).toBeInTheDocument();

  await usuario.click(screen.getByRole("button", { name: "Eliminar" }));

  await waitFor(() => expect(eliminar).toHaveBeenCalledWith("/gastos/3"));
  expect(avisoExito).toHaveBeenCalledWith("Gasto eliminado");
});
