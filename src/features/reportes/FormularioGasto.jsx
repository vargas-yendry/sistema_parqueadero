import { useState } from "react";

import { fechaParaApi } from "@/formato";

import { Button } from "@/interfaz/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/interfaz/dialog";
import { Input } from "@/interfaz/input";

export default function FormularioGasto({ guardando, onGuardar, onCerrar }) {
  const [concepto, setConcepto] = useState("");
  const [valor, setValor] = useState("");
  const [fecha, setFecha] = useState(fechaParaApi);

  const guardar = () => {
    if (!concepto || !valor) {
      return;
    }

    onGuardar({ concepto, valor, fecha });
  };

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) {
          onCerrar();
        }
      }}
    >
      <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">Nuevo Gasto</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <Input
            autoFocus
            aria-label="Concepto"
            placeholder="Concepto"
            value={concepto}
            onChange={(evento) => setConcepto(evento.target.value)}
          />

          <Input
            type="number"
            aria-label="Valor"
            placeholder="Valor"
            value={valor}
            onChange={(evento) => setValor(evento.target.value)}
          />

          <Input
            type="date"
            aria-label="Fecha"
            value={fecha}
            onChange={(evento) => setFecha(evento.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>
            Cancelar
          </Button>

          <Button disabled={guardando} onClick={guardar}>
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
