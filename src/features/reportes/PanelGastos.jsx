import { Plus, Trash2 } from "lucide-react";

import { formatearFecha, formatearPesos } from "@/formato";
import { Button } from "@/interfaz/button";
import { Card, CardContent } from "@/interfaz/card";
import { Skeleton } from "@/interfaz/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/interfaz/table";

const COLUMNAS = ["Concepto", "Valor", "Fecha", "Acciones"];

/** El panel es un resumen: al lado de la tendencia solo caben los últimos gastos. */
const GASTOS_VISIBLES = 5;

const FILAS_ESQUELETO = [1, 2, 3];

const CELDA = "px-0 py-2";

export default function PanelGastos({ gastos, cargando, onNuevo, onEliminar }) {
  const visibles = gastos.slice(0, GASTOS_VISIBLES);

  return (
    <Card className="gap-0 py-4">
      <CardContent className="px-4">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="font-display text-[15px] font-bold tracking-[0.5px]">GASTOS</div>

          <Button size="sm" onClick={onNuevo}>
            <Plus />
            Nuevo
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {COLUMNAS.map((columna) => (
                <TableHead
                  key={columna}
                  className="h-auto px-0 pb-2 text-[10px] font-semibold tracking-[0.8px] text-muted-foreground uppercase"
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
              visibles.map((gasto) => (
                <TableRow key={gasto.id}>
                  <TableCell className={`${CELDA} text-[13px]`}>{gasto.concepto}</TableCell>

                  <TableCell className={`${CELDA} font-mono text-[13px] text-destructive`}>
                    -{formatearPesos(gasto.valor)}
                  </TableCell>

                  <TableCell className={`${CELDA} text-[11px] text-muted-foreground`}>
                    {/* Sin hora, "AAAA-MM-DD" se lee en UTC y en Colombia mostraría el día anterior. */}
                    {formatearFecha(`${gasto.fecha}T00:00:00`)}
                  </TableCell>

                  <TableCell className={CELDA}>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      aria-label={`Eliminar el gasto ${gasto.concepto}`}
                      onClick={() => onEliminar(gasto)}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

            {!cargando && visibles.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  className="p-6 text-center text-muted-foreground"
                  colSpan={COLUMNAS.length}
                >
                  Sin gastos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
