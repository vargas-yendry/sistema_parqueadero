import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "@/api";
import { obtenerEstado } from "@/features/mensualidades/estadoMensualidad";
import FormularioMensualidad from "@/features/mensualidades/FormularioMensualidad";
import TablaMensualidades from "@/features/mensualidades/TablaMensualidades";
import { fechaMasDias, fechaParaApi } from "@/formato";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/interfaz/alert-dialog";
import { Button } from "@/interfaz/button";
import { Card, CardContent } from "@/interfaz/card";
import { Input } from "@/interfaz/input";

/** La renovación siempre corre el mes desde hoy. */
const DIAS_DE_MENSUALIDAD = 30;

export default function Mensualidades() {
  const [buscar, setBuscar] = useState("");
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [enEdicion, setEnEdicion] = useState(null);
  const [porEliminar, setPorEliminar] = useState(null);
  const clienteConsultas = useQueryClient();

  const consulta = useQuery({
    queryKey: ["mensualidades"],
    queryFn: async () => (await api.get("/mensualidades")).data,
  });

  const mensualidades = consulta.data ?? [];

  const refrescar = () => clienteConsultas.invalidateQueries({ queryKey: ["mensualidades"] });

  const guardado = useMutation({
    mutationFn: ({ id, datos }) =>
      id ? api.put(`/mensualidades/${id}`, datos) : api.post("/mensualidades", datos),

    onSuccess: () => {
      refrescar();
      toast.success("Mensualidad guardada");
      setFormularioAbierto(false);
    },

    onError: () => toast.error("No se pudo guardar la mensualidad"),
  });

  const renovacion = useMutation({
    mutationFn: (mensualidad) =>
      api.put(`/mensualidades/${mensualidad.id}`, {
        cliente: mensualidad.cliente,
        placa: mensualidad.placa,
        telefono: mensualidad.telefono,
        fechaInicio: fechaParaApi(),
        fechaVencimiento: fechaMasDias(DIAS_DE_MENSUALIDAD),
        valor: mensualidad.valor,
      }),

    onSuccess: () => {
      refrescar();
      toast.success("Mensualidad renovada 30 días");
    },

    onError: () => toast.error("No se pudo renovar la mensualidad"),
  });

  const borrado = useMutation({
    mutationFn: (id) => api.delete(`/mensualidades/${id}`),

    onSuccess: () => {
      refrescar();
      toast.success("Mensualidad eliminada");
      setPorEliminar(null);
    },

    onError: () => toast.error("No se pudo eliminar la mensualidad"),
  });

  const busqueda = buscar.toLowerCase();

  const filtradas = mensualidades.filter(
    (mensualidad) =>
      mensualidad.cliente.toLowerCase().includes(busqueda) ||
      mensualidad.placa.toLowerCase().includes(busqueda),
  );

  const activas = mensualidades.filter(
    (mensualidad) => obtenerEstado(mensualidad.fechaVencimiento) === "Activa",
  );

  const vencenPronto = mensualidades.filter(
    (mensualidad) => obtenerEstado(mensualidad.fechaVencimiento) !== "Activa",
  );

  const abrirFormulario = (mensualidad) => {
    setEnEdicion(mensualidad);
    setFormularioAbierto(true);
  };

  return (
    <div className="p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-[1px]">MENSUALIDADES</h1>

          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {mensualidades.length} clientes · {activas.length} activas
          </p>
        </div>

        <Button onClick={() => abrirFormulario(null)}>
          <Plus />
          Nueva Mensualidad
        </Button>
      </div>

      {vencenPronto.length > 0 && (
        <Card className="mb-4 gap-0 border-alerta/30 bg-alerta/5 py-4">
          <CardContent className="px-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-alerta">
              <TriangleAlert className="size-3.5" />
              NOTIFICACIONES
            </div>

            {vencenPronto.map((mensualidad) => (
              <div key={mensualidad.id} className="py-[3px] text-xs text-muted-foreground">
                • La mensualidad de <b className="text-foreground">{mensualidad.placa}</b> (
                {mensualidad.cliente}){" "}
                {obtenerEstado(mensualidad.fechaVencimiento) === "Vencida"
                  ? "está vencida"
                  : "vence pronto"}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="relative mb-4 max-w-80">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          className="pl-9"
          aria-label="Buscar cliente o placa"
          placeholder="Buscar cliente o placa..."
          value={buscar}
          onChange={(evento) => setBuscar(evento.target.value)}
        />
      </div>

      <TablaMensualidades
        mensualidades={filtradas}
        cargando={consulta.isPending}
        onRenovar={(mensualidad) => renovacion.mutate(mensualidad)}
        onEditar={abrirFormulario}
        onEliminar={setPorEliminar}
      />

      {formularioAbierto && (
        <FormularioMensualidad
          mensualidad={enEdicion}
          guardando={guardado.isPending}
          onGuardar={(datos) => guardado.mutate({ id: enEdicion?.id, datos })}
          onCerrar={() => setFormularioAbierto(false)}
        />
      )}

      <AlertDialog
        open={porEliminar !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setPorEliminar(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar mensualidad?</AlertDialogTitle>

            <AlertDialogDescription>
              Se borra la mensualidad de {porEliminar?.placa} ({porEliminar?.cliente}). No se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={borrado.isPending}
              onClick={(evento) => {
                // Sin esto Radix cierra el diálogo antes de que la mutación termine.
                evento.preventDefault();
                borrado.mutate(porEliminar.id);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
