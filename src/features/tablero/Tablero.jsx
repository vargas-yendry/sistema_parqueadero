import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Banknote, Car, TrendingUp } from "lucide-react";

import { api } from "@/api";
import IngresoRapido from "@/features/ingresos/IngresoRapido";
import SalidaRapida from "@/features/salidas/SalidaRapida";
import GrillaParqueo from "@/features/tablero/GrillaParqueo";
import { formatearPesos } from "@/formato";
import { Card, CardContent } from "@/interfaz/card";
import { cn } from "@/interfaz/cn";
import { Skeleton } from "@/interfaz/skeleton";

/** El tablero queda abierto en el mostrador durante la jornada: se refresca solo. */
const INTERVALO_REFRESCO = 10_000;

const ESTADISTICAS_VACIAS = {
  vehiculosHoy: 0,
  ingresosHoy: 0,
  salidasHoy: 0,
  gananciaNeta: 0,
};

function TarjetaEstadistica({ etiqueta, valor, Icono, color, retraso, cargando }) {
  return (
    <Card
      className={cn(
        "gap-0 py-4 motion-safe:animate-in motion-safe:duration-200 motion-safe:fill-mode-backwards motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
        retraso,
      )}
    >
      <CardContent className="flex items-start justify-between px-4">
        <div>
          <div className="mb-2 text-[11px] font-semibold tracking-[0.8px] text-muted-foreground uppercase">
            {etiqueta}
          </div>

          {cargando ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <div className={cn("font-display text-[26px] font-bold", color)}>{valor}</div>
          )}
        </div>

        <Icono className={cn("size-[22px] opacity-70", color)} />
      </CardContent>
    </Card>
  );
}

export default function Tablero() {
  const clienteConsultas = useQueryClient();

  const consultaVehiculos = useQuery({
    queryKey: ["vehiculos"],
    queryFn: async () => (await api.get("/vehiculos")).data,
    refetchInterval: INTERVALO_REFRESCO,
  });

  const consultaEstadisticas = useQuery({
    queryKey: ["salidas", "estadisticas"],
    queryFn: async () => (await api.get("/salidas/estadisticas")).data,
    refetchInterval: INTERVALO_REFRESCO,
  });

  const estadisticas = consultaEstadisticas.data ?? ESTADISTICAS_VACIAS;

  const refrescar = () => {
    clienteConsultas.invalidateQueries({ queryKey: ["vehiculos"] });
    clienteConsultas.invalidateQueries({ queryKey: ["salidas", "estadisticas"] });
  };

  const tarjetas = [
    {
      etiqueta: "Vehículos Hoy",
      valor: estadisticas.vehiculosHoy,
      Icono: Car,
      color: "text-azul-vivo",
      retraso: "motion-safe:delay-0",
    },
    {
      etiqueta: "Ingresos Hoy",
      valor: formatearPesos(estadisticas.ingresosHoy),
      Icono: Banknote,
      color: "text-exito",
      retraso: "motion-safe:delay-75",
    },
    {
      etiqueta: "Salidas Hoy",
      valor: estadisticas.salidasHoy,
      Icono: ArrowUpRight,
      color: "text-alerta",
      retraso: "motion-safe:delay-150",
    },
    {
      etiqueta: "Ganancia Neta",
      valor: formatearPesos(estadisticas.gananciaNeta),
      Icono: TrendingUp,
      color: "text-violeta",
      retraso: "motion-safe:delay-200",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
        {tarjetas.map((tarjeta) => (
          <TarjetaEstadistica
            key={tarjeta.etiqueta}
            {...tarjeta}
            cargando={consultaEstadisticas.isPending}
          />
        ))}
      </div>

      <div className="grid grid-cols-[1fr_340px] items-start gap-5">
        <GrillaParqueo
          vehiculos={consultaVehiculos.data ?? []}
          loading={consultaVehiculos.isPending}
          onRefresh={refrescar}
        />

        <div className="flex flex-col gap-4">
          <IngresoRapido onSuccess={refrescar} />
          <SalidaRapida onSuccess={refrescar} />
        </div>
      </div>
    </div>
  );
}
