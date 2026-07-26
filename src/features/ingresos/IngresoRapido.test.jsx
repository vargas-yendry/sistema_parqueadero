import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";

import IngresoRapido from "@/features/ingresos/IngresoRapido";

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
  default: ({ ticket }) => <div>tiquete:{ticket.ficha}</div>,
}));

function pintar(onSuccess = vi.fn()) {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={cliente}>
      <IngresoRapido onSuccess={onSuccess} />
    </QueryClientProvider>,
  );

  return { usuario: userEvent.setup(), onSuccess, campo: screen.getByLabelText("Placa") };
}

beforeEach(() => {
  publicar.mockReset();
  avisoExito.mockReset();
  avisoError.mockReset();
  imprimir.mockReset();
  vi.stubGlobal("print", imprimir);
  publicar.mockResolvedValue({ data: { mensaje: "Ingreso registrado", ficha: "F-0003" } });
});

it("arranca con el cursor en la placa y el formulario escondido", () => {
  const { campo } = pintar();

  expect(campo).toHaveFocus();
  expect(screen.queryByText("Registrar Ingreso")).not.toBeInTheDocument();
});

it("registra con Enter, limpia la placa, avisa al tablero y muestra el tiquete", async () => {
  const { usuario, onSuccess, campo } = pintar();

  await usuario.type(campo, "abc123");
  expect(screen.getByText("Registrar Ingreso")).toBeInTheDocument();

  await usuario.keyboard("{Enter}");

  await waitFor(() => {
    expect(publicar).toHaveBeenCalledWith("/ingresos", {
      placa: "ABC123",
      tipo: "MOTO",
      cascos: 0,
      modalidad: "HORA",
    });
  });

  expect(onSuccess).toHaveBeenCalledTimes(1);
  expect(avisoExito).toHaveBeenCalledWith("Ingreso registrado • F-0003");
  expect(await screen.findByText("tiquete:3")).toBeInTheDocument();
  expect(campo).toHaveValue("");
  expect(screen.queryByText("Registrar Ingreso")).not.toBeInTheDocument();

  // El tiquete sale solo por la impresora medio segundo después de pintarse.
  await waitFor(() => expect(imprimir).toHaveBeenCalledTimes(1), { timeout: 2000 });
});

it("envía el tipo, la modalidad y los cascos escogidos", async () => {
  const { usuario, campo } = pintar();

  await usuario.type(campo, "XYZ789");
  await usuario.click(screen.getByRole("button", { name: "Noche" }));
  await usuario.click(screen.getByRole("button", { name: "2" }));
  await usuario.click(screen.getByRole("button", { name: "Registrar Ingreso" }));

  await waitFor(() => {
    expect(publicar).toHaveBeenCalledWith("/ingresos", {
      placa: "XYZ789",
      tipo: "MOTO",
      cascos: 2,
      modalidad: "NOCHE",
    });
  });
});

it("esconde los cascos cuando el vehículo es un carro", async () => {
  const { usuario, campo } = pintar();

  await usuario.type(campo, "ABC123");
  expect(screen.getByText("CASCOS")).toBeInTheDocument();

  await usuario.click(screen.getByRole("button", { name: "Carro" }));

  expect(screen.queryByText("CASCOS")).not.toBeInTheDocument();
  expect(campo).toHaveFocus();
});

it("no envía nada con la placa vacía y muestra el error bajo el campo", async () => {
  const { usuario, campo } = pintar();

  await usuario.type(campo, "   ");
  await usuario.keyboard("{Enter}");

  expect(publicar).not.toHaveBeenCalled();
  expect(screen.getByText("Escribe la placa del vehículo")).toBeInTheDocument();
  expect(campo).toHaveFocus();
});

it("avisa el error del servidor y deja la placa escrita", async () => {
  publicar.mockRejectedValue({
    response: {
      data: { mensaje: "La placa ABC123 ya está dentro del parqueadero", ficha: "F-0002" },
    },
  });

  const { usuario, campo } = pintar();

  await usuario.type(campo, "ABC123");
  await usuario.keyboard("{Enter}");

  await waitFor(() => {
    expect(avisoError).toHaveBeenCalledWith(
      "La placa ABC123 ya está dentro del parqueadero • F-0002",
    );
  });

  expect(campo).toHaveValue("ABC123");
  expect(screen.getByText("Error")).toBeInTheDocument();
});
