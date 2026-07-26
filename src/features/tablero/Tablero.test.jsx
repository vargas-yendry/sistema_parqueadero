import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";

import Tablero from "@/features/tablero/Tablero";

const { obtener } = vi.hoisted(() => ({ obtener: vi.fn() }));

vi.mock("@/api", () => ({ api: { get: obtener } }));

// Los hijos traen su propia red y su propio foco: aquí solo interesa el cableado.
vi.mock("@/features/tablero/GrillaParqueo", () => ({
  default: ({ vehiculos, loading, onRefresh }) => (
    <button type="button" onClick={onRefresh}>
      grilla:{loading ? "cargando" : vehiculos.length}
    </button>
  ),
}));

vi.mock("@/features/ingresos/IngresoRapido", () => ({ default: () => <div>ingreso rápido</div> }));
vi.mock("@/features/salidas/SalidaRapida", () => ({ default: () => <div>salida rápida</div> }));

const ESTADISTICAS = {
  vehiculosHoy: 7,
  ingresosHoy: 42000,
  salidasHoy: 5,
  gananciaNeta: 42000,
};

function pintar() {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={cliente}>
      <Tablero />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  obtener.mockReset();
  obtener.mockImplementation((ruta) =>
    ruta === "/vehiculos"
      ? Promise.resolve({ data: [{ ficha: "F-0001" }, { ficha: "F-0002" }] })
      : Promise.resolve({ data: ESTADISTICAS }),
  );
});

it("muestra esqueletos mientras llegan las estadísticas", () => {
  obtener.mockImplementation((ruta) =>
    ruta === "/vehiculos" ? Promise.resolve({ data: [] }) : new Promise(() => {}),
  );

  pintar();

  expect(screen.getByText("Vehículos Hoy")).toBeInTheDocument();
  expect(document.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(4);
});

it("pinta las cuatro cifras y le pasa los vehículos a la grilla", async () => {
  pintar();

  expect(await screen.findByText("7")).toBeInTheDocument();
  expect(screen.getByText("5")).toBeInTheDocument();

  // Dos tarjetas en pesos: la cifra sale con separador de miles, no cruda.
  expect(screen.getAllByText(/42\.000/)).toHaveLength(2);
  expect(document.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(0);

  expect(await screen.findByText("grilla:2")).toBeInTheDocument();
  expect(obtener).toHaveBeenCalledWith("/vehiculos");
  expect(obtener).toHaveBeenCalledWith("/salidas/estadisticas");
});

it("vuelve a consultar las dos claves cuando un hijo pide refrescar", async () => {
  const usuario = userEvent.setup();

  pintar();
  await screen.findByText("grilla:2");
  obtener.mockClear();

  await usuario.click(screen.getByText("grilla:2"));

  await waitFor(() => {
    expect(obtener).toHaveBeenCalledWith("/vehiculos");
    expect(obtener).toHaveBeenCalledWith("/salidas/estadisticas");
  });
});
