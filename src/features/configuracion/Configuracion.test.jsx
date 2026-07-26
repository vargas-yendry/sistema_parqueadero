import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";

import Configuracion from "@/features/configuracion/Configuracion";
import { obtenerConfig } from "@/features/configuracion/configuracion";

const { avisoExito } = vi.hoisted(() => ({ avisoExito: vi.fn() }));

vi.mock("sonner", () => ({ toast: { success: avisoExito, error: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

it("carga la configuración guardada en el formulario", () => {
  window.localStorage.setItem(
    "configParqueadero",
    JSON.stringify({ nombre: "Parqueadero Norte", tarifaCarro: 3500 }),
  );

  render(<Configuracion onClose={vi.fn()} />);

  expect(screen.getByLabelText("Nombre del Parqueadero")).toHaveValue("Parqueadero Norte");
  expect(screen.getByLabelText("Tarifa Carro ($)")).toHaveValue(3500);
  expect(screen.getByLabelText("Moto Noche ($)")).toHaveValue(5000);
});

it("guarda las tarifas como número, avisa y cierra", async () => {
  const usuario = userEvent.setup();
  const alCerrar = vi.fn();

  render(<Configuracion onClose={alCerrar} />);

  const tarifaMoto = screen.getByLabelText("Tarifa Moto ($)");
  await usuario.clear(tarifaMoto);
  await usuario.type(tarifaMoto, "1500");

  await usuario.type(screen.getByLabelText("Mensaje del Tiquete"), " Vuelva pronto");
  await usuario.click(screen.getByRole("button", { name: "Guardar" }));

  await waitFor(() => expect(alCerrar).toHaveBeenCalled());

  expect(avisoExito).toHaveBeenCalledWith("Configuración guardada");
  expect(obtenerConfig().tarifaMoto).toBe(1500);
  expect(obtenerConfig().mensaje).toBe("¡Gracias por su visita! Vuelva pronto");
});

it("no guarda sin nombre y muestra el error del campo", async () => {
  const usuario = userEvent.setup();
  const alCerrar = vi.fn();

  render(<Configuracion onClose={alCerrar} />);

  await usuario.clear(screen.getByLabelText("Nombre del Parqueadero"));
  await usuario.click(screen.getByRole("button", { name: "Guardar" }));

  expect(await screen.findByText("El nombre es obligatorio")).toBeInTheDocument();
  expect(alCerrar).not.toHaveBeenCalled();
  expect(window.localStorage.getItem("configParqueadero")).toBeNull();
});

it("cierra con el botón Cancelar sin guardar", async () => {
  const usuario = userEvent.setup();
  const alCerrar = vi.fn();

  render(<Configuracion onClose={alCerrar} />);

  await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

  expect(alCerrar).toHaveBeenCalled();
  expect(window.localStorage.getItem("configParqueadero")).toBeNull();
});
