import {
  Banknote,
  CalendarDays,
  Car,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { formatearPesos } from "@/formato";
import { Card, CardContent } from "@/interfaz/card";
import { cn } from "@/interfaz/cn";
import { Skeleton } from "@/interfaz/skeleton";

/** El dinero que entra va en verde, lo que sale en rojo y el saldo final en violeta. */
const ENTRA = "text-exito";
const CONTEO = "text-alerta";

/** Las tarjetas entran escalonadas: cada una arranca un poco después que la anterior. */
const RETRASO_POR_TARJETA = 0.05;

const ENTRADA =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:fill-mode-both";

export default function TarjetasResumen({ datos, totalGastos, ganancia, cargando }) {
  const tarjetas = [
    {
      etiqueta: "Ingresos Parking",
      valor: formatearPesos(datos.ingresosParking),
      Icono: Banknote,
      color: ENTRA,
    },
    {
      etiqueta: "Ventas Accesorios",
      valor: formatearPesos(datos.ventasAccesorios),
      Icono: ShoppingCart,
      color: ENTRA,
    },
    {
      etiqueta: "Ganancia Accesorios",
      valor: formatearPesos(datos.gananciaAccesorios),
      Icono: Package,
      color: ENTRA,
    },
    {
      etiqueta: "Mensualidades",
      valor: formatearPesos(datos.ingresoMensualidades),
      Icono: CalendarDays,
      color: ENTRA,
    },
    {
      etiqueta: "Gastos",
      valor: formatearPesos(totalGastos),
      Icono: TrendingDown,
      color: "text-destructive",
    },
    {
      etiqueta: "Ganancia Neta",
      valor: formatearPesos(ganancia),
      Icono: TrendingUp,
      color: "text-violeta",
      destacada: true,
    },
    { etiqueta: "Vehículos", valor: datos.vehiculos, Icono: Car, color: CONTEO },
    {
      etiqueta: "Clientes Mensualidad",
      valor: datos.clientesMensualidad,
      Icono: Users,
      color: CONTEO,
    },
  ];

  return (
    <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
      {tarjetas.map((tarjeta, indice) => (
        <Card
          key={tarjeta.etiqueta}
          className={cn("gap-0 py-4", ENTRADA, tarjeta.destacada && "border-violeta/40")}
          style={{ animationDelay: `${indice * RETRASO_POR_TARJETA}s` }}
        >
          <CardContent className="px-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.8px] text-muted-foreground uppercase">
              <tarjeta.Icono className="size-3.5" />
              {tarjeta.etiqueta}
            </div>

            {cargando ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div className={cn("font-display text-[22px] leading-7 font-bold", tarjeta.color)}>
                {tarjeta.valor}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
