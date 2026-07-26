import {
  CalendarDays,
  ChartColumn,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  SquareParking,
  Sunrise,
} from "lucide-react";
import { useEffect, useState } from "react";

import { EVENTO_CONFIG, obtenerConfig } from "@/features/configuracion/configuracion";
import { Button } from "@/interfaz/button";
import { cn } from "@/interfaz/cn";

const MENU = [
  { id: "dashboard", etiqueta: "Tablero", Icono: LayoutDashboard },
  { id: "mensualidades", etiqueta: "Mensualidades", Icono: CalendarDays },
  { id: "accesorios", etiqueta: "Accesorios", Icono: ShoppingCart },
  { id: "reportes", etiqueta: "Reportes", Icono: ChartColumn },
  { id: "configuracion", etiqueta: "Configuración", Icono: Settings },
  { id: "nuevoDia", etiqueta: "Nuevo Día", Icono: Sunrise },
];

function BarraLateral({ vista, setVista }) {
  const [config, setConfig] = useState(obtenerConfig);

  useEffect(() => {
    const actualizarConfig = () => setConfig(obtenerConfig());

    window.addEventListener(EVENTO_CONFIG, actualizarConfig);

    return () => window.removeEventListener(EVENTO_CONFIG, actualizarConfig);
  }, []);

  return (
    <aside className="sticky top-0 z-10 flex h-dvh w-[220px] shrink-0 flex-col border-r bg-muted">
      <div className="border-b px-5 pt-5.5 pb-4.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary">
            <SquareParking className="size-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-base font-bold tracking-[1px]">
              {config.nombre}
            </div>
            <div className="text-[10px] tracking-[0.5px] text-tenue">PARQUEADERO</div>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2.5 py-3">
        {MENU.map(({ id, etiqueta, Icono }) => {
          const activo = vista === id;

          return (
            <Button
              key={id}
              variant="ghost"
              aria-current={activo ? "page" : undefined}
              onClick={() => setVista(id)}
              className={cn(
                "h-10 w-full justify-start gap-2.5 border border-transparent text-[13px]",
                activo
                  ? "border-primary/30 bg-primary/15 font-semibold text-azul-vivo hover:bg-primary/15 hover:text-azul-vivo"
                  : "font-normal text-muted-foreground hover:text-foreground",
              )}
            >
              <Icono />
              {etiqueta}
            </Button>
          );
        })}
      </nav>

      <div className="flex items-center gap-1.5 border-t px-5 py-3.5 text-[11px] text-tenue">
        <span className="size-[7px] shrink-0 rounded-full bg-exito motion-safe:animate-pulse" />
        Sistema activo
      </div>
    </aside>
  );
}

export default BarraLateral;
