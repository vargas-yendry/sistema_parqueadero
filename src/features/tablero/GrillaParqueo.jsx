import { Bike, Car, HardHat, Plus, RotateCw, Search, SearchX } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/interfaz/badge";
import { Button } from "@/interfaz/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/interfaz/card";
import { cn } from "@/interfaz/cn";
import { Input } from "@/interfaz/input";
import { Skeleton } from "@/interfaz/skeleton";

/** La grilla nunca se ve a medias: pinta 13 casillas o, si hay más carros, 2 libres de colchón. */
const MINIMO_CASILLAS = 13;
const LIBRES_DE_COLCHON = 2;

const CLASES_GRILLA = "grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5";

const ESQUELETOS = Array.from({ length: MINIMO_CASILLAS }, (_, i) => `esqueleto-${i}`);

function tiempoTranscurrido(horaIngreso) {
  const minutos = horaIngreso ? Math.floor((Date.now() - new Date(horaIngreso)) / 60000) : 0;

  return minutos < 60 ? `${minutos}m` : `${Math.floor(minutos / 60)}h ${minutos % 60}m`;
}

export default function GrillaParqueo({ vehiculos, cargando, onRefrescar }) {
  const [busqueda, setBusqueda] = useState("");

  const ocupados = vehiculos || [];

  const encontrados = busqueda
    ? ocupados.filter(
        (vehiculo) =>
          vehiculo.placa?.toUpperCase().includes(busqueda) ||
          vehiculo.ficha?.toUpperCase().includes(busqueda),
      )
    : ocupados;

  // Buscando solo importan las coincidencias: las casillas libres estorbarían.
  const libres = busqueda ? 0 : Math.max(LIBRES_DE_COLCHON, MINIMO_CASILLAS - ocupados.length);

  const casillas = [
    ...encontrados.map((vehiculo) => ({ tipo: "ocupado", vehiculo, ficha: vehiculo.ficha })),
    ...Array.from({ length: libres }, (_, i) => ({ tipo: "libre", ficha: `LIBRE-${i}` })),
  ];

  return (
    <Card className="gap-4">
      <CardHeader className="gap-0">
        <CardTitle className="font-display text-[17px] font-bold tracking-[1px]">
          ESTADO DEL PARQUEADERO
        </CardTitle>

        <div className="mt-0.5 text-xs text-muted-foreground">
          <span className="font-semibold text-exito">{ocupados.length}</span> ocupados ·
          Actualización automática
        </div>

        <CardAction>
          <Button variant="outline" size="sm" className="text-xs" onClick={onRefrescar}>
            <RotateCw />
            Actualizar
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3.5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
            placeholder="Buscar placa o ficha..."
            aria-label="Buscar placa o ficha"
            className="h-11 bg-superficie-alta pl-10 font-mono text-[13px]"
          />
        </div>

        {cargando && (
          <div className={CLASES_GRILLA}>
            {ESQUELETOS.map((id) => (
              <Skeleton key={id} className="h-[90px] rounded-lg" />
            ))}
          </div>
        )}

        {!cargando && casillas.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <SearchX className="size-8 text-tenue" />
            <span>Ninguna casilla coincide con «{busqueda}»</span>
          </div>
        )}

        {!cargando && casillas.length > 0 && (
          <div className={CLASES_GRILLA}>
            {casillas.map((casilla, indice) => (
              <TarjetaCasilla key={casilla.ficha + indice} casilla={casilla} busqueda={busqueda} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TarjetaCasilla({ casilla, busqueda }) {
  if (casilla.tipo === "libre") {
    return (
      <div className="flex min-h-[90px] flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-border bg-muted px-3 py-4.5 text-xs text-muted-foreground">
        <Plus className="size-5 text-tenue" />
        <span>Libre</span>
      </div>
    );
  }

  const { vehiculo } = casilla;
  const esMoto = vehiculo.tipo === "MOTO";
  const numeroFicha = vehiculo.ficha ? vehiculo.ficha.replace("F-", "") : "";
  const Icono = esMoto ? Bike : Car;
  const colorTipo = esMoto ? "text-exito" : "text-azul-vivo";

  const resaltado =
    Boolean(busqueda) &&
    (vehiculo.placa?.toUpperCase() === busqueda ||
      vehiculo.ficha?.toUpperCase() === busqueda ||
      numeroFicha === busqueda.padStart(4, "0"));

  return (
    <div
      className={cn(
        "flex min-h-[90px] flex-col gap-1.5 rounded-lg border-[1.5px] bg-superficie-alta px-3 py-3.5",
        "motion-safe:transition-transform motion-safe:hover:-translate-y-0.5",
        esMoto ? "border-exito/35" : "border-azul-vivo/35",
        resaltado &&
          "border-2 border-azul-vivo shadow-[0_0_20px] shadow-azul-vivo/65 motion-safe:hover:scale-[1.03]",
      )}
    >
      <div className="flex items-center justify-between">
        <Icono className={cn("size-5", colorTipo)} />

        <Badge
          variant="secondary"
          className={cn(
            "rounded-sm px-1.5 font-mono text-[10px] font-semibold",
            esMoto ? "bg-exito/10" : "bg-azul-vivo/10",
            colorTipo,
          )}
        >
          {numeroFicha}
        </Badge>
      </div>

      <div className="font-mono text-xs font-semibold tracking-[1px]">{vehiculo.placa}</div>

      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">{vehiculo.tipo}</span>
        <span className="text-alerta">{tiempoTranscurrido(vehiculo.horaIngreso)}</span>
      </div>

      {esMoto && vehiculo.cascos > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <HardHat className="size-3" />
          {vehiculo.cascos} casco{vehiculo.cascos > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
