import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/interfaz/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/interfaz/dialog";
import { Input } from "@/interfaz/input";
import { Label } from "@/interfaz/label";

/** Validación en la frontera: nada sale a la API sin nombre y con cifras negativas. */
const esquemaAccesorio = z.object({
  nombre: z.string().trim().min(1, "El nombre del producto es obligatorio"),
  emoji: z.string().trim(),
  precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
  costo: z.coerce.number().min(0, "El costo no puede ser negativo"),
  stock: z.coerce.number().min(0, "La cantidad no puede ser negativa"),
  minStock: z.coerce.number().min(0, "El aviso de stock no puede ser negativo"),
});

const CAMPOS_NUMERICOS = [
  { campo: "precio", etiqueta: "Precio de venta", marcador: "0" },
  { campo: "costo", etiqueta: "Costo de compra", marcador: "0" },
  { campo: "stock", etiqueta: "Cantidad disponible", marcador: "0" },
  { campo: "minStock", etiqueta: "Avisar cuando queden", marcador: "5" },
];

function Campo({ etiqueta, campo, error, children }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={campo}>{etiqueta}</Label>
      {children}
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
    </div>
  );
}

export default function FormularioAccesorio({ producto, guardando, onGuardar, onCerrar }) {
  const esNuevo = !producto;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaAccesorio),
    defaultValues: {
      nombre: producto?.nombre ?? "",
      emoji: producto?.emoji ?? "📦",
      precio: producto?.precio ?? "",
      costo: producto?.costo ?? 0,
      stock: producto?.stock ?? "",
      minStock: producto?.minStock ?? "5",
    },
  });

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
            {esNuevo ? "Nuevo Producto" : "Editar Producto"}
          </DialogTitle>
        </DialogHeader>

        <form className="grid gap-3" onSubmit={handleSubmit(onGuardar)}>
          <Campo etiqueta="Nombre" campo="nombre" error={errors.nombre?.message}>
            <Input
              id="nombre"
              placeholder="Nombre del producto"
              aria-invalid={Boolean(errors.nombre)}
              {...register("nombre")}
            />
          </Campo>

          <Campo etiqueta="Emoji" campo="emoji" error={errors.emoji?.message}>
            <Input id="emoji" placeholder="📦" {...register("emoji")} />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            {CAMPOS_NUMERICOS.map(({ campo, etiqueta, marcador }) => (
              <Campo key={campo} etiqueta={etiqueta} campo={campo} error={errors[campo]?.message}>
                <Input
                  id={campo}
                  type="number"
                  placeholder={marcador}
                  aria-invalid={Boolean(errors[campo])}
                  {...register(campo)}
                />
              </Campo>
            ))}
          </div>

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
