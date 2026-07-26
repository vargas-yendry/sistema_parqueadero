const MENU = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "mensualidades", icon: "📅", label: "Mensualidades" },
  { id: "accesorios", icon: "🛒", label: "Accesorios" },
  { id: "reportes", icon: "📊", label: "Reportes" },
  { id: "configuracion", icon: "⚙", label: "Configuración" },
  { id: "nuevoDia", icon: "🔄", label: "Nuevo Día" },
];

import { useState, useEffect } from "react";

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

export default function BarraLateral({ vista, setVista }) {

  const [config, setConfig] = useState(getConfig());

  useEffect(() => {

    const actualizarConfig = () => {
      setConfig(getConfig());
    };

    window.addEventListener(
      "configActualizada",
      actualizarConfig
    );

    return () => {
      window.removeEventListener(
        "configActualizada",
        actualizarConfig
      );
    };

  }, []);
  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      background: "var(--bg-dark)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "0",
      position: "sticky",
      top: 0,
      height: "100vh",
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: "22px 20px 18px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: "var(--accent-blue)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>🅿</div>
          <div>

  <div
    style={{
      fontFamily: "var(--font-display)",
      fontSize: 16,
      fontWeight: 700,
      color: "var(--text-primary)",
      letterSpacing: 1,
    }}
  >
    {config.nombre}
  </div>

  <div
    style={{
      fontSize: 10,
      color: "var(--text-muted)",
      letterSpacing: 0.5
    }}
  >
    PARQUEADERO
  </div>

</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {MENU.map(item => {
          const active = vista === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setVista(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 14px",
                marginBottom: 4,
                background: active ? "rgba(29,111,232,0.15)" : "transparent",
                color: active ? "var(--accent-blue-bright)" : "var(--text-secondary)",
                border: active ? "1px solid rgba(29,111,232,0.3)" : "1px solid transparent",
                borderRadius: "var(--radius-sm)",
                fontWeight: active ? 600 : 400,
                fontSize: 13,
                cursor: "pointer",
                transition: "all var(--transition)",
                textAlign: "left",
                justifyContent: "flex-start",
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = "var(--bg-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div style={{
        padding: "14px 20px",
        borderTop: "1px solid var(--border)",
        fontSize: 11,
        color: "var(--text-muted)",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        <span style={{
          width: 7, height: 7,
          borderRadius: "50%",
          background: "var(--accent-green)",
          display: "inline-block",
          animation: "pulse-dot 2s infinite",
        }} />
        Sistema activo
      </div>
    </aside>
  );
}
