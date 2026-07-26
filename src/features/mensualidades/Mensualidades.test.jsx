import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";

import Mensualidades from "@/features/mensualidades/Mensualidades";
import { fechaMasDias } from "@/formato";

const { obtener, publicar, actualizar, eliminar, avisoExito, avisoError } = vi.hoisted(() => ({
  obtener: vi.fn(),
  publicar: vi.fn(),
  actualizar: vi.fn(),
  eliminar: vi.fn(),
  avisoExito: vi.fn(),
  avisoError: vi.fn(),
}));

vi.mock("@/api", () => ({
  api: { get: obtener, post: publicar, put: actualizar, delete: eliminar },
}));

vi.mock("sonner", () => ({ toast: { success: avisoExito, error: avisoError } }));

/**
 * Fecha "AAAA-MM-DD" a tantos días de hoy, en hora local: así el estado no
 * depende ni del día ni de la zona horaria en que se corra la prueba.
 */
function enDias(dias) {
  return fechaMasDias(dias);
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

function pintar() {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={cliente}>
      <Mensualidades />
    </QueryClientProvider>,
  );

  return userEvent.setup();
}

beforeEach(() => {
  vi.clearAllMocks();

  obtener.mockResolvedValue({ data: MENSUALIDADES });
  publicar.mockResolvedValue({ data: { id: 4, mensaje: "Mensualidad creada" } });
  actualizar.mockResolvedValue({ data: { mensaje: "Mensualidad actualizada" } });
  eliminar.mockResolvedValue({ data: { mensaje: "Mensualidad eliminada" } });
});

it("pinta las mensualidades de la API con su estado y avisa de las que no están activas", async () => {
  pintar();

  expect(await screen.findByText("Ana Ríos")).toBeInTheDocument();
  expect(obtener).toHaveBeenCalledWith("/mensualidades");

  expect(screen.getByText("3 clientes · 1 activas")).toBeInTheDocument();
  expect(screen.getByText("Activa")).toBeInTheDocument();
  expect(screen.getByText("Por vencer")).toBeInTheDocument();
  expect(screen.getByText("Vencida")).toBeInTheDocument();

  // Las que no están activas se avisan arriba, cada una según le corresponda.
  expect(screen.getByText("NOTIFICACIONES")).toBeInTheDocument();
  expect(screen.getByText(/vence pronto/)).toBeInTheDocument();
  expect(screen.getByText(/está vencida/)).toBeInTheDocument();
});

it("filtra la tabla por cliente o por placa", async () => {
  const usuario = pintar();

  await usuario.type(await screen.findByLabelText("Buscar cliente o placa"), "ana");

  expect(screen.getByText("Ana Ríos")).toBeInTheDocument();

  expect(
    screen.queryByRole("button", { name: "Editar la mensualidad de XYZ789" }),
  ).not.toBeInTheDocument();

  await usuario.clear(screen.getByLabelText("Buscar cliente o placa"));
  await usuario.type(screen.getByLabelText("Buscar cliente o placa"), "jkl");

  expect(screen.getByText("Carla Díaz")).toBeInTheDocument();
  expect(screen.queryByText("Ana Ríos")).not.toBeInTheDocument();
});

it("crea la mensualidad nueva con el payload que espera la API", async () => {
  const usuario = pintar();

  await usuario.click(await screen.findByRole("button", { name: "Nueva Mensualidad" }));

  await usuario.type(screen.getByLabelText("Nombre cliente"), "Diana Peña");
  await usuario.type(screen.getByLabelText("Placa"), "qwe456");
  await usuario.type(screen.getByLabelText("Teléfono"), "3001234567");
  await usuario.type(screen.getByLabelText("Fecha de inicio"), "2026-08-01");
  await usuario.type(screen.getByLabelText("Valor mensualidad"), "150000");
  await usuario.click(screen.getByRole("button", { name: "Guardar" }));

  await waitFor(() =>
    expect(publicar).toHaveBeenCalledWith("/mensualidades", {
      cliente: "Diana Peña",
      placa: "QWE456",
      telefono: "3001234567",
      fechaInicio: "2026-08-01",
      fechaVencimiento: "2026-08-31",
      valor: 150_000,
    }),
  );

  expect(avisoExito).toHaveBeenCalledWith("Mensualidad guardada");

  // El formulario se cierra solo al guardar (el botón que lo abre sigue diciendo lo mismo).
  await waitFor(() => expect(screen.queryByLabelText("Nombre cliente")).not.toBeInTheDocument());
});

it("edita contra el endpoint de la mensualidad escogida", async () => {
  const usuario = pintar();

  await usuario.click(
    await screen.findByRole("button", { name: "Editar la mensualidad de ABC123" }),
  );

  expect(screen.getByText("Editar Mensualidad")).toBeInTheDocument();

  await usuario.clear(screen.getByLabelText("Nombre cliente"));
  await usuario.type(screen.getByLabelText("Nombre cliente"), "Ana María Ríos");
  await usuario.click(screen.getByRole("button", { name: "Guardar" }));

  await waitFor(() =>
    expect(actualizar).toHaveBeenCalledWith("/mensualidades/1", {
      cliente: "Ana María Ríos",
      placa: "ABC123",
      telefono: "3001112233",
      fechaInicio: ACTIVA.fechaInicio,
      fechaVencimiento: ACTIVA.fechaVencimiento,
      valor: 120_000,
    }),
  );

  expect(publicar).not.toHaveBeenCalled();
});

it("renueva la mensualidad 30 días contados desde hoy", async () => {
  const usuario = pintar();

  await usuario.click(
    await screen.findByRole("button", { name: "Renovar la mensualidad de JKL456" }),
  );

  await waitFor(() => expect(actualizar).toHaveBeenCalled());

  const [ruta, datos] = actualizar.mock.calls[0];

  expect(ruta).toBe("/mensualidades/3");
  expect(datos.fechaInicio).toBe(enDias(0));
  expect((new Date(datos.fechaVencimiento) - new Date(datos.fechaInicio)) / 86_400_000).toBe(30);

  // Los datos del cliente viajan iguales: renovar solo corre las fechas.
  expect(datos.cliente).toBe("Carla Díaz");
  expect(datos.placa).toBe("JKL456");
  expect(datos.telefono).toBe("3007778899");
  expect(datos.valor).toBe(80_000);

  expect(avisoExito).toHaveBeenCalledWith("Mensualidad renovada 30 días");
});

it("no borra nada hasta confirmar en el diálogo", async () => {
  const usuario = pintar();

  await usuario.click(
    await screen.findByRole("button", { name: "Eliminar la mensualidad de ABC123" }),
  );

  expect(screen.getByText("¿Eliminar mensualidad?")).toBeInTheDocument();
  expect(eliminar).not.toHaveBeenCalled();

  await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

  await waitFor(() => expect(screen.queryByText("¿Eliminar mensualidad?")).not.toBeInTheDocument());
  expect(eliminar).not.toHaveBeenCalled();
});

it("borra la mensualidad cuando se confirma", async () => {
  const usuario = pintar();

  await usuario.click(
    await screen.findByRole("button", { name: "Eliminar la mensualidad de XYZ789" }),
  );

  await usuario.click(screen.getByRole("button", { name: "Eliminar" }));

  await waitFor(() => expect(eliminar).toHaveBeenCalledWith("/mensualidades/2"));

  expect(avisoExito).toHaveBeenCalledWith("Mensualidad eliminada");
  await waitFor(() => expect(screen.queryByText("¿Eliminar mensualidad?")).not.toBeInTheDocument());
});

it("avisa el error y deja el formulario abierto si la API rechaza el guardado", async () => {
  publicar.mockRejectedValue(new Error("falló"));

  const usuario = pintar();

  await usuario.click(await screen.findByRole("button", { name: "Nueva Mensualidad" }));

  await usuario.type(screen.getByLabelText("Nombre cliente"), "Diana Peña");
  await usuario.type(screen.getByLabelText("Placa"), "QWE456");
  await usuario.type(screen.getByLabelText("Fecha de inicio"), "2026-08-01");
  await usuario.type(screen.getByLabelText("Valor mensualidad"), "150000");
  await usuario.click(screen.getByRole("button", { name: "Guardar" }));

  await waitFor(() => expect(avisoError).toHaveBeenCalledWith("No se pudo guardar la mensualidad"));

  expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
});
