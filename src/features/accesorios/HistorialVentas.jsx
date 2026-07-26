import { Receipt } from "lucide-react";

import { formatearFechaHora, formatearPesos } from "@/formato";
import { Card, CardContent } from "@/interfaz/card";
import { Skeleton } from "@/interfaz/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/interfaz/table";

const COLUMNAS = ["Fecha", "Producto", "Cantidad", "Precio", "Total"];

const FILAS_ESQUELETO = [1, 2, 3];

const CELDA = "px-2.5 py-2.5";

export default function HistorialVentas({ ventas, cargando }) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="px-4">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <Receipt className="size-4" />
          Historial de Ventas
        </h2>

        <div className="max-h-[350px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-superficie-alta hover:bg-superficie-alta">
                {COLUMNAS.map((columna) => (
                  <TableHead
                    key={columna}
                    className="h-auto px-2.5 py-2.5 text-[11px] font-semibold tracking-[0.8px] text-muted-foreground uppercase"
                  >
                    {columna}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {cargando &&
                FILAS_ESQUELETO.map((fila) => (
                  <TableRow key={fila}>
                    <TableCell className={CELDA} colSpan={COLUMNAS.length}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!cargando &&
                ventas.map((venta) => (
                  <TableRow key={venta.id}>
                    <TableCell className={`${CELDA} text-xs text-muted-foreground`}>
                      {formatearFechaHora(venta.fecha)}
                    </TableCell>

                    <TableCell className={`${CELDA} font-medium`}>{venta.producto}</TableCell>

                    <TableCell className={CELDA}>{venta.cantidad}</TableCell>

                    <TableCell className={CELDA}>{formatearPesos(venta.precio)}</TableCell>

                    <TableCell className={`${CELDA} font-semibold text-exito`}>
                      {formatearPesos(venta.total)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
