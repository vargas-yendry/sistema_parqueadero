import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";

import Accesorios from "@/features/accesorios/Accesorios";
import { formatearPesos } from "@/formato";

const { obtener, publicar, avisoExito, avisoError } = vi.hoisted(() => ({
  obtener: vi.fn(),
  publicar: vi.fn(),
  avisoExito: vi.fn(),
  avisoError: vi.fn(),
}));

vi.mock("@/api", () => ({
  api: { get: obtener, post: publicar, put: vi.fn(), delete: vi.fn() },
}));

vi.mock("sonner", () => ({ toast: { success: avisoExito, error: avisoError } }));

const PRODUCTOS = [
  {
    id: 1,
    nombre: "Casco",
    emoji: "🪖",
    precio: 50_000,
    costo: 30_000,
    stock: 2,
    minStock: 5,
    ventas: 4,
  },
  {
    id: 2,
    nombre: "Impermeable",
    emoji: "🧥",
    precio: 20_000,
    costo: 12_000,
    stock: 40,
    minStock: 5,
    ventas: 1,
  },
];

const VENTAS = [
  {
    id: 9,
    producto: "Casco",
    cantidad: 1,
    precio: 50_000,
    total: 50_000,
    ganancia: 20_000,
    fecha: "2026-07-26T15:00:00.000Z",
  },
];

/** El formato de moneda trae un espacio duro que Testing Library normaliza al buscar texto. */
function enPesos(valor) {
  return formatearPesos(valor).replace(/\s/g, " ");
}

function pintar() {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={cliente}>
      <Accesorios />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  obtener.mockImplementation((ruta) =>
    Promise.resolve({ data: ruta === "/accesorios" ? PRODUCTOS : VENTAS }),
  );

  publicar.mockResolvedValue({ data: { mensaje: "ok" } });
});

it("pinta el inventario, el emoji del producto y avisa del stock bajo", async () => {
  pintar();

  // El emoji es dato del producto: sale tal cual en la tarjeta.
  expect(await screen.findByText("🪖")).toBeInTheDocument();
  expect(screen.getAllByText("Casco")).toHaveLength(2); // tarjeta e historial de ventas
  expect(screen.getByText("2 productos · 1 con stock bajo")).toBeInTheDocument();
  expect(screen.getByText("PRODUCTOS POR AGOTARSE")).toBeInTheDocument();
  expect(screen.getByText("Ganancia: " + enPesos(20_000))).toBeInTheDocument();
  expect(screen.getByText("Vendidas: 4")).toBeInTheDocument();
});

it("registra una venta con la cantidad digitada", async () => {
  const usuario = userEvent.setup();
  pintar();

  const botones = await screen.findAllByRole("button", { name: "Registrar Venta" });
  await usuario.click(botones[0]);

  const cantidad = screen.getByLabelText("CANTIDAD");
  await usuario.clear(cantidad);
  await usuario.type(cantidad, "2");

  expect(screen.getByText("Total: " + enPesos(100_000))).toBeInTheDocument();

  await usuario.click(screen.getByRole("button", { name: "Confirmar" }));

  await waitFor(() =>
    expect(publicar).toHaveBeenCalledWith("/accesorios/venta/1", { cantidad: 2 }),
  );

  expect(avisoExito).toHaveBeenCalledWith("Venta registrada");
});

it("no guarda un producto sin nombre y sí lo guarda con las cifras en número", async () => {
  const usuario = userEvent.setup();
  pintar();

  await usuario.click(await screen.findByRole("button", { name: "Nuevo Producto" }));
  await usuario.click(screen.getByRole("button", { name: "Guardar" }));

  expect(await screen.findByText("El nombre del producto es obligatorio")).toBeInTheDocument();
  expect(publicar).not.toHaveBeenCalled();

  await usuario.type(screen.getByLabelText("Nombre"), "Guantes");
  await usuario.type(screen.getByLabelText("Precio de venta"), "15000");
  await usuario.type(screen.getByLabelText("Cantidad disponible"), "6");
  await usuario.click(screen.getByRole("button", { name: "Guardar" }));

  await waitFor(() =>
    expect(publicar).toHaveBeenCalledWith("/accesorios", {
      nombre: "Guantes",
      emoji: "📦",
      precio: 15_000,
      costo: 0,
      stock: 6,
      minStock: 5,
    }),
  );
});
