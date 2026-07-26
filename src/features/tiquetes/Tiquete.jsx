function getConfig() {
  try {
    const s = localStorage.getItem("configParqueadero");
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

const DEFAULT_CONFIG = {
  nombre: "Parqueadero Y&G",
  nit: "700539446-2",
  telefono1: "3148124372",
  telefono2: "3015836567",
  direccion: "Calle 17 #23-51",
  mensaje: "¡Gracias por su visita!",
};

function Tiquete({ ticket, tipo = "ingreso", onClose }) {
  const cfg = getConfig() || DEFAULT_CONFIG;
  const handlePrint = () => {

  const cerrarDespuesImpresion = () => {
    onClose?.();
    window.removeEventListener(
      "afterprint",
      cerrarDespuesImpresion
    );
  };

  window.addEventListener(
    "afterprint",
    cerrarDespuesImpresion
  );

  window.print();

};

  // Generate stable barcode bars (deterministic from ficha+placa)
  const seed = String(ticket.ficha) + ticket.placa;
  const bars = Array.from({ length: 50 }, (_, i) => {
    const c = seed.charCodeAt(i % seed.length) + i;
    return { w: c % 3 === 0 ? 3 : c % 5 === 0 ? 2 : 1, show: c % 7 !== 0 };
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <div id="ticket-print" style={{
          background: "white",
          color: "#111",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          padding: "10px",
          borderRadius: 8,
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}>
          <div style={{ textAlign: "center", borderBottom: "1px dashed #999", paddingBottom: 10, marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>{cfg.nombre}</div>
            <div>NIT: {cfg.nit}</div>
            <div>Tel: {cfg.telefono1} / {cfg.telefono2}</div>
            <div>{cfg.direccion}</div>
          </div>

          <div style={{ textAlign: "center", margin: "10px 0", fontSize: 28, fontWeight: 900, letterSpacing: 4 }}>
            F-{String(ticket.ficha).padStart(4, "0")}
          </div>

          <div style={{ borderTop: "1px dashed #999", paddingTop: 10, lineHeight: 1.8 }}>
            <div><b>Placa:</b> {ticket.placa}</div>
            <div><b>Tipo:</b> {ticket.tipo}</div>
            {ticket.cascos > 0 && <div><b>Cascos:</b> {ticket.cascos}</div>}
            <div><b>Ingreso:</b> {ticket.fecha} {ticket.hora}</div>
            {tipo === "salida" && (
              <>
                <div><b>Salida:</b> {ticket.horaSalida}</div>
                <div><b>Tiempo:</b> {ticket.tiempo}</div>
              </>
            )}
            <div><b>Tarifa:</b> {ticket.tarifa}</div>
            <div><b>Modalidad:</b> {ticket.modalidad}</div>
            {tipo === "salida" && (
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 6 }}>
                TOTAL: {ticket.total}
              </div>
            )}
          </div>

          <div style={{ textAlign: "center", margin: "12px 0 8px", borderTop: "1px dashed #999", paddingTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 1, height: 35 }}>
              {bars.map((b, i) => (
                <div key={i} style={{ width: b.w, height: "100%", background: b.show ? "#111" : "transparent" }} />
              ))}
            </div>
            <div style={{ fontSize: 9, letterSpacing: 3, marginTop: 4 }}>
              {String(ticket.ficha).padStart(4, "0")}-{ticket.placa}
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: 11, marginTop: 6 }}>{cfg.mensaje}</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-primary" onClick={handlePrint} style={{ padding: "11px 24px", fontSize: 14 }}>
            🖨 Imprimir
          </button>
          <button className="btn-ghost" onClick={onClose} style={{ padding: "11px 20px" }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_CONFIG, getConfig };
export default Tiquete;
