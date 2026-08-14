import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  esquemaConfig,
  guardarConfig,
  obtenerConfig,
} from "@/features/configuracion/config";
import { Button } from "@/interfaz/button";
import { cn } from "@/interfaz/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/interfaz/dialog";
import { Input } from "@/interfaz/input";
import { Label } from "@/interfaz/label";
import { Textarea } from "@/interfaz/textarea";

/** Dirección y horario son textos largos: ocupan la fila completa. */
const CAMPOS = [
  { clave: "nombre", etiqueta: "Nombre del Parqueadero", tipo: "text" },
  { clave: "nit", etiqueta: "NIT", tipo: "text" },
  { clave: "telefono1", etiqueta: "Teléfono 1", tipo: "tel" },
  { clave: "telefono2", etiqueta: "Teléfono 2", tipo: "tel" },
  { clave: "direccion", etiqueta: "Dirección", tipo: "text", filaCompleta: true },
  { clave: "horario", etiqueta: "Horario", tipo: "text", filaCompleta: true },
  { clave: "tarifaMoto", etiqueta: "Tarifa Moto ($)", tipo: "number" },
  { clave: "tarifaCarro", etiqueta: "Tarifa Carro ($)", tipo: "number" },
  { clave: "tarifaMotoDia", etiqueta: "Moto Día ($)", tipo: "number" },
  { clave: "tarifaCarroDia", etiqueta: "Carro Día ($)", tipo: "number" },
  { clave: "tarifaMotoNoche", etiqueta: "Moto Noche ($)", tipo: "number" },
  { clave: "tarifaCarroNoche", etiqueta: "Carro Noche ($)", tipo: "number" },
];

function Campo({ etiqueta, campo, error, filaCompleta, children }) {
  return (
    <div className={cn("grid gap-1.5", filaCompleta && "col-span-2")}>
      <Label
        htmlFor={campo}
        className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
      >
        {etiqueta}
      </Label>
      {children}
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
    </div>
  );
}

export default function Configuracion({ onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaConfig),
    defaultValues: obtenerConfig(),
  });

  const guardar = (datos) => {
    guardarConfig(datos);
    toast.success("Configuración guardada");
    onClose();
  };

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl font-bold tracking-[0.5px]">
            <Settings className="size-5" />
            CONFIGURACIÓN
          </DialogTitle>
          <DialogDescription className="text-xs">Parqueadero Y&amp;G</DialogDescription>
        </DialogHeader>

        <form className="grid gap-3" onSubmit={handleSubmit(guardar)}>
          <div className="grid grid-cols-2 gap-3">
            {CAMPOS.map((campo) => (
              <Campo
                key={campo.clave}
                etiqueta={campo.etiqueta}
                campo={campo.clave}
                error={errors[campo.clave]?.message}
                filaCompleta={campo.filaCompleta}
              >
                <Input
                  id={campo.clave}
                  type={campo.tipo}
                  placeholder={campo.etiqueta}
                  aria-invalid={Boolean(errors[campo.clave])}
                  {...register(campo.clave)}
                />
              </Campo>
            ))}
          </div>

          <Campo etiqueta="Mensaje del Tiquete" campo="mensaje" error={errors.mensaje?.message}>
            <Textarea
              id="mensaje"
              placeholder="Mensaje para el cliente en el tiquete"
              aria-invalid={Boolean(errors.mensaje)}
              className="min-h-[70px] resize-y"
              {...register("mensaje")}
            />
          </Campo>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>

            <Button type="submit">
              <Save />
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
