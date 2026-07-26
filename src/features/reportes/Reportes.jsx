import { useEffect, useState } from "react";

const FILTROS = ["Hoy", "Semana", "Mes", "Año"];


export default function Reportes() {
  const [filtro, setFiltro] = useState("Hoy");
  const [datos, setDatos] = useState({
  ingresosParking: 0,
  vehiculos: 0,
  ventasAccesorios: 0,
  gananciaAccesorios: 0,
  ingresoMensualidades: 0,
  clientesMensualidad: 0,
  tendencia: []
});
  const [nuevoGasto, setNuevoGasto] = useState(false);
  const [gastos, setGastos] = useState([]);
  const [gForm, setGForm] = useState({ concepto: "", valor: "", fecha: new Date().toISOString().split("T")[0] });

const totalGastos =
  gastos.reduce(
    (acc,g)=>
      acc + Number(g.valor),
    0
  );

const ganancia =
  datos.ingresosParking +
  datos.gananciaAccesorios +
  datos.ingresoMensualidades -
  totalGastos;

  useEffect(() => {

  cargarDatos();
  cargarGastos();

}, [filtro]);

async function cargarDatos() {

  

  try {

    const res =
      await fetch(
        `http://localhost:3333/api/reportes?filtro=${filtro}`
      );

    const data =
      await res.json();

    setDatos(data);

  } catch (error) {

    console.log(error);

  }

}
  
  async function cargarGastos(){

  try{

    const res =
      await fetch(
  `http://localhost:3333/api/gastos?filtro=${filtro}`
);

    const data =
      await res.json();

    setGastos(data);

  }catch(error){

    console.log(error);

  }

}

  const fmt = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  const agregarGasto = async () => {

  if(
    !gForm.concepto ||
    !gForm.valor
  ){
    return;
  }

  try{

    await fetch(
      "http://localhost:3333/api/gastos",
      {
        method:"POST",
        headers:{
          "Content-Type":
          "application/json"
        },
        body:JSON.stringify({
          concepto:gForm.concepto,
          valor:Number(gForm.valor),
          fecha:gForm.fecha
        })
      }
    );

    cargarGastos();

    setNuevoGasto(false);

    setGForm({
      concepto:"",
      valor:"",
      fecha:new Date()
      .toISOString()
      .split("T")[0]
    });

  }catch(error){

    console.log(error);

  }

};

  async function eliminarGasto(id){

  if(!window.confirm("¿Eliminar gasto?")){
    return;
  }

  try{

    await fetch(
      `http://localhost:3333/api/gastos/${id}`,
      {
        method:"DELETE"
      }
    );

    cargarGastos();

  }catch(error){

    console.log(error);

  }

}

  // Simple sparkline
const sparkPoints =
  (datos.tendencia || []).map(
    (item, i) => ({
      x: i,
      y: Number(item.total)
    })
  );
  const maxY =
  sparkPoints.length
    ? Math.max(
        ...sparkPoints.map(
          p => p.y
        )
      )
    : 1;
  const W = 200, H = 48;
  const pts = sparkPoints.map(p => `${(p.x / 6) * W},${H - (p.y / maxY) * H}`).join(" ");

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, letterSpacing: 1 }}>REPORTES</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>Resumen financiero del parqueadero</p>
        </div>
        {/* Filtros */}
        <div style={{ display: "flex", gap: 6 }}>
          {FILTROS.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                padding: "8px 16px",
                background: filtro === f ? "var(--accent-blue)" : "var(--bg-card)",
                border: `1px solid ${filtro === f ? "var(--accent-blue)" : "var(--border)"}`,
                color: filtro === f ? "white" : "var(--text-secondary)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        {[
  {
    label: "Ingresos Parking",
    value: fmt(datos.ingresosParking),
    color: "var(--accent-blue-bright)",
    icon: "💰"
  },

  {
    label: "Ventas Accesorios",
    value: fmt(datos.ventasAccesorios),
    color: "#b388ff",
    icon: "🛒"
  },

  {
    label: "Ganancia Accesorios",
    value: fmt(datos.gananciaAccesorios),
    color: "#00e676",
    icon: "📦"
  },

  {
    label: "Mensualidades",
    value: fmt(datos.ingresoMensualidades),
    color: "#40c4ff",
    icon: "📅"
  },

  {
    label: "Gastos",
    value: fmt(totalGastos),
    color: "var(--accent-red)",
    icon: "📉"
  },

  {
    label: "Ganancia Neta",
    value: fmt(ganancia),
    color: "var(--accent-green)",
    icon: "📈"
  },

  {
    label: "Vehículos",
    value: datos.vehiculos,
    color: "var(--accent-amber)",
    icon: "🚗"
  },

  {
    label: "Clientes Mensualidad",
    value: datos.clientesMensualidad,
    color: "#ffca28",
    icon: "👥"
  }
].map((s, i) => (
          <div key={i} className="card fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>
              {s.icon} {s.label}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two columns: sparkline + gastos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Sparkline */}
        <div className="card">
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, letterSpacing: 0.5, marginBottom: 12 }}>
            TENDENCIA — ÚLTIMOS 7 DÍAS
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 60 }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#grad)" />
            <polyline points={pts} fill="none" stroke="var(--accent-blue-bright)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {sparkPoints.map((p, i) => (
              <circle key={i} cx={(p.x / 6) * W} cy={H - (p.y / maxY) * H} r="3" fill="var(--accent-blue-bright)" />
            ))}
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <span key={i} style={{ fontSize: 10, color: "var(--text-muted)" }}>{d}</span>
            ))}
          </div>
        </div>

        {/* Gastos */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}>GASTOS</div>
            <button className="btn-primary" onClick={() => setNuevoGasto(true)} style={{ padding: "6px 12px", fontSize: 12 }}>
              + Nuevo
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Concepto", "Valor", "Fecha", "Acciones"].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", paddingBottom: 8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
  {gastos.slice(0, 5).map((g, i) => (
    <tr
      key={i}
      style={{
        borderTop:"1px solid var(--border)"
      }}
    >

      <td
        style={{
          padding:"8px 0",
          fontSize:13
        }}
      >
        {g.concepto}
      </td>

      <td
        style={{
          padding:"8px 0",
          color:"var(--accent-red)",
          fontSize:13,
          fontFamily:"var(--font-mono)"
        }}
      >
        -{fmt(g.valor)}
      </td>

      <td
        style={{
          padding:"8px 0",
          color:"var(--text-muted)",
          fontSize:11
        }}
      >
        {g.fecha}
      </td>

      <td
        style={{
          padding:"8px 0"
        }}
      >
        <button
          onClick={() => eliminarGasto(g.id)}
          style={{
            background:"#ff4444",
            color:"#fff",
            border:"none",
            borderRadius:"6px",
            padding:"4px 8px",
            cursor:"pointer"
          }}
        >
          🗑
        </button>
      </td>

    </tr>
  ))}
</tbody>
          </table>
        </div>
      </div>

      {/* Gasto modal */}
      {nuevoGasto && (
        <div className="modal-overlay" onClick={() => setNuevoGasto(false)}>
          <div className="modal-box fade-up" onClick={e => e.stopPropagation()} style={{ width: 380 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Nuevo Gasto</h2>
            <div style={{ marginBottom: 12 }}><input placeholder="Concepto" value={gForm.concepto} onChange={e => setGForm({ ...gForm, concepto: e.target.value })} autoFocus /></div>
            <div style={{ marginBottom: 12 }}><input type="number" placeholder="Valor" value={gForm.valor} onChange={e => setGForm({ ...gForm, valor: e.target.value })} /></div>
            <div style={{ marginBottom: 20 }}><input type="date" value={gForm.fecha} onChange={e => setGForm({ ...gForm, fecha: e.target.value })} /></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn-ghost" onClick={() => setNuevoGasto(false)}>Cancelar</button>
              <button className="btn-primary" onClick={agregarGasto}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
