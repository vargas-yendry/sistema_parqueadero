import { useState } from "react";

export default function ParkingGrid({ vehiculos, loading, onRefresh }) {

  const [busqueda, setBusqueda] = useState("");

  const ocupados = vehiculos || [];
  // Build a display grid of 13 slots minimum
  const totalSlots = Math.max(13, ocupados.length + 2);
  const fichasOcupadas = new Set(ocupados.map(v => v.ficha));

  // Slots: combine occupied + empty
  const slots = [];
  let emptyCount = 0;
  for (let i = 1; i <= totalSlots; i++) {
    const ficha = `F-${String(i).padStart(4, "0")}`;
    const vehiculo = ocupados.find(v => v.ficha === ficha);
    if (vehiculo) {
      slots.push({ tipo: "ocupado", data: vehiculo, ficha });
    } else if (emptyCount < 2) {
      slots.push({ tipo: "libre", ficha });
      emptyCount++;
    }
  }

  // Always show occupied + some empty slots
  const display = [
    ...ocupados.map(v => ({ tipo: "ocupado", data: v, ficha: v.ficha })),
    ...Array(Math.max(2, 13 - ocupados.length)).fill(null).map((_, i) => ({
      tipo: "libre",
      ficha: `LIBRE-${i}`,
    }))
  ].slice(0, Math.max(13, ocupados.length + 2));

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, letterSpacing: 1 }}>
            ESTADO DEL PARQUEADERO
          </h2>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>{ocupados.length}</span> ocupados · 
            <span style={{ color: "var(--text-secondary)", marginLeft: 4 }}>Actualización automática</span>
          </div>
        </div>
        <button className="btn-ghost" onClick={onRefresh} style={{ padding: "6px 12px", fontSize: 12 }}>
          ↻ Actualizar
        </button>
      </div>

      <div style={{ marginBottom: 14 }}>
  <input
    type="text"
    placeholder="🔍 Buscar placa o ficha..."
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
    style={{
      width: "100%",
      padding: "12px 14px",
      borderRadius: "10px",
      border: "1px solid var(--border)",
      background: "var(--bg-elevated)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-mono)",
      fontSize: "13px",
      outline: "none"
    }}
  />
</div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          Cargando parqueadero...
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 10,
        }}>
          {display.map((slot, idx) => (
            <SlotCard
  key={slot.ficha + idx}
  slot={slot}
  busqueda={busqueda}
/>
          ))}
        </div>
      )}
    </div>
  );
}

function SlotCard({ slot, busqueda }) {
  if (slot.tipo === "libre") {
    return (
      <div style={{
        background: "rgba(0,0,0,0.2)",
        border: "1.5px dashed var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "18px 12px",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        minHeight: 90,
        justifyContent: "center",
      }}>
        <span style={{ fontSize: 20, opacity: 0.3 }}>+</span>
        <span>Libre</span>
      </div>
    );
  }

  const { data } = slot;
  const esMoto = data.tipo === "MOTO";
  const fichaNum = data.ficha
  ? data.ficha.replace("F-", "")
  : "";

const resaltado =
  busqueda &&
  (
    data.placa?.toUpperCase() === busqueda ||
    data.ficha?.toUpperCase() === busqueda ||
    fichaNum === busqueda.padStart(4, "0")
  );

  // Elapsed time
  const mins = data.horaIngreso
    ? Math.floor((Date.now() - new Date(data.horaIngreso)) / 60000)
    : 0;
  const timeStr = mins < 60
    ? `${mins}m`
    : `${Math.floor(mins / 60)}h ${mins % 60}m`;

  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: resaltado
  ? "2px solid #3b82f6"
        : `1.5px solid ${esMoto ? "rgba(0,230,118,0.35)" : "rgba(59,138,255,0.35)"}`,
      boxShadow: resaltado
  ? "0 0 20px rgba(59,130,246,.65)"
  : "none",
      borderRadius: "var(--radius-sm)",
      padding: "14px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 5,
      transition: "all var(--transition)",
      cursor: "default",
      minHeight: 90,
    }}
    onMouseEnter={e => e.currentTarget.style.transform = resaltado
  ? "translateY(-2px) scale(1.03)"
  : "translateY(-2px)"}
    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 20 }}>{esMoto ? "🏍" : "🚗"}</span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 600,
          color: esMoto ? "var(--accent-green)" : "var(--accent-blue-bright)",
          background: esMoto ? "rgba(0,230,118,0.1)" : "rgba(59,138,255,0.1)",
          padding: "2px 6px",
          borderRadius: 4,
        }}>
          {fichaNum}
        </span>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", letterSpacing: 1 }}>
        {data.placa}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{data.tipo}</span>
        <span style={{ fontSize: 10, color: "var(--accent-amber)" }}>{timeStr}</span>
      </div>
      {esMoto && data.cascos > 0 && (
        <div style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
          🪖 {data.cascos} casco{data.cascos > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
