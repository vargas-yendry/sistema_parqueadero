import { useState, useEffect } from "react";
import BarraLateral from "@/navegacion/BarraLateral";
import Tablero from "@/features/tablero/Tablero";
import Mensualidades from "@/features/mensualidades/Mensualidades";
import Accesorios from "@/features/accesorios/Accesorios";
import Reportes from "@/features/reportes/Reportes";
import Configuracion from "@/features/configuracion/Configuracion";

function App() {
  const [vista, setVista] = useState("dashboard");
  const [configOpen, setConfigOpen] = useState(false);

const handleVista = async (v) => {

  if (v === "nuevoDia") {

    const confirmar = window.confirm(
      "¿Deseas iniciar un nuevo día y limpiar el Tablero?"
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
      <BarraLateral vista={vista} setVista={handleVista} />
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        {vista === "dashboard" && <Tablero />}
        {vista === "mensualidades" && <Mensualidades />}
        {vista === "accesorios" && <Accesorios />}
        {vista === "reportes" && <Reportes />}
      </main>
      {configOpen && <Configuracion onClose={() => setConfigOpen(false)} />}
    </div>
  );
}

export default App;
