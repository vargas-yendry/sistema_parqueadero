import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Mensualidades from "./components/Mensualidades";
import Accesorios from "./components/Accesorios";
import Reportes from "./components/Reportes";
import Configuracion from "./components/Configuracion";

function App() {
  const [vista, setVista] = useState("dashboard");
  const [configOpen, setConfigOpen] = useState(false);

const handleVista = async (v) => {

  if (v === "nuevoDia") {

    const confirmar = window.confirm(
      "¿Deseas iniciar un nuevo día y limpiar el Dashboard?"
    );

    if (!confirmar) return;

    try {

      await fetch(
        "http://localhost:3333/api/nuevo-dia",
        {
          method: "POST"
        }
      );

      alert("Nuevo día iniciado correctamente");

      setVista("dashboard");

    } catch (error) {

      alert("Error iniciando nuevo día");

    }

    return;
  }

  if (v === "configuracion") {

    setConfigOpen(true);

  } else {

    setVista(v);

  }

};

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-deep)" }}>
      <Sidebar vista={vista} setVista={handleVista} />
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        {vista === "dashboard" && <Dashboard />}
        {vista === "mensualidades" && <Mensualidades />}
        {vista === "accesorios" && <Accesorios />}
        {vista === "reportes" && <Reportes />}
      </main>
      {configOpen && <Configuracion onClose={() => setConfigOpen(false)} />}
    </div>
  );
}

export default App;
