import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import IngresoRapido from "../components/IngresoRapido";
import SalidaRapida from "../components/SalidaRapida";
import ParkingGrid from "../components/ParkingGrid";

const API = "http://localhost:3333";

function getConfig() {
  try {
    const s = localStorage.getItem("configParqueadero");

    return s
      ? JSON.parse(s)
      : { nombre: "Parqueadero Y&G" };

  } catch {
    return { nombre: "Parqueadero Y&G" };
  }
}

export default function Dashboard() {
  const [config, setConfig] = useState(getConfig());
  const [vehiculos, setVehiculos] = useState([]);
  const [stats, setStats] = useState({ vehiculosHoy: 0, ingresosHoy: 0, salidasHoy: 0, gananciaNeta: 0 });
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
  try {

    const vehiculosRes = await axios.get(
      `${API}/api/vehiculos`
    );

    setVehiculos(vehiculosRes.data);

    const statsRes = await axios.get(
      `${API}/api/salidas/estadisticas`
    );

    setStats(statsRes.data);

  } catch (error) {

    console.log(error);

  } finally {

    setLoading(false);

  }
}, []);

  useEffect(() => {

  cargar();

  const interval = setInterval(
    cargar,
    10000
  );

  const actualizarConfig = () => {
    setConfig(getConfig());
  };

  window.addEventListener(
    "configActualizada",
    actualizarConfig
  );

  return () => {

    clearInterval(interval);

    window.removeEventListener(
      "configActualizada",
      actualizarConfig
    );

  };

}, [cargar]);

  

  const fmt = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  const STATS = [
    { label: "Vehículos Hoy", value: stats.vehiculosHoy, icon: "🚗", color: "var(--accent-blue-bright)" },
    { label: "Ingresos Hoy", value: fmt(stats.ingresosHoy), icon: "💰", color: "var(--accent-green)" },
    { label: "Salidas Hoy", value: stats.salidasHoy, icon: "↗", color: "var(--accent-amber)" },
    { label: "Ganancia Neta", value: fmt(stats.gananciaNeta), icon: "📈", color: "#b388ff" },
  ];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header ocultado para ganar espacio */}
    <div style={{ height: 0 }} />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {STATS.map((s, i) => (
          <div key={i} className="card fade-up" style={{
            animationDelay: `${i * 0.06}s`,
            border: `1px solid var(--border)`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: s.color }}>
                  {s.value}
                </div>
              </div>
              <div style={{ fontSize: 22, opacity: 0.7 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid: parking + forms */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        {/* Left: parking grid */}
        <ParkingGrid vehiculos={vehiculos} loading={loading} onRefresh={cargar} />

        {/* Right: ingreso + salida */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <IngresoRapido onSuccess={cargar} />
          <SalidaRapida onSuccess={cargar} />
        </div>
      </div>
    </div>
  );
}
