import { Pencil, RefreshCw, Trash2 } from "lucide-react";

import { obtenerEstado } from "@/features/mensualidades/estadoMensualidad";
import { formatearFecha, formatearPesos } from "@/formato";
import { Badge } from "@/interfaz/badge";
import { Button } from "@/interfaz/button";
import { Card } from "@/interfaz/card";
import { Skeleton } from "@/interfaz/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/interfaz/table";

const COLUMNAS = ["Cliente", "Placa", "Valor", "Vencimiento", "Estado", "Acciones"];

const ESTILO_ESTADO = {
  Activa: "bg-exito-tenue text-background",
  "Por vencer": "bg-alerta text-background",
  Vencida: "bg-destructive text-destructive-foreground",
};

const FILAS_ESQUELETO = [1, 2, 3];

const CELDA = "px-4 py-3";

export default function TablaMensualidades({
  mensualidades,
  cargando,
  onRenovar,
  onEditar,
  onEliminar,
}) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-superficie-alta hover:bg-superficie-alta">
            {COLUMNAS.map((columna) => (
              <TableHead
                key={columna}
                className="h-auto px-4 py-3 text-[11px] font-semibold tracking-[0.8px] text-muted-foreground uppercase"
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
            mensualidades.map((mensualidad) => {
              const estado = obtenerEstado(mensualidad.fechaVencimiento);

              return (
                <TableRow key={mensualidad.id}>
                  <TableCell className={`${CELDA} font-medium`}>{mensualidad.cliente}</TableCell>

                  <TableCell className={`${CELDA} font-mono text-[13px] text-azul-vivo`}>
                    {mensualidad.placa}
                  </TableCell>

                  <TableCell className={`${CELDA} font-semibold text-exito`}>
                    {formatearPesos(mensualidad.valor)}
                  </TableCell>

                  <TableCell className={`${CELDA} text-[13px] text-muted-foreground`}>
                    {/* Sin hora, "AAAA-MM-DD" se lee en UTC y en Colombia mostraría el día anterior. */}
                    {formatearFecha(`${mensualidad.fechaVencimiento}T00:00:00`)}
                  </TableCell>

                  <TableCell className={CELDA}>
                    <Badge className={ESTILO_ESTADO[estado]}>{estado}</Badge>
                  </TableCell>

                  <TableCell className={CELDA}>
                    <div className="flex gap-1.5">
                      <Button
                        size="icon-sm"
                        aria-label={`Renovar la mensualidad de ${mensualidad.placa}`}
                        onClick={() => onRenovar(mensualidad)}
                      >
                        <RefreshCw />
                      </Button>

                      <Button
                        size="icon-sm"
                        variant="outline"
                        aria-label={`Editar la mensualidad de ${mensualidad.placa}`}
                        onClick={() => onEditar(mensualidad)}
                      >
                        <Pencil />
                      </Button>

                      <Button
                        size="icon-sm"
                        variant="destructive"
                        aria-label={`Eliminar la mensualidad de ${mensualidad.placa}`}
                        onClick={() => onEliminar(mensualidad)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

          {!cargando && mensualidades.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                className="p-8 text-center text-muted-foreground"
                colSpan={COLUMNAS.length}
              >
                Sin resultados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
