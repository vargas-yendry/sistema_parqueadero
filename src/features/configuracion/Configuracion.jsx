import { useState, useEffect } from "react";

const DEFAULT = {
  nombre: "Parqueadero Y&G",
  nit: "700539446-2",
  telefono1: "3148124372",
  telefono2: "3015836567",
  direccion: "Calle 17 #23-51",
  horario: "Lunes-Sábado 6:30AM a 9:30PM",
  tarifaMoto: "1000",
  tarifaCarro: "2000",
  tarifaMotoDia: "8000",
tarifaCarroDia: "15000",

tarifaMotoNoche: "5000",
tarifaCarroNoche: "10000",
  mensaje: "¡Gracias por su visita!",
};

const FIELDS = [
  { key: "nombre", label: "Nombre del Parqueadero", type: "text" },
  { key: "nit", label: "NIT", type: "text" },
  { key: "telefono1", label: "Teléfono 1", type: "tel" },
  { key: "telefono2", label: "Teléfono 2", type: "tel" },
  { key: "direccion", label: "Dirección", type: "text" },
  { key: "horario", label: "Horario", type: "text" },
  { key: "tarifaMoto", label: "Tarifa Moto ($)", type: "number" },
  { key: "tarifaCarro", label: "Tarifa Carro ($)", type: "number" },
  { key: "tarifaMotoDia", label: "Moto Día ($)", type: "number" },

{ key: "tarifaCarroDia", label: "Carro Día ($)", type: "number" },

{ key: "tarifaMotoNoche", label: "Moto Noche ($)", type: "number" },

{ key: "tarifaCarroNoche", label: "Carro Noche ($)", type: "number" },
];

export default function Configuracion({ onClose }) {
  const [datos, setDatos] = useState(DEFAULT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("configParqueadero");
    if (s) {
      try { setDatos({ ...DEFAULT, ...JSON.parse(s) }); } catch {}
    }
  }, []);

  const guardar = () => {

  localStorage.setItem(
    "configParqueadero",
    JSON.stringify(datos)
  );

  window.dispatchEvent(
    new Event("configActualizada")
  );

  setSaved(true);

  setTimeout(() => {

    setSaved(false);
    onClose();

  }, 800);

};

  const set = (k, v) => setDatos(prev => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box fade-up" onClick={e => e.stopPropagation()} style={{ width: 560 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, letterSpacing: 0.5 }}>
              ⚙ CONFIGURACIÓN
            </h2>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Parqueadero Y&amp;G</div>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: "6px 10px", fontSize: 18 }}>✕</button>
        </div>

        {/* Fields grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {FIELDS.map(f => (
            <div key={f.key} style={{ gridColumn: ["direccion", "horario"].includes(f.key) ? "1 / -1" : undefined }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 5 }}>
                {f.label}
              </div>
              <input
                type={f.type}
                value={datos[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.label}
              />
            </div>
          ))}
        </div>

        {/* Mensaje */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 5 }}>
            Mensaje del Ticket
          </div>
          <textarea
            value={datos.mensaje}
            onChange={e => set("mensaje", e.target.value)}
            style={{ height: 70, resize: "vertical" }}
            placeholder="Mensaje para el cliente en el ticket"
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            className="btn-primary"
            onClick={guardar}
            style={{ background: saved ? "var(--accent-green-dim)" : undefined, minWidth: 120, justifyContent: "center" }}
          >
            {saved ? "✓ Guardado" : "💾 Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
