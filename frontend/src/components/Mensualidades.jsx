import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3333";

const INITIAL = [
  { id: 1, cliente: "Juan Pérez", placa: "HSY30H", vence: "2026-06-05", estado: "Activa" },
  { id: 2, cliente: "María Gómez", placa: "KLS93F", vence: "2026-05-28", estado: "Por vencer" },
  { id: 3, cliente: "Carlos Ruiz", placa: "TKL45G", vence: "2026-05-20", estado: "Vencida" },
  { id: 4, cliente: "Laura Díaz", placa: "XYZ88K", vence: "2026-06-10", estado: "Activa" },
];

const estadoColor = { "Activa": "badge-green", "Por vencer": "badge-amber", "Vencida": "badge-red" };

const EMPTY_FORM = {

  id: null,

  cliente: "",

  placa: "",

  telefono: "",

  fechaInicio: "",

  fechaVencimiento: "",

  valor: ""

};

export default function Mensualidades() {
  const [clientes, setClientes] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [modal, setModal] = useState(null); // null | "new" | {id}
  const [form, setForm] = useState(EMPTY_FORM);

  const cargarMensualidades = async () => {

  try {

    const res = await axios.get(
      `${API}/api/mensualidades`
    );

    setClientes(res.data);

  } catch (error) {

    console.log(error);

  }

};

useEffect(() => {

  cargarMensualidades();

}, []);

  const filtrados = clientes.filter(c =>
    c.cliente.toLowerCase().includes(buscar.toLowerCase()) ||
    c.placa.toLowerCase().includes(buscar.toLowerCase())
  );

  const obtenerEstado = (fechaVencimiento) => {

  const hoy = new Date();

  const vence = new Date(fechaVencimiento);

  const dias = Math.ceil(
    (vence - hoy) /
    (1000 * 60 * 60 * 24)
  );

  if (dias <= 0) {
    return "Vencida";
  }

  if (dias <= 5) {
    return "Por vencer";
  }

  return "Activa";

};

const vencenPronto = clientes.filter(c => {

  const estado =
    obtenerEstado(
      c.fechaVencimiento
    );

  return (
    estado === "Por vencer" ||
    estado === "Vencida"
  );

});

  const abrir = (cliente = null) => {
    if (cliente) {
      setForm({

  id: cliente.id,

  cliente: cliente.cliente || "",

  placa: cliente.placa || "",

  telefono: cliente.telefono || "",

  fechaInicio: cliente.fechaInicio || "",

  fechaVencimiento:
    cliente.fechaVencimiento || "",

  valor: cliente.valor || ""

});
      setModal(cliente.id);
    } else {
      setForm(EMPTY_FORM);
      setModal("new");
    }
  };

  const guardar = async () => {

  try {

    const datos = {

      cliente: form.cliente,

      placa: form.placa,

      telefono: form.telefono,

      fechaInicio: form.fechaInicio,

      fechaVencimiento:
        form.fechaVencimiento,

      valor: Number(form.valor)

    };

    if (form.id) {

      await axios.put(

        `${API}/api/mensualidades/${form.id}`,

        datos

      );

    } else {

      await axios.post(

        `${API}/api/mensualidades`,

        datos

      );

    }

    await cargarMensualidades();

    setModal(null);

    setForm(EMPTY_FORM);

  } catch (error) {

    console.log(error);

  }

  };
  
  const renovar = async (cliente) => {

  try {

    const inicio =
      new Date();

    const vence =
      new Date();

    vence.setDate(
      vence.getDate() + 30
    );

    await axios.put(

      `${API}/api/mensualidades/${cliente.id}`,

      {

        cliente:
          cliente.cliente,

        placa:
          cliente.placa,

        telefono:
          cliente.telefono,

        fechaInicio:
          inicio
            .toISOString()
            .split("T")[0],

        fechaVencimiento:
          vence
            .toISOString()
            .split("T")[0],

        valor:
          cliente.valor

      }

    );

    await cargarMensualidades();

  }

  catch(error){

    console.log(error);

  }

};

  const eliminar = async (id) => {

  if (!confirm("¿Eliminar mensualidad?")) {
    return;
  }

  try {

    await axios.delete(
      `${API}/api/mensualidades/${id}`
    );

    await cargarMensualidades();

  } catch (error) {

    console.log(error);

  }

};

  const inputStyle = { marginBottom: 10 };


  const inputVisual = {

  marginBottom: 10,

  color: "#FFFFFF",

  fontWeight: 500,

  fontSize: 15

  };
  
  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, letterSpacing: 1 }}>
            MENSUALIDADES
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
            {clientes.length} clientes · {
clientes.filter(
  c =>
    obtenerEstado(
      c.fechaVencimiento
    ) === "Activa"
).length
} activas
          </p>
        </div>
        <button className="btn-primary" onClick={() => abrir(null)}>
          + Nueva Mensualidad
        </button>
      </div>

      {/* Notificaciones */}
      {vencenPronto.length > 0 && (
        <div className="card" style={{ marginBottom: 16, border: "1px solid rgba(255,167,38,0.3)", background: "rgba(255,167,38,0.05)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-amber)", marginBottom: 6 }}>⚠ NOTIFICACIONES</div>
          {vencenPronto.map(c => (
            <div key={c.id} style={{ fontSize: 12, color: "var(--text-secondary)", padding: "3px 0" }}>
              • La mensualidad de <b style={{ color: "var(--text-primary)" }}>{c.placa}</b> ({c.cliente}) {obtenerEstado(
  c.fechaVencimiento
) === "Vencida" ? "está vencida" : "vence pronto"}
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <input
  placeholder="🔍 Buscar cliente o placa..."
  value={buscar}
  onChange={e => setBuscar(e.target.value)}
  style={{
    ...inputVisual,
    marginBottom: 16,
    maxWidth: 320
  }}
/>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
              {[
  "Cliente",
  "Placa",
  "Valor",
  "Vencimiento",
  "Estado",
  "Acciones"
].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: 0.8, textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c, i) => (
              <tr key={c.id} style={{
                borderBottom: i < filtrados.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background var(--transition)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 16px", fontWeight: 500 }}>{c.cliente}</td>
                <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent-blue-bright)" }}>{c.placa}</td>
                <td
style={{
padding:"12px 16px",
fontWeight:600,
color:"#00ff88"
}}
>
$
{Number(c.valor || 0)
.toLocaleString("es-CO")}
</td>
                <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: 13 }}>{c.fechaVencimiento}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span
className={`badge ${
obtenerEstado(
c.fechaVencimiento
) === "Activa"

? "badge-green"

: obtenerEstado(
c.fechaVencimiento
) === "Por vencer"

? "badge-amber"

: "badge-red"
}`}
>
{
obtenerEstado(
c.fechaVencimiento
)
}
</span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div
style={{
display:"flex",
gap:6
}}
>

<button
className="btn-primary"
onClick={() => renovar(c)}
style={{
padding:"5px 10px",
fontSize:12
}}
>
💰
</button>

<button
className="btn-ghost"
onClick={() => abrir(c)}
style={{
padding:"5px 10px",
fontSize:12
}}
>
✏
</button>

<button
className="btn-danger"
onClick={() => eliminar(c.id)}
style={{
padding:"5px 10px",
fontSize:12
}}
>
🗑
</button>

</div>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal !== null && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box fade-up" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 20, letterSpacing: 0.5 }}>
              {modal === "new" ? "Nueva Mensualidad" : "Editar Mensualidad"}
            </h2>
            <input
              placeholder="Nombre cliente"
              style={inputVisual}
              value={form.cliente}
              
              onChange={e =>
              setForm({
              ...form,
              cliente:e.target.value
              })
              }
              />

<input
              placeholder="Placa"
              style={inputVisual}
value={form.placa}
onChange={e =>
setForm({
...form,
placa:e.target.value.toUpperCase()
})
}
/>

<input
              placeholder="Teléfono"
              style={inputVisual}
value={form.telefono}
onChange={e =>
setForm({
...form,
telefono:e.target.value
})
}
/>

<input
              type="date"
              value={form.fechaInicio}
              style={inputVisual}
onChange={e => {

  const inicio = e.target.value;

  const fecha = new Date(inicio);

  fecha.setDate(
    fecha.getDate() + 30
  );

  const vencimiento =
    fecha.toISOString()
      .split("T")[0];

  setForm({

    ...form,

    fechaInicio: inicio,

    fechaVencimiento:
      vencimiento

  });

}}
/>

<input
  type="date"
  value={form.fechaVencimiento}
  style={inputVisual}
  readOnly
/>

<input
type="number"
              placeholder="Valor mensualidad"
              style={inputVisual}
value={form.valor}
onChange={e =>
setForm({
...form,
valor:e.target.value
})
}
/>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn-primary" onClick={guardar}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
