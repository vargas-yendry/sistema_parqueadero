import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Tiquete from "@/features/tiquetes/Tiquete";
const API = "http://localhost:3333";

function getConfig() {
  try {
    const s = localStorage.getItem("configParqueadero");

    return s
      ? JSON.parse(s)
      : {
          tarifaMoto: 1000,
          tarifaCarro: 2000
        };

  } catch {
    return {
      tarifaMoto: 1000,
      tarifaCarro: 2000
    };
  }
}

export default function IngresoRapido({ onSuccess }) {
  const [placa, setPlaca] = useState("");
  const [tipo, setTipo] = useState("MOTO");
  const [cascos, setCascos] = useState(0);
  const [modalidad, setModalidad] = useState("HORA");
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [flash, setFlash] = useState(null); // "ok" | "err"
  const [mensajeError, setMensajeError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const registrar = async () => {
    const p = placa.trim().toUpperCase();
    if (!p) { inputRef.current?.focus(); return; }
    setLoading(true);
    try {
      const r = await axios.post(
  `${API}/api/ingresos`,
  {
    placa: p,
    tipo,
    cascos: parseInt(cascos),
    modalidad
  }
);
      const now = new Date();

const config = getConfig();

let tarifaActual = 0;

if (tipo === "MOTO") {

  if (modalidad === "HORA")
    tarifaActual = Number(config.tarifaMoto);

  if (modalidad === "DIA")
    tarifaActual = Number(config.tarifaMotoDia || 0);

  if (modalidad === "NOCHE")
    tarifaActual = Number(config.tarifaMotoNoche || 0);

} else {

  if (modalidad === "HORA")
    tarifaActual = Number(config.tarifaCarro);

  if (modalidad === "DIA")
    tarifaActual = Number(config.tarifaCarroDia || 0);

  if (modalidad === "NOCHE")
    tarifaActual = Number(config.tarifaCarroNoche || 0);

}
      
      setTicket({
  ficha: parseInt(r.data.ficha.replace("F-", "")),
  placa: p,
  modalidad,
  tipo,
  cascos: parseInt(cascos),
  fecha: now.toLocaleDateString("es-CO"),
  hora: now.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit"
  }),
  tarifa: new Intl.NumberFormat(
    "es-CO",
    {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }
  ).format(tarifaActual),
});

setTimeout(() => {

  window.print();

  setTimeout(() => {

    setTicket(null);

  }, 300);

}, 500);
      setFlash("ok");
      setPlaca("");
setCascos(0);
setMostrarFormulario(false);
      onSuccess?.();
      setTimeout(() => { setFlash(null); inputRef.current?.focus(); }, 3000);
    } catch (error) {

  const data = error.response?.data;

  if (data?.ficha) {
    setMensajeError(
      `${data.mensaje} • ${data.ficha}`
    );
  } else {
    setMensajeError("Error al registrar ingreso");
  }

  setFlash("err");

  setTimeout(() => {
    setFlash(null);
    setMensajeError("");
  }, 4000);
} finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter") registrar(); };

  return (
    <>
      <div className="card" style={{
        border: flash === "ok" ? "1.5px solid rgba(0,230,118,0.5)" : flash === "err" ? "1.5px solid rgba(239,83,80,0.5)" : "1px solid var(--border)",
        transition: "border-color 0.3s",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, background: "rgba(29,111,232,0.15)",
            border: "1px solid rgba(29,111,232,0.3)",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>⬇</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, letterSpacing: 0.8 }}>
              INGRESO RÁPIDO
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Placa + Enter</div>
          </div>
          {flash === "ok" && (
            <span className="badge badge-green" style={{ marginLeft: "auto" }}>✓ OK</span>
          )}
          {flash === "err" && (
            <span className="badge badge-red" style={{ marginLeft: "auto" }}>✗ Error</span>
          )}
        </div>

        {/* Placa input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Placa: ABC123"
          value={placa}
          onChange={e => {
  const valor = e.target.value.toUpperCase();
  setPlaca(valor);
  setMostrarFormulario(valor.trim() !== "");
}}
          onKeyDown={onKey}
          maxLength={8}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 3,
            textAlign: "center",
            padding: "14px",
            marginBottom: 10,
          }}
        />

{mostrarFormulario && (
  <>
  
{mensajeError && (
  <div
    style={{
      marginBottom: 10,
      padding: "10px",
      borderRadius: 8,
      background: "rgba(239,83,80,0.12)",
      border: "1px solid rgba(239,83,80,0.3)",
      color: "#ff8a80",
      fontSize: 12,
      fontWeight: 600,
      textAlign: "center"
    }}
  >
    ⚠ {mensajeError}
  </div>
)}

        {/* Tipo vehículo */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          {["MOTO", "CARRO"].map(t => (
            <button
              key={t}
              onClick={() => { setTipo(t); inputRef.current?.focus(); }}
              style={{
                padding: "10px",
                background: tipo === t ? (t === "MOTO" ? "rgba(0,230,118,0.15)" : "rgba(59,138,255,0.15)") : "var(--bg-deep)",
                border: `1.5px solid ${tipo === t ? (t === "MOTO" ? "rgba(0,230,118,0.4)" : "rgba(59,138,255,0.4)") : "var(--border)"}`,
                color: tipo === t ? (t === "MOTO" ? "var(--accent-green)" : "var(--accent-blue-bright)") : "var(--text-secondary)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {t === "MOTO" ? "🏍 Moto" : "🚗 Carro"}
            </button>

          ))}
        </div>

        <div
style={{
display:"grid",
gridTemplateColumns:"1fr 1fr 1fr",
gap:8,
marginBottom:12
}}
>

{["HORA","DIA","NOCHE"].map(m=>(

<button
key={m}
onClick={()=>setModalidad(m)}
style={{
  padding: "10px",
  fontWeight: 700,
  color:
    modalidad === m
      ? "#ffffff"
      : "#dbeafe",
  background:
    modalidad === m
      ? "rgba(0,230,118,0.18)"
      : "var(--bg-deep)",
  border:
    modalidad === m
      ? "1px solid #00e676"
      : "1px solid var(--border)"
}}
>

{m==="HORA" && "⏱ Hora"}
{m==="DIA" && "🌞 Día"}
{m==="NOCHE" && "🌙 Noche"}

</button>

))}

</div>

        {/* Cascos (solo para moto) */}
        {tipo === "MOTO" && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, letterSpacing: 0.5 }}>
              🪖 CASCOS
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => { setCascos(n); inputRef.current?.focus(); }}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    background: cascos === n ? "rgba(124,77,255,0.2)" : "var(--bg-deep)",
                    border: `1.5px solid ${cascos === n ? "rgba(124,77,255,0.5)" : "var(--border)"}`,
                    color: cascos === n ? "#b388ff" : "var(--text-secondary)",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          className="btn-primary"
          onClick={registrar}
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            fontSize: 14,
            justifyContent: "center",
            letterSpacing: 0.5,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Registrando..." : "⬇ Registrar Ingreso"}
            </button>
              </>
)}
      </div>
      
      

      {/* Tiquete modal */}
      {ticket && <Tiquete ticket={ticket} tipo="ingreso" onClose={() => setTicket(null)} />}
    </>
  );
}
