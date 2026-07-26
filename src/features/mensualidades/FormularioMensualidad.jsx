import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/interfaz/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/interfaz/dialog";
import { Input } from "@/interfaz/input";
import { Label } from "@/interfaz/label";

/** Una mensualidad se vende por mes: al elegir el inicio, el vencimiento sale solo. */
const DIAS_DE_MENSUALIDAD = 30;

/** Validación en la frontera: lo que el mostrador escribe antes de salir a la API. */
const esquemaMensualidad = z
  .object({
    cliente: z.string().trim().min(1, "El nombre del cliente es obligatorio"),
    placa: z.string().trim().min(1, "La placa es obligatoria"),
    telefono: z.string().trim(),
    fechaInicio: z.string().min(1, "Elige la fecha de inicio"),
    fechaVencimiento: z.string().min(1, "Elige la fecha de inicio para calcular el vencimiento"),
    valor: z.coerce.number().min(0, "El valor no puede ser negativo"),
  })
  .refine((datos) => datos.fechaVencimiento > datos.fechaInicio, {
    message: "El vencimiento debe ser posterior al inicio",
    path: ["fechaVencimiento"],
  });

function Campo({ etiqueta, campo, error, children }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={campo}>{etiqueta}</Label>
      {children}
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
    </div>
  );
}

export default function FormularioMensualidad({ mensualidad, guardando, onGuardar, onCerrar }) {
  const esNueva = !mensualidad;

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaMensualidad),
    defaultValues: {
      cliente: mensualidad?.cliente ?? "",
      placa: mensualidad?.placa ?? "",
      telefono: mensualidad?.telefono ?? "",
      fechaInicio: mensualidad?.fechaInicio ?? "",
      fechaVencimiento: mensualidad?.fechaVencimiento ?? "",
      valor: mensualidad?.valor ?? "",
    },
  });

  const alCambiarInicio = (evento) => {
    const inicio = evento.target.value;

    if (!inicio) {
      setValue("fechaVencimiento", "");
      return;
    }

    const vence = new Date(inicio);
    vence.setDate(vence.getDate() + DIAS_DE_MENSUALIDAD);

    setValue("fechaVencimiento", vence.toISOString().split("T")[0], { shouldValidate: true });
  };

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) {
          onCerrar();
        }
      }}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold tracking-[0.5px]">
            {esNueva ? "Nueva Mensualidad" : "Editar Mensualidad"}
          </DialogTitle>
        </DialogHeader>

        <form className="grid gap-3" onSubmit={handleSubmit(onGuardar)}>
          <Campo etiqueta="Nombre cliente" campo="cliente" error={errors.cliente?.message}>
            <Input
              id="cliente"
              placeholder="Nombre cliente"
              aria-invalid={Boolean(errors.cliente)}
              {...register("cliente")}
            />
          </Campo>

          <Campo etiqueta="Placa" campo="placa" error={errors.placa?.message}>
            <Input
              id="placa"
              placeholder="Placa"
              className="font-mono uppercase"
              aria-invalid={Boolean(errors.placa)}
              {...register("placa", {
                onChange: (evento) => setValue("placa", evento.target.value.toUpperCase()),
              })}
            />
          </Campo>

          <Campo etiqueta="Teléfono" campo="telefono" error={errors.telefono?.message}>
            <Input id="telefono" placeholder="Teléfono" {...register("telefono")} />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo
              etiqueta="Fecha de inicio"
              campo="fechaInicio"
              error={errors.fechaInicio?.message}
            >
              <Input
                id="fechaInicio"
                type="date"
                aria-invalid={Boolean(errors.fechaInicio)}
                {...register("fechaInicio", { onChange: alCambiarInicio })}
              />
            </Campo>

            <Campo
              etiqueta="Fecha de vencimiento"
              campo="fechaVencimiento"
              error={errors.fechaVencimiento?.message}
            >
              <Input
                id="fechaVencimiento"
                type="date"
                readOnly
                aria-invalid={Boolean(errors.fechaVencimiento)}
                {...register("fechaVencimiento")}
              />
            </Campo>
          </div>

          <Campo etiqueta="Valor mensualidad" campo="valor" error={errors.valor?.message}>
            <Input
              id="valor"
              type="number"
              placeholder="Valor mensualidad"
              aria-invalid={Boolean(errors.valor)}
              {...register("valor")}
            />
          </Campo>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={onCerrar}>
              Cancelar
            </Button>

            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
