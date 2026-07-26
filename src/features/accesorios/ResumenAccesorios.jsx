import { Boxes, CircleDollarSign, ShoppingCart, TriangleAlert } from "lucide-react";

import { formatearPesos } from "@/formato";
import { Card, CardContent } from "@/interfaz/card";

/** Solo suma lo vendido dentro del mes calendario en curso. */
function gananciaDelMes(ventas) {
  const ahora = new Date();

  return ventas
    .filter((venta) => {
      const fecha = new Date(venta.fecha);

      return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
    })
    .reduce((total, venta) => total + (venta.ganancia || 0), 0);
}

export default function ResumenAccesorios({ productos, ventas, conStockBajo }) {
  const indicadores = [
    {
      etiqueta: "PRODUCTOS",
      Icono: Boxes,
      valor: productos.length,
      color: "text-foreground",
    },
    {
      etiqueta: "GANANCIA DEL MES",
      Icono: CircleDollarSign,
      valor: formatearPesos(gananciaDelMes(ventas)),
      color: "text-exito",
    },
    {
      etiqueta: "VENTAS",
      Icono: ShoppingCart,
      valor: productos.reduce((total, producto) => total + (producto.ventas || 0), 0),
      color: "text-violeta",
    },
    {
      etiqueta: "STOCK BAJO",
      Icono: TriangleAlert,
      valor: conStockBajo,
      color: "text-alerta",
    },
  ];

  return (
    <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
      {indicadores.map(({ etiqueta, Icono, valor, color }) => (
        <Card key={etiqueta} className="gap-0 py-4">
          <CardContent className="px-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icono className="size-3.5" />
              {etiqueta}
            </div>

            <div className={`mt-2 font-display text-[28px] leading-tight font-bold ${color}`}>
              {valor}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
