import { useMutation } from "@tanstack/react-query";
import { ArrowUpFromLine, Check, Loader2, Printer, Search } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { api } from "@/api";
import { obtenerConfig } from "@/features/configuracion/config";
import Tiquete from "@/features/tiquetes/Tiquete";
import { formatearFecha, formatearHora, formatearPesos } from "@/formato";
import { Badge } from "@/interfaz/badge";
import { Button } from "@/interfaz/button";
import { Card, CardContent } from "@/interfaz/card";
import { cn } from "@/interfaz/cn";
import { Input } from "@/interfaz/input";

/** El cobro lo recalcula el servidor: se le mandan las tarifas guardadas en este equipo. */
function tarifasVigentes() {
  const config = obtenerConfig();

  return {
    tarifaMoto: config.tarifaMoto,
    tarifaCarro: config.tarifaCarro,
    tarifaMotoDia: config.tarifaMotoDia,
    tarifaCarroDia: config.tarifaCarroDia,
    tarifaMotoNoche: config.tarifaMotoNoche,
    tarifaCarroNoche: config.tarifaCarroNoche,
  };
}

/** El operario digita "8": la ficha guardada es "F-0008". */
function fichaCompleta(numero) {
  return `F-${String(Number.parseInt(numero, 10)).padStart(4, "0")}`;
}

function numeroDeFicha(ficha) {
  return Number.parseInt(String(ficha).replace("F-", ""), 10) || 0;
}

function tiempoLegible(minutos) {
  if (minutos < 60) {
    return `${minutos} min`;
  }

  return `${Math.floor(minutos / 60)}h ${minutos % 60}m`;
}

function tiqueteDeSalida(vehiculo) {
  const ahora = new Date();
  const config = obtenerConfig();

  // En el papel siempre va la tarifa por hora, incluso en DIA y NOCHE (así se imprime desde v2).
  const tarifa = vehiculo.tipo === "CARRO" ? config.tarifaCarro : config.tarifaMoto;

  return {
    ficha: numeroDeFicha(vehiculo.ficha),
    placa: vehiculo.placa,
    modalidad: vehiculo.modalidad,
    tipo: vehiculo.tipo,
    cascos: vehiculo.cascos || 0,
    fecha: formatearFecha(ahora),
    hora: formatearHora(vehiculo.horaIngreso || ahora),
    horaSalida: formatearHora(ahora),
    tiempo: tiempoLegible(vehiculo.minutos || 0),
    tarifa: formatearPesos(tarifa),
    total: formatearPesos(vehiculo.valor),
  };
}

export default function SalidaRapida({ onRefrescar }) {
  const [ficha, setFicha] = useState("");
  const [tiquete, setTiquete] = useState(null);

  // El foco de arranque es de IngresoRapido: esta tarjeta no se lo quita.
  const campoFicha = useRef(null);
  const botonSinTiquete = useRef(null);

  const busqueda = useMutation({
    mutationFn: async (numero) =>
      (await api.post("/salidas/buscar", { ficha: fichaCompleta(numero), ...tarifasVigentes() }))
        .data,

    onSuccess: () => {
      // El botón todavía no está pintado cuando responde el servidor.
      setTimeout(() => botonSinTiquete.current?.focus(), 100);
    },

    onError: (error) => {
      toast.error(error.response?.data?.mensaje ?? "Ficha no encontrada");
      setFicha("");
      campoFicha.current?.focus();
    },
  });

  const datos = busqueda.data ?? null;

  const salida = useMutation({
    mutationFn: async ({ vehiculo }) =>
      (await api.post("/salidas/finalizar", { id: vehiculo.id, ...tarifasVigentes() })).data,

    onSuccess: (_respuesta, { vehiculo, conTiquete }) => {
      if (conTiquete) {
        setTiquete(tiqueteDeSalida(vehiculo));

        // El tiquete alcanza a pintarse, sale por la impresora y se cierra solo.
        setTimeout(() => {
          window.print();

          // El foco lo devuelve el propio diálogo al desmontarse (alCerrarFoco).
          setTimeout(() => setTiquete(null), 300);
        }, 500);
      }

      toast.success("Salida registrada");
      setFicha("");
      busqueda.reset();
      onRefrescar?.();

      if (!conTiquete) {
        campoFicha.current?.focus();
      }
    },

    onError: () => toast.error("Error al finalizar salida"),
  });

  const buscar = () => {
    const numero = ficha.trim();

    if (numero) {
      busqueda.mutate(numero);
    }
  };

  const finalizar = (conTiquete) => {
    if (datos) {
      salida.mutate({ vehiculo: datos, conTiquete });
    }
  };

  return (
    <>
      <Card className={cn("gap-0 py-4 transition-colors", datos && "border-alerta/40")}>
        <CardContent className="px-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg border border-alerta/30 bg-alerta/15">
              <ArrowUpFromLine className="size-4 text-alerta" />
            </div>

            <div>
              <div className="font-display text-[15px] font-bold tracking-[0.8px]">
                SALIDA RÁPIDA
              </div>
              <div className="text-[10px] text-muted-foreground">Número de ficha + Enter</div>
            </div>
          </div>

          <div className="mb-3 flex gap-2">
            <Input
              ref={campoFicha}
              type="number"
              min={1}
              aria-label="Número de ficha"
              placeholder="Ej: 1, 8, 35"
              value={ficha}
              onChange={(evento) => {
                setFicha(evento.target.value);
                busqueda.reset();
              }}
              onKeyDown={(evento) => {
                if (evento.key !== "Enter") {
                  return;
                }

                if (datos) {
                  finalizar(false);
                } else {
                  buscar();
                }
              }}
              className="h-auto flex-1 py-3.5 text-center font-mono text-xl font-bold tracking-[2px] md:text-xl"
            />

            <Button
              variant="outline"
              aria-label="Buscar ficha"
              onClick={buscar}
              disabled={busqueda.isPending}
              className="h-auto px-4"
            >
              {busqueda.isPending ? <Loader2 className="motion-safe:animate-spin" /> : <Search />}
            </Button>
          </div>

          {datos && (
            <div className="mb-3 rounded-md border border-borde-vivo bg-superficie-alta p-3.5 motion-safe:animate-in motion-safe:duration-200 motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-lg font-bold text-alerta">
                  {fichaCompleta(numeroDeFicha(datos.ficha))}
                </span>

                <Badge variant="outline" className="border-alerta/30 bg-alerta/15 text-alerta">
                  {datos.tipo}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                <div>
                  Placa: <span className="font-mono text-foreground">{datos.placa}</span>
                </div>
                <div>
                  Modalidad: <span className="font-semibold text-exito">{datos.modalidad}</span>
                </div>
              </div>

              <div className="mt-2.5 flex items-end justify-between border-t border-border pt-2.5">
                <div>
                  <div className="text-[10px] tracking-[0.8px] text-muted-foreground uppercase">
                    Tiempo
                  </div>
                  <div className="font-display text-lg font-bold text-alerta">
                    {datos.minutos} min
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] tracking-[0.8px] text-muted-foreground uppercase">
                    Total
                  </div>
                  <div className="font-display text-[22px] leading-tight font-bold text-exito">
                    {formatearPesos(datos.valor)}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  className="bg-exito-tenue text-background hover:bg-exito"
                  onClick={() => finalizar(true)}
                >
                  <Printer />
                  Con Tiquete
                </Button>

                <Button ref={botonSinTiquete} variant="outline" onClick={() => finalizar(false)}>
                  <Check />
                  Sin Tiquete
                </Button>
              </div>
            </div>
          )}

          {!datos && (
            <div className="py-2 text-center text-[11px] text-muted-foreground">
              Escribe el número de ficha y presiona Enter
            </div>
          )}
        </CardContent>
      </Card>

      {tiquete && (
        <Tiquete
          tiquete={tiquete}
          tipo="salida"
          onClose={() => setTiquete(null)}
          alCerrarFoco={() => campoFicha.current?.focus()}
        />
      )}
    </>
  );
}
