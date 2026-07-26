import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Ticket from "./Ticket";

const API = "http://localhost:3333";

export default function SalidaRapida({ onSuccess }) {
  const [ficha, setFicha] = useState("");
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ticketSalida, setTicketSalida] = useState(null);
  const inputRef = useRef(null);
  const botonSinTicketRef = useRef(null);

  useEffect(() => { /* No autofocus here — IngresoRapido has it */ }, []);

  const buscar = async () => {
    const f = ficha.trim();
    if (!f) return;
    setLoading(true);
    try {
      const fichaCompleta = `F-${String(parseInt(f)).padStart(4, "0")}`;
      const cfg = JSON.parse(
  localStorage.getItem("configParqueadero") || "{}"
);

const r = await axios.post(
  `${API}/api/salidas/buscar`,
  {
    ficha: fichaCompleta,

    tarifaMoto: Number(cfg.tarifaMoto || 1000),
    tarifaCarro: Number(cfg.tarifaCarro || 2000),

    tarifaMotoDia: Number(cfg.tarifaMotoDia || 8000),
    tarifaCarroDia: Number(cfg.tarifaCarroDia || 15000),

    tarifaMotoNoche: Number(cfg.tarifaMotoNoche || 5000),
    tarifaCarroNoche: Number(cfg.tarifaCarroNoche || 10000)
  }
);
      setDatos(r.data);

setTimeout(() => {
  botonSinTicketRef.current?.focus();
}, 100);
    } catch {
      setDatos(null);
      // show inline error
      setFicha("");
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const finalizar = async (imprimirTicket) => {
    if (!datos) return;
    try {
      const cfg = JSON.parse(
  localStorage.getItem("configParqueadero") || "{}"
);

await axios.post(
  `${API}/api/salidas/finalizar`,
  {
    id: datos.id,

    tarifaMoto: Number(cfg.tarifaMoto || 1000),
    tarifaCarro: Number(cfg.tarifaCarro || 2000),

    tarifaMotoDia: Number(cfg.tarifaMotoDia || 8000),
    tarifaCarroDia: Number(cfg.tarifaCarroDia || 15000),

    tarifaMotoNoche: Number(cfg.tarifaMotoNoche || 5000),
    tarifaCarroNoche: Number(cfg.tarifaCarroNoche || 10000)
  }
);
      if (imprimirTicket) {
        const now = new Date();
        const mins = datos.minutos || 0;

        const cfg = JSON.parse(
  localStorage.getItem("configParqueadero")
  || "{}"
);

const tarifaActual =
  datos.tipo === "CARRO"
    ? Number(cfg.tarifaCarro || 2000)
    : Number(cfg.tarifaMoto || 1000);
        
        setTicketSalida({
          ficha: parseInt(datos.ficha.replace("F-", "")),
          placa: datos.placa,
          modalidad: datos.modalidad,
          tipo: datos.tipo,
          cascos: datos.cascos || 0,
          fecha: now.toLocaleDateString("es-CO"),
          hora: new Date(datos.horaIngreso || now).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
          horaSalida: now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
          tiempo: mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`,
          tarifa: `$${tarifaActual.toLocaleString("es-CO")}`,
          total: `$${Number(datos.valor || 0).toLocaleString("es-CO")}`,
        });

        setTimeout(() => {

  window.print();

  setTimeout(() => {

    setTicketSalida(null);
    inputRef.current?.focus();

  }, 300);

        }, 500);
        
      }
      setFicha("");
      setDatos(null);
      onSuccess?.();
      if (!imprimirTicket) inputRef.current?.focus();
    } catch {
      alert("Error al finalizar salida");
    }
  };

  const fmt = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;

  return (
    <>
      <div className="card" style={{ border: datos ? "1.5px solid rgba(255,167,38,0.4)" : "1px solid var(--border)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, background: "rgba(255,167,38,0.15)",
            border: "1px solid rgba(255,167,38,0.3)",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>⬆</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, letterSpacing: 0.8 }}>
              SALIDA RÁPIDA
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Número de ficha + Enter</div>
          </div>
        </div>

        {/* Ficha input */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            ref={inputRef}
            type="number"
            placeholder="Ej: 1, 8, 35"
            value={ficha}
            onChange={e => { setFicha(e.target.value); setDatos(null); }}
            onKeyDown={e => {

  if (e.key === "Enter") {

    if (datos) {

      finalizar(false);

    } else {

      buscar();

    }

  }

}}
            min={1}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 20,
              fontWeight: 700,
              textAlign: "center",
              letterSpacing: 2,
              flex: 1,
              padding: "13px",
            }}
          />
          <button className="btn-ghost" onClick={buscar} disabled={loading} style={{ padding: "13px 16px", fontSize: 18 }}>
            {loading ? "…" : "🔍"}
          </button>
        </div>

        {/* Resultado */}
        {datos && (
          <div className="fade-up" style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-bright)",
            borderRadius: "var(--radius-sm)",
            padding: "14px",
            marginBottom: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--accent-amber)" }}>
                F-{String(parseInt(datos.ficha?.replace("F-", "") || 0)).padStart(4, "0")}
              </span>
              <span className="badge badge-amber">{datos.tipo}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", fontSize: 13, color: "var(--text-secondary)" }}>
              <div>Placa: <span style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{datos.placa}</span></div>
              <div>Tiempo: <span style={{ color: "var(--accent-amber)" }}>{datos.minutos} min</span></div>
              <div>
Modalidad:
<span
style={{
color:"#00e676",
fontWeight:"700",
marginLeft:"6px"
}}
>
{datos.modalidad}
</span>
</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent-green)" }}>
              Total: {fmt(datos.valor)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
              <button className="btn-success" onClick={() => finalizar(true)} style={{ justifyContent: "center", padding: "11px 8px", fontSize: 13 }}>
                🖨 Con Ticket
              </button>
              <button
              ref={botonSinTicketRef}
              onClick={() => finalizar(false)}
              style={{
                justifyContent: "center",
                padding: "11px 8px",
                fontSize: 13,
                background: "var(--bg-deep)",
                border: "1.5px solid var(--border-bright)",
                color: "var(--text-primary)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ✔ Sin Ticket
            </button>
            </div>
          </div>
        )}

        {!datos && (
          <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", padding: "8px 0" }}>
            Escribe el número de ficha y presiona Enter
          </div>
        )}
      </div>

      {ticketSalida && (
        <Ticket
          ticket={ticketSalida}
          tipo="salida"
          onClose={() => { setTicketSalida(null); inputRef.current?.focus(); }}
        />
      )}
    </>
  );
}
