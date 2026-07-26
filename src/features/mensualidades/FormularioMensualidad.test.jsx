import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import FormularioMensualidad from "@/features/mensualidades/FormularioMensualidad";

const MENSUALIDAD = {
  id: 7,
  cliente: "Ana Ríos",
  placa: "ABC123",
  telefono: "3001112233",
  fechaInicio: "2026-07-01",
  fechaVencimiento: "2026-07-31",
  valor: 120_000,
};

function pintar(props = {}) {
  const onGuardar = vi.fn();
  const onCerrar = vi.fn();

  render(
    <FormularioMensualidad
      mensualidad={null}
      guardando={false}
      onGuardar={onGuardar}
      onCerrar={onCerrar}
      {...props}
    />,
  );

  return { usuario: userEvent.setup(), onGuardar, onCerrar };
}

/** Lo que el formulario entrega a quien lo guarda (el segundo argumento es el evento). */
function datosGuardados(onGuardar) {
  return onGuardar.mock.calls[0][0];
}

it("abre en blanco cuando es una mensualidad nueva", () => {
  pintar();

  expect(screen.getByText("Nueva Mensualidad")).toBeInTheDocument();
  expect(screen.getByLabelText("Nombre cliente")).toHaveValue("");
  expect(screen.getByLabelText("Placa")).toHaveValue("");
  expect(screen.getByLabelText("Fecha de vencimiento")).toHaveValue("");
});

it("carga los datos de la mensualidad que se está editando", () => {
  pintar({ mensualidad: MENSUALIDAD });

  expect(screen.getByText("Editar Mensualidad")).toBeInTheDocument();
  expect(screen.getByLabelText("Nombre cliente")).toHaveValue("Ana Ríos");
  expect(screen.getByLabelText("Placa")).toHaveValue("ABC123");
  expect(screen.getByLabelText("Teléfono")).toHaveValue("3001112233");
  expect(screen.getByLabelText("Fecha de inicio")).toHaveValue("2026-07-01");
  expect(screen.getByLabelText("Valor mensualidad")).toHaveValue(120_000);
});

it("no guarda sin cliente ni placa y muestra el error de cada campo", async () => {
  const { usuario, onGuardar } = pintar();

  await usuario.click(screen.getByRole("button", { name: "Guardar" }));

  expect(await screen.findByText("El nombre del cliente es obligatorio")).toBeInTheDocument();
  expect(screen.getByText("La placa es obligatoria")).toBeInTheDocument();
  expect(screen.getByText("Elige la fecha de inicio")).toBeInTheDocument();
  expect(onGuardar).not.toHaveBeenCalled();
});

it("calcula el vencimiento 30 días después del inicio y manda el valor en número", async () => {
  const { usuario, onGuardar } = pintar();

  await usuario.type(screen.getByLabelText("Nombre cliente"), "Diana Peña");
  await usuario.type(screen.getByLabelText("Placa"), "qwe456");
  await usuario.type(screen.getByLabelText("Teléfono"), "3001234567");
  await usuario.type(screen.getByLabelText("Fecha de inicio"), "2026-08-01");
  await usuario.type(screen.getByLabelText("Valor mensualidad"), "150000");

  // El vencimiento es de solo lectura: lo llena el formulario al elegir el inicio.
  expect(screen.getByLabelText("Fecha de vencimiento")).toHaveValue("2026-08-31");

  await usuario.click(screen.getByRole("button", { name: "Guardar" }));

  await waitFor(() => expect(onGuardar).toHaveBeenCalled());

  expect(datosGuardados(onGuardar)).toEqual({
    cliente: "Diana Peña",
    placa: "QWE456",
    telefono: "3001234567",
    fechaInicio: "2026-08-01",
    fechaVencimiento: "2026-08-31",
    valor: 150_000,
  });
});

it("no acepta un valor negativo", async () => {
  const { usuario, onGuardar } = pintar();

  await usuario.type(screen.getByLabelText("Nombre cliente"), "Diana Peña");
  await usuario.type(screen.getByLabelText("Placa"), "QWE456");
  await usuario.type(screen.getByLabelText("Fecha de inicio"), "2026-08-01");
  await usuario.type(screen.getByLabelText("Valor mensualidad"), "-5000");

  await usuario.click(screen.getByRole("button", { name: "Guardar" }));

  expect(await screen.findByText("El valor no puede ser negativo")).toBeInTheDocument();
  expect(onGuardar).not.toHaveBeenCalled();
});

it("no acepta un vencimiento que no sea posterior al inicio", async () => {
  const { usuario, onGuardar } = pintar({
    mensualidad: { ...MENSUALIDAD, fechaInicio: "2026-07-31", fechaVencimiento: "2026-07-31" },
  });

  await usuario.click(screen.getByRole("button", { name: "Guardar" }));

  expect(
    await screen.findByText("El vencimiento debe ser posterior al inicio"),
  ).toBeInTheDocument();
  expect(onGuardar).not.toHaveBeenCalled();
});

it("borra el vencimiento si se deja el inicio en blanco", async () => {
  const { usuario } = pintar({ mensualidad: MENSUALIDAD });

  await usuario.clear(screen.getByLabelText("Fecha de inicio"));

  expect(screen.getByLabelText("Fecha de vencimiento")).toHaveValue("");
});

it("cierra con Cancelar sin guardar nada", async () => {
  const { usuario, onGuardar, onCerrar } = pintar({ mensualidad: MENSUALIDAD });

  await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

  expect(onCerrar).toHaveBeenCalledOnce();
  expect(onGuardar).not.toHaveBeenCalled();
});

it("cierra con la tecla Escape", async () => {
  const { usuario, onCerrar } = pintar();

  await usuario.keyboard("{Escape}");

  expect(onCerrar).toHaveBeenCalledOnce();
});

it("bloquea el botón mientras se está guardando", () => {
  pintar({ guardando: true });

  expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
});
