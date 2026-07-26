import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "@/api";
import FormularioGasto from "@/features/reportes/FormularioGasto";
import PanelGastos from "@/features/reportes/PanelGastos";
import TarjetasResumen from "@/features/reportes/TarjetasResumen";
import TendenciaBarras from "@/features/reportes/TendenciaBarras";
import { formatearPesos } from "@/formato";
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
import { Tabs, TabsList, TabsTrigger } from "@/interfaz/tabs";

/** Los nombres son los que la API espera en ?filtro=. */
const FILTROS = ["Hoy", "Semana", "Mes", "Año"];

/** Mientras la consulta no responde, las cifras se muestran en cero. */
const RESUMEN_VACIO = {
  ingresosParking: 0,
  vehiculos: 0,
  ventasAccesorios: 0,
  gananciaAccesorios: 0,
  ingresoMensualidades: 0,
  clientesMensualidad: 0,
  tendencia: [],
};

export default function Reportes() {
  const [filtro, setFiltro] = useState("Hoy");
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [porEliminar, setPorEliminar] = useState(null);
  const clienteConsultas = useQueryClient();

  const consultaReporte = useQuery({
    queryKey: ["reportes", filtro],
    queryFn: async () => (await api.get("/reportes", { params: { filtro } })).data,
  });

  // Los gastos llegan recortados por el mismo rango: el filtro es parte de la clave.
  const consultaGastos = useQuery({
    queryKey: ["gastos", filtro],
    queryFn: async () => (await api.get("/gastos", { params: { filtro } })).data,
  });

  const datos = consultaReporte.data ?? RESUMEN_VACIO;
  const gastos = consultaGastos.data ?? [];

  const refrescarGastos = () => clienteConsultas.invalidateQueries({ queryKey: ["gastos"] });

  const guardado = useMutation({
    mutationFn: ({ concepto, valor, fecha }) =>
      api.post("/gastos", { concepto, valor: Number(valor), fecha }),

    onSuccess: () => {
      refrescarGastos();
      toast.success("Gasto registrado");
      setFormularioAbierto(false);
    },

    onError: () => toast.error("No se pudo registrar el gasto"),
  });

  const borrado = useMutation({
    mutationFn: (id) => api.delete(`/gastos/${id}`),

    onSuccess: () => {
      refrescarGastos();
      toast.success("Gasto eliminado");
      setPorEliminar(null);
    },

    onError: () => toast.error("No se pudo eliminar el gasto"),
  });

  const totalGastos = gastos.reduce((acumulado, gasto) => acumulado + Number(gasto.valor), 0);

  const ganancia =
    datos.ingresosParking + datos.gananciaAccesorios + datos.ingresoMensualidades - totalGastos;

  return (
    <div className="p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-[1px]">REPORTES</h1>

          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Resumen financiero del parqueadero
          </p>
        </div>

        <Tabs value={filtro} onValueChange={setFiltro}>
          <TabsList>
            {FILTROS.map((rango) => (
              <TabsTrigger key={rango} value={rango} className="px-4 font-semibold">
                {rango}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <TarjetasResumen
        datos={datos}
        totalGastos={totalGastos}
        ganancia={ganancia}
        cargando={consultaReporte.isPending || consultaGastos.isPending}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <TendenciaBarras tendencia={datos.tendencia ?? []} cargando={consultaReporte.isPending} />

        <PanelGastos
          gastos={gastos}
          cargando={consultaGastos.isPending}
          onNuevo={() => setFormularioAbierto(true)}
          onEliminar={setPorEliminar}
        />
      </div>

      {formularioAbierto && (
        <FormularioGasto
          guardando={guardado.isPending}
          onGuardar={(gasto) => guardado.mutate(gasto)}
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
            <AlertDialogTitle>¿Eliminar gasto?</AlertDialogTitle>

            <AlertDialogDescription>
              Se borra {porEliminar?.concepto} por {formatearPesos(porEliminar?.valor)}. No se puede
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
