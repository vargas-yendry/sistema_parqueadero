import { Check } from "lucide-react";
import { useState } from "react";

import { formatearPesos } from "@/formato";
import { Button } from "@/interfaz/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/interfaz/dialog";
import { Input } from "@/interfaz/input";
import { Label } from "@/interfaz/label";

export default function RegistroVenta({ producto, registrando, onRegistrar, onCerrar }) {
  const [cantidad, setCantidad] = useState(1);

  const registrar = () => onRegistrar(Number(cantidad));

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) {
          onCerrar();
        }
      }}
    >
      <DialogContent className="sm:max-w-90" aria-describedby={undefined}>
        <DialogHeader className="gap-1">
          <DialogTitle className="font-display text-lg font-bold tracking-[0.5px]">
            Registrar Venta
          </DialogTitle>

          <p className="text-[13px] text-muted-foreground">
            {producto.emoji} {producto.nombre} — Disponibles: {producto.stock}
          </p>
        </DialogHeader>

        <div className="grid gap-1.5">
          <Label
            htmlFor="cantidad"
            className="text-[11px] font-semibold tracking-[0.5px] text-muted-foreground"
          >
            CANTIDAD
          </Label>

          <Input
            id="cantidad"
            type="number"
            className="h-12 text-center font-mono text-xl font-bold md:text-xl"
            value={cantidad}
            min={1}
            max={producto.stock}
            autoFocus
            onChange={(evento) => setCantidad(evento.target.value)}
            onKeyDown={(evento) => {
              if (evento.key === "Enter") {
                registrar();
              }
            }}
          />
        </div>

        <div className="text-base font-semibold text-exito">
          Total: {formatearPesos(producto.precio * (cantidad || 0))}
        </div>

        <div className="flex gap-2.5">
          <Button className="flex-1" variant="outline" onClick={onCerrar}>
            Cancelar
          </Button>

          <Button
            className="flex-1 bg-exito-tenue text-background hover:bg-exito"
            disabled={registrando}
            onClick={registrar}
          >
            <Check />
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
