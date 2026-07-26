import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "@/api";
import FormularioAccesorio from "@/features/accesorios/FormularioAccesorio";
import HistorialVentas from "@/features/accesorios/HistorialVentas";
import RegistroVenta from "@/features/accesorios/RegistroVenta";
import ResumenAccesorios from "@/features/accesorios/ResumenAccesorios";
import TarjetaAccesorio from "@/features/accesorios/TarjetaAccesorio";
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
import { Skeleton } from "@/interfaz/skeleton";

const TARJETAS_ESQUELETO = [1, 2, 3];

export default function Accesorios() {
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [enEdicion, setEnEdicion] = useState(null);
  const [porEliminar, setPorEliminar] = useState(null);
  const [enVenta, setEnVenta] = useState(null);
  const clienteConsultas = useQueryClient();

  const consultaProductos = useQuery({
    queryKey: ["accesorios"],
    queryFn: async () => (await api.get("/accesorios")).data,
  });

  const consultaVentas = useQuery({
    queryKey: ["ventas-accesorios"],
    queryFn: async () => (await api.get("/accesorios/ventas/historial")).data,
  });

  const productos = consultaProductos.data ?? [];
  const ventas = consultaVentas.data ?? [];
  const stockBajo = productos.filter((producto) => producto.stock <= producto.minStock);

  const refrescarProductos = () => clienteConsultas.invalidateQueries({ queryKey: ["accesorios"] });

  const guardado = useMutation({
    mutationFn: ({ id, datos }) =>
      id ? api.put(`/accesorios/${id}`, datos) : api.post("/accesorios", datos),

    onSuccess: () => {
      refrescarProductos();
      toast.success("Producto guardado");
      setFormularioAbierto(false);
    },

    onError: () => toast.error("No se pudo guardar el producto"),
  });

  const borrado = useMutation({
    mutationFn: (id) => api.delete(`/accesorios/${id}`),

    onSuccess: () => {
      refrescarProductos();
      toast.success("Producto eliminado");
      setPorEliminar(null);
    },

    onError: () => toast.error("No se pudo eliminar el producto"),
  });

  const venta = useMutation({
    mutationFn: ({ id, cantidad }) => api.post(`/accesorios/venta/${id}`, { cantidad }),

    onSuccess: () => {
      refrescarProductos();
      clienteConsultas.invalidateQueries({ queryKey: ["ventas-accesorios"] });
      toast.success("Venta registrada");
      setEnVenta(null);
    },

    onError: () => toast.error("Error registrando venta"),
  });

  const abrirFormulario = (producto) => {
    setEnEdicion(producto);
    setFormularioAbierto(true);
  };

  return (
    <div className="p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-[1px]">
            ACCESORIOS / INVENTARIO
          </h1>

          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {productos.length} productos · {stockBajo.length} con stock bajo
          </p>
        </div>

        <Button onClick={() => abrirFormulario(null)}>
          <Plus />
          Nuevo Producto
        </Button>
      </div>

      <ResumenAccesorios productos={productos} ventas={ventas} conStockBajo={stockBajo.length} />

      {stockBajo.length > 0 && (
        <Card className="mb-4 gap-0 border-alerta/30 bg-alerta/5 py-4">
          <CardContent className="px-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-alerta">
              <TriangleAlert className="size-3.5" />
              PRODUCTOS POR AGOTARSE
            </div>

            {stockBajo.map((producto) => (
              <div key={producto.id} className="py-[3px] text-xs text-muted-foreground">
                • {producto.emoji} {producto.nombre}:{" "}
                <b className="text-alerta">{producto.stock}</b> disponibles
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-[1fr_420px] items-start gap-5">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
          {consultaProductos.isPending &&
            TARJETAS_ESQUELETO.map((tarjeta) => <Skeleton key={tarjeta} className="h-64" />)}

          {!consultaProductos.isPending &&
            productos.map((producto) => (
              <TarjetaAccesorio
                key={producto.id}
                producto={producto}
                onEditar={abrirFormulario}
                onEliminar={setPorEliminar}
                onVender={setEnVenta}
              />
            ))}
        </div>

        <HistorialVentas ventas={ventas} cargando={consultaVentas.isPending} />
      </div>

      {formularioAbierto && (
        <FormularioAccesorio
          producto={enEdicion}
          guardando={guardado.isPending}
          onGuardar={(datos) => guardado.mutate({ id: enEdicion?.id, datos })}
          onCerrar={() => setFormularioAbierto(false)}
        />
      )}

      {enVenta && (
        <RegistroVenta
          producto={enVenta}
          registrando={venta.isPending}
          onRegistrar={(cantidad) => venta.mutate({ id: enVenta.id, cantidad })}
          onCerrar={() => setEnVenta(null)}
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
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>

            <AlertDialogDescription>
              Se borra {porEliminar?.nombre} del inventario. No se puede deshacer.
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
