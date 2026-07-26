import { formatearFecha, formatearPesos } from "@/formato";
import { Card, CardContent } from "@/interfaz/card";
import { Skeleton } from "@/interfaz/skeleton";

/** El eje que ya traía la vista: una letra por día de la semana. */
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

/** Lo que se ve al pasar el cursor por una barra: el dato crudo que la dibuja. */
function resumenDelDia(dia) {
  // Sin hora, "AAAA-MM-DD" se lee en UTC y en Colombia mostraría el día anterior.
  const fecha = formatearFecha(`${dia.fecha}T00:00:00`);

  return `${fecha}: ${formatearPesos(dia.total)}`;
}

export default function TendenciaBarras({ tendencia, cargando }) {
  // Un día sin ventas deja el máximo en cero y la regla de tres se rompe.
  const maximo = Math.max(...tendencia.map((dia) => Number(dia.total)), 0) || 1;

  return (
    <Card className="gap-0 py-4">
      <CardContent className="px-4">
        <div className="mb-3 font-display text-[15px] font-bold tracking-[0.5px]">
          TENDENCIA — ÚLTIMOS 7 DÍAS
        </div>

        {cargando ? (
          <Skeleton className="h-15 w-full" />
        ) : (
          <div className="flex h-15 items-end gap-1.5">
            {tendencia.map((dia) => (
              <div
                key={dia.fecha}
                title={resumenDelDia(dia)}
                className="min-h-px flex-1 rounded-t-sm bg-linear-to-t from-primary/30 to-azul-vivo"
                style={{ height: `${(Number(dia.total) / maximo) * 100}%` }}
              />
            ))}
          </div>
        )}

        <div className="mt-2 flex justify-between">
          {DIAS.map((dia, indice) => (
            <span key={`${dia}-${indice}`} className="text-[10px] text-muted-foreground">
              {dia}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
