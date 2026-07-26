import { Printer } from "lucide-react";

import { obtenerConfig } from "@/features/configuracion/configuracion";
import { Button } from "@/interfaz/button";
import { cn } from "@/interfaz/cn";
import { Dialog, DialogContent, DialogTitle } from "@/interfaz/dialog";

function anchoBarra(codigo) {
  if (codigo % 3 === 0) return "w-[3px]";
  if (codigo % 5 === 0) return "w-0.5";

  return "w-px";
}

/** Barras estables: la misma ficha+placa siempre pinta el mismo código. */
function calcularBarras(ficha, placa) {
  const semilla = String(ficha) + placa;

  return Array.from({ length: 50 }, (_, i) => {
    const codigo = semilla.charCodeAt(i % semilla.length) + i;

    return {
      id: `barra-${i}`,
      ancho: anchoBarra(codigo),
      visible: codigo % 7 !== 0,
    };
  });
}

function Tiquete({ ticket, tipo = "ingreso", onClose }) {
  const config = obtenerConfig();
  const ficha = String(ticket.ficha).padStart(4, "0");
  const barras = calcularBarras(ticket.ficha, ticket.placa);

  const imprimir = () => {
    const cerrarDespuesImpresion = () => {
      onClose?.();
      window.removeEventListener("afterprint", cerrarDespuesImpresion);
    };

    window.addEventListener("afterprint", cerrarDespuesImpresion);
    window.print();
  };

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose?.();
      }}
    >
      {/* En impresión el diálogo deja de posicionar: el tiquete se ancla al papel, no al centro de la pantalla. */}
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className="justify-items-center border-0 bg-transparent p-0 shadow-none sm:max-w-xs print:static! print:translate-none!"
      >
        <DialogTitle className="sr-only">Tiquete de {tipo}</DialogTitle>

        <div
          id="tiquete-impresion"
          className="w-full rounded-lg bg-white p-2.5 font-mono text-xs text-black shadow-flotante"
        >
          <div className="mb-2.5 border-b border-dashed border-neutral-400 pb-2.5 text-center">
            <div className="text-base font-bold tracking-wider">{config.nombre}</div>
            <div>NIT: {config.nit}</div>
            <div>
              Tel: {config.telefono1} / {config.telefono2}
            </div>
            <div>{config.direccion}</div>
          </div>

          <div className="my-2.5 text-center text-3xl font-black tracking-[4px]">F-{ficha}</div>

          <div className="border-t border-dashed border-neutral-400 pt-2.5 leading-[1.8]">
            <div>
              <b>Placa:</b> {ticket.placa}
            </div>
            <div>
              <b>Tipo:</b> {ticket.tipo}
            </div>
            {ticket.cascos > 0 && (
              <div>
                <b>Cascos:</b> {ticket.cascos}
              </div>
            )}
            <div>
              <b>Ingreso:</b> {ticket.fecha} {ticket.hora}
            </div>
            {tipo === "salida" && (
              <>
                <div>
                  <b>Salida:</b> {ticket.horaSalida}
                </div>
                <div>
                  <b>Tiempo:</b> {ticket.tiempo}
                </div>
              </>
            )}
            <div>
              <b>Tarifa:</b> {ticket.tarifa}
            </div>
            <div>
              <b>Modalidad:</b> {ticket.modalidad}
            </div>
            {tipo === "salida" && (
              <div className="mt-1.5 text-[15px] font-bold">TOTAL: {ticket.total}</div>
            )}
          </div>

          <div className="mt-3 mb-2 border-t border-dashed border-neutral-400 pt-2.5 text-center">
            <div className="flex h-[35px] justify-center gap-px">
              {barras.map((barra) => (
                <div
                  key={barra.id}
                  className={cn(
                    "h-full",
                    barra.ancho,
                    barra.visible ? "bg-black" : "bg-transparent",
                  )}
                />
              ))}
            </div>
            <div className="mt-1 text-[9px] tracking-[3px]">
              {ficha}-{ticket.placa}
            </div>
          </div>

          <div className="mt-1.5 text-center text-[11px]">{config.mensaje}</div>
        </div>

        <div className="flex justify-center gap-2.5">
          <Button size="lg" onClick={imprimir}>
            <Printer />
            Imprimir
          </Button>
          <Button size="lg" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Tiquete;
