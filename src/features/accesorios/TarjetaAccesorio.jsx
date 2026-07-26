import { Pencil, Plus, Trash2 } from "lucide-react";

import { formatearPesos } from "@/formato";
import { Badge } from "@/interfaz/badge";
import { Button } from "@/interfaz/button";
import { Card, CardContent } from "@/interfaz/card";
import { cn } from "@/interfaz/cn";

export default function TarjetaAccesorio({ producto, onEditar, onEliminar, onVender }) {
  const stockBajo = producto.stock <= producto.minStock;

  return (
    <Card className={cn("gap-0 py-4", stockBajo && "border-alerta/30")}>
      <CardContent className="px-4">
        <div className="mb-3 flex items-center justify-between">
          {/* El emoji es dato del producto, no un icono de la interfaz. */}
          <span className="text-[28px] leading-none">{producto.emoji}</span>

          <div className="flex gap-1.5">
            <Button
              size="icon-sm"
              variant="outline"
              aria-label={`Editar ${producto.nombre}`}
              onClick={() => onEditar(producto)}
            >
              <Pencil />
            </Button>

            <Button
              size="icon-sm"
              variant="destructive"
              aria-label={`Eliminar ${producto.nombre}`}
              onClick={() => onEliminar(producto)}
            >
              <Trash2 />
            </Button>
          </div>
        </div>

        <div className="mb-1 text-[15px] font-semibold">{producto.nombre}</div>

        <div className="mb-2 font-display text-lg font-bold text-exito">
          {formatearPesos(producto.precio)}
        </div>

        <div className="mb-1 text-xs text-muted-foreground">
          Costo: {formatearPesos(producto.costo || 0)}
        </div>

        <div className="mb-2.5 text-xs font-semibold text-exito-tenue">
          Ganancia: {formatearPesos((producto.precio || 0) - (producto.costo || 0))}
        </div>

        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            Stock:
            {stockBajo ? (
              <Badge className="bg-alerta text-background">{producto.stock}</Badge>
            ) : (
              <span className="font-semibold text-foreground">{producto.stock}</span>
            )}
          </div>

          <div>Vendidas: {producto.ventas}</div>
        </div>

        <Button
          className="w-full bg-exito-tenue text-background hover:bg-exito"
          disabled={producto.stock === 0}
          onClick={() => onVender(producto)}
        >
          <Plus />
          Registrar Venta
        </Button>
      </CardContent>
    </Card>
  );
}
