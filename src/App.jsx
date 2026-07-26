import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "@/api";
import Accesorios from "@/features/accesorios/Accesorios";
import Configuracion from "@/features/configuracion/Configuracion";
import Mensualidades from "@/features/mensualidades/Mensualidades";
import Reportes from "@/features/reportes/Reportes";
import Tablero from "@/features/tablero/Tablero";
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
import BarraLateral from "@/navegacion/BarraLateral";

const VISTAS = {
  dashboard: Tablero,
  mensualidades: Mensualidades,
  accesorios: Accesorios,
  reportes: Reportes,
};

function App() {
  const [vista, setVista] = useState("dashboard");
  const [configAbierta, setConfigAbierta] = useState(false);
  const [confirmandoNuevoDia, setConfirmandoNuevoDia] = useState(false);
  const clienteConsultas = useQueryClient();

  const cambiarVista = (destino) => {
    if (destino === "nuevoDia") {
      setConfirmandoNuevoDia(true);
      return;
    }

    if (destino === "configuracion") {
      setConfigAbierta(true);
      return;
    }

    setVista(destino);
  };

  const iniciarNuevoDia = async () => {
    try {
      await api.post("/nuevo-dia");

      // El día nuevo cambia todo lo que hay en pantalla.
      await clienteConsultas.invalidateQueries();

      toast.success("Nuevo día iniciado correctamente");
      setVista("dashboard");
    } catch {
      toast.error("No se pudo iniciar el nuevo día");
    }
  };

  const VistaActual = VISTAS[vista] ?? Tablero;

  return (
    <div className="flex h-dvh bg-background">
      <BarraLateral vista={vista} setVista={cambiarVista} />

      <main className="min-w-0 flex-1 overflow-auto">
        <VistaActual />
      </main>

      {configAbierta && <Configuracion onClose={() => setConfigAbierta(false)} />}

      <AlertDialog open={confirmandoNuevoDia} onOpenChange={setConfirmandoNuevoDia}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Iniciar un nuevo día?</AlertDialogTitle>
            <AlertDialogDescription>
              Se limpia el tablero y las casillas quedan libres. Los vehículos que sigan adentro
              dejarán de aparecer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={iniciarNuevoDia}>Iniciar nuevo día</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default App;
