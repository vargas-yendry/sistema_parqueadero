import { useMutation } from "@tanstack/react-query";
import { ArrowDownToLine, Bike, Car, Check, Clock, HardHat, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "@/api";
import { obtenerConfig } from "@/features/configuracion/configuracion";
import Tiquete from "@/features/tiquetes/Tiquete";
import { formatearFecha, formatearHora, formatearPesos } from "@/formato";
import { Badge } from "@/interfaz/badge";
import { Button } from "@/interfaz/button";
import { Card, CardContent } from "@/interfaz/card";
import { cn } from "@/interfaz/cn";
import { Input } from "@/interfaz/input";

const TIPOS = [
  { valor: "MOTO", etiqueta: "Moto", Icono: Bike },
  { valor: "CARRO", etiqueta: "Carro", Icono: Car },
];

const MODALIDADES = [
  { valor: "HORA", etiqueta: "Hora", Icono: Clock },
  { valor: "DIA", etiqueta: "Día", Icono: Sun },
  { valor: "NOCHE", etiqueta: "Noche", Icono: Moon },
];

const CANTIDADES_CASCOS = [0, 1, 2, 3, 4];

/** Qué tarifa de la configuración le toca a cada combinación de vehículo y modalidad. */
const CLAVES_TARIFA = {
  MOTO: { HORA: "tarifaMoto", DIA: "tarifaMotoDia", NOCHE: "tarifaMotoNoche" },
  CARRO: { HORA: "tarifaCarro", DIA: "tarifaCarroDia", NOCHE: "tarifaCarroNoche" },
};

const esquemaPlaca = z.string().min(1, "Escribe la placa del vehículo");

export default function IngresoRapido({ onSuccess }) {
  const [placa, setPlaca] = useState("");
  const [tipo, setTipo] = useState("MOTO");
  const [cascos, setCascos] = useState(0);
  const [modalidad, setModalidad] = useState("HORA");
  const [ticket, setTicket] = useState(null);
  const [errorPlaca, setErrorPlaca] = useState("");
  const [aviso, setAviso] = useState(null); // "exito" | "error"
  const campoPlaca = useRef(null);

  // La placa es lo primero que se digita en el mostrador: el cursor arranca ahí.
  useEffect(() => {
    campoPlaca.current?.focus();
  }, []);

  const registro = useMutation({
    mutationFn: async (ingreso) => (await api.post("/ingresos", ingreso)).data,

    onSuccess: (datos, ingreso) => {
      const ahora = new Date();
      const config = obtenerConfig();

      setTicket({
        ficha: Number.parseInt(datos.ficha.replace("F-", ""), 10),
        placa: ingreso.placa,
        modalidad: ingreso.modalidad,
        tipo: ingreso.tipo,
        cascos: ingreso.cascos,
        fecha: formatearFecha(ahora),
        hora: formatearHora(ahora),
        tarifa: formatearPesos(config[CLAVES_TARIFA[ingreso.tipo][ingreso.modalidad]]),
      });

      // El tiquete alcanza a pintarse, sale por la impresora y se cierra solo.
      setTimeout(() => {
        window.print();
        setTimeout(() => setTicket(null), 300);
      }, 500);

      toast.success(`Ingreso registrado • ${datos.ficha}`);
      setAviso("exito");
      setPlaca("");
      setCascos(0);
      onSuccess?.();

      setTimeout(() => {
        setAviso(null);
        campoPlaca.current?.focus();
      }, 3000);
    },

    onError: (error) => {
      const datos = error.response?.data;

      toast.error(
        datos?.ficha ? `${datos.mensaje} • ${datos.ficha}` : "Error al registrar ingreso",
      );
      setAviso("error");

      setTimeout(() => setAviso(null), 4000);
    },
  });

  const registrar = () => {
    const validacion = esquemaPlaca.safeParse(placa.trim().toUpperCase());

    if (!validacion.success) {
      setErrorPlaca(validacion.error.issues[0].message);
      campoPlaca.current?.focus();
      return;
    }

    setErrorPlaca("");
    registro.mutate({ placa: validacion.data, tipo, cascos, modalidad });
  };

  const mostrarFormulario = placa.trim() !== "";

  return (
    <>
      <Card
        className={cn(
          "gap-0 py-4 transition-colors",
          aviso === "exito" && "border-exito/50",
          aviso === "error" && "border-destructive/50",
        )}
      >
        <CardContent className="px-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/15">
              <ArrowDownToLine className="size-4 text-azul-vivo" />
            </div>

            <div>
              <div className="font-display text-[15px] font-bold tracking-[0.8px]">
                INGRESO RÁPIDO
              </div>
              <div className="text-[10px] text-muted-foreground">Placa + Enter</div>
            </div>

            {aviso === "exito" && (
              <Badge className="ml-auto bg-exito-tenue text-background">
                <Check />
                OK
              </Badge>
            )}

            {aviso === "error" && (
              <Badge variant="destructive" className="ml-auto">
                <X />
                Error
              </Badge>
            )}
          </div>

          <Input
            ref={campoPlaca}
            type="text"
            aria-label="Placa"
            aria-invalid={errorPlaca !== ""}
            placeholder="Placa: ABC123"
            value={placa}
            maxLength={8}
            onChange={(evento) => {
              setPlaca(evento.target.value.toUpperCase());
              setErrorPlaca("");
            }}
            onKeyDown={(evento) => {
              if (evento.key === "Enter") registrar();
            }}
            className="h-auto py-3.5 text-center font-mono text-lg font-bold tracking-[3px] md:text-lg"
          />

          {errorPlaca && (
            <p className="mt-1.5 text-center text-xs font-semibold text-destructive">
              {errorPlaca}
            </p>
          )}

          {mostrarFormulario && (
            <div className="mt-2.5 motion-safe:animate-in motion-safe:duration-200 motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
              <div className="mb-2.5 grid grid-cols-2 gap-2">
                {TIPOS.map(({ valor, etiqueta, Icono }) => (
                  <Button
                    key={valor}
                    type="button"
                    variant={tipo === valor ? "default" : "outline"}
                    onClick={() => {
                      setTipo(valor);
                      campoPlaca.current?.focus();
                    }}
                  >
                    <Icono />
                    {etiqueta}
                  </Button>
                ))}
              </div>

              <div className="mb-3 grid grid-cols-3 gap-2">
                {MODALIDADES.map(({ valor, etiqueta, Icono }) => (
                  <Button
                    key={valor}
                    type="button"
                    variant={modalidad === valor ? "default" : "outline"}
                    onClick={() => setModalidad(valor)}
                  >
                    <Icono />
                    {etiqueta}
                  </Button>
                ))}
              </div>

              {tipo === "MOTO" && (
                <div className="mb-3">
                  <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold tracking-[0.5px] text-muted-foreground">
                    <HardHat className="size-3" />
                    CASCOS
                  </div>

                  <div className="flex gap-1.5">
                    {CANTIDADES_CASCOS.map((cantidad) => (
                      <Button
                        key={cantidad}
                        type="button"
                        variant={cascos === cantidad ? "default" : "outline"}
                        className="flex-1 font-bold"
                        onClick={() => {
                          setCascos(cantidad);
                          campoPlaca.current?.focus();
                        }}
                      >
                        {cantidad}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                size="lg"
                className="h-11 w-full"
                onClick={registrar}
                disabled={registro.isPending}
              >
                {registro.isPending ? (
                  "Registrando..."
                ) : (
                  <>
                    <ArrowDownToLine />
                    Registrar Ingreso
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {ticket && <Tiquete ticket={ticket} tipo="ingreso" onClose={() => setTicket(null)} />}
    </>
  );
}
