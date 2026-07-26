import { useState, useEffect } from "react";



const EMPTY_FORM = {
  nombre: "",
  emoji: "📦",
  precio: "",
  costo: "",
  stock: "",
  minStock: "5"
};

export default function Accesorios() {
  const [productos, setProductos] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [venta, setVenta] = useState(null); // producto a vender
  const [cantVenta, setCantVenta] = useState(1);
  const [historialVentas, setHistorialVentas] = useState([]);
  const cargarProductos = async () => {

  try {

    const res = await fetch(
      "http://localhost:3333/api/accesorios"
    );

    const data = await res.json();

    setProductos(data);

  } catch (error) {

    console.error(error);

  }

};

useEffect(() => {

  cargarProductos();
  cargarHistorial();

}, []);

  const cargarHistorial = async () => {

  try {

    const res = await fetch(
      "http://localhost:3333/api/accesorios/ventas/historial"
    );

    const data = await res.json();

    setHistorialVentas(data);

  } catch(error){

    console.error(error);

  }

};

  const stockBajo = productos.filter(p => p.stock <= p.minStock);

  const mesActual =
  new Date().getMonth();

const anioActual =
  new Date().getFullYear();

const gananciaMes =
  historialVentas
    .filter(v => {

      const fecha =
        new Date(v.fecha);

      return (
        fecha.getMonth() === mesActual &&
        fecha.getFullYear() === anioActual
      );

    })
    .reduce(
      (acc,v)=>acc+(v.ganancia || 0),
      0
    );

  const abrir = (p = null) => {
    if (p) {
      setForm({
  nombre: p.nombre,
  emoji: p.emoji,
  precio: p.precio,
  costo: p.costo || 0,
  stock: p.stock,
  minStock: p.minStock
});
      setModal(p.id);
    } else {
      setForm(EMPTY_FORM);
      setModal("new");
    }
  };

  const guardar = async () => {

  if (
    !form.nombre ||
    !form.precio ||
    !form.stock
  ) return;

  try {

    if (modal === "new") {

      await fetch(
        "http://localhost:3333/api/accesorios",
        {
          method: "POST",
          headers: {
            "Content-Type":"application/json"
          },
          body: JSON.stringify({
  nombre: form.nombre,
  emoji: form.emoji,
  precio: Number(form.precio),
  costo: Number(form.costo),
  stock: Number(form.stock),
  minStock: Number(form.minStock)
})
        }
      );

    } else {

      await fetch(
        `http://localhost:3333/api/accesorios/${modal}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":"application/json"
          },
          body: JSON.stringify({
            nombre: form.nombre,
            emoji: form.emoji,
            precio: Number(form.precio),
            costo: Number(form.costo),
            stock: Number(form.stock),
            minStock: Number(form.minStock)
          })
        }
      );

    }

    await cargarProductos();

    setModal(null);

  } catch(error){

    console.error(error);

  }

};

 const eliminarProducto = async (id) => {

  const confirmar = window.confirm(
    "¿Eliminar este producto?"
  );

  if(!confirmar) return;

  try {

    await fetch(
      `http://localhost:3333/api/accesorios/${id}`,
      {
        method:"DELETE"
      }
    );

    await cargarProductos();

  } catch(error){

    console.error(error);

  }

};

const registrarVenta = async () => {

  if (!venta) return;

  try {

    await fetch(

      `http://localhost:3333/api/accesorios/venta/${venta.id}`,

      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cantidad: Number(cantVenta)
        })
      }

    );

    setVenta(null);

    await cargarProductos();
    await cargarHistorial();

  } catch(error){

    console.error(error);

    alert("Error registrando venta");

  }

};


  const fmt = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, letterSpacing: 1 }}>
            ACCESORIOS / INVENTARIO
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
            {productos.length} productos · {stockBajo.length} con stock bajo
          </p>
        </div>
        <button className="btn-primary" onClick={() => abrir(null)}>+ Nuevo Producto</button>
      </div>

      

      <div
  style={{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
    gap:"14px",
    marginBottom:"20px"
  }}
>

  <div className="card">
    <div style={{fontSize:12,color:"var(--text-muted)"}}>
      📦 PRODUCTOS
    </div>

    <div
      style={{
        fontSize:28,
        fontWeight:700,
        marginTop:8
      }}
    >
      {productos.length}
    </div>
  </div>

  <div className="card">

  <div
    style={{
      fontSize:12,
      color:"var(--text-muted)"
    }}
  >
    💰 GANANCIA DEL MES
  </div>

  <div
    style={{
      fontSize:28,
      fontWeight:700,
      color:"var(--accent-green)",
      marginTop:8
    }}
  >
    {fmt(gananciaMes)}
  </div>

</div>

  <div className="card">
    <div style={{fontSize:12,color:"var(--text-muted)"}}>
      🛒 VENTAS
    </div>

    <div
      style={{
        fontSize:28,
        fontWeight:700,
        color:"#bb86fc",
        marginTop:8
      }}
    >
      {
        productos.reduce(
          (acc,p)=>acc+(p.ventas || 0),
          0
        )
      }
    </div>
  </div>

  <div className="card">
    <div style={{fontSize:12,color:"var(--text-muted)"}}>
      ⚠ STOCK BAJO
    </div>

    <div
      style={{
        fontSize:28,
        fontWeight:700,
        color:"var(--accent-red)",
        marginTop:8
      }}
    >
      {stockBajo.length}
    </div>
  </div>

</div>

      {/* Alertas stock bajo */}
      {stockBajo.length > 0 && (
        <div className="card" style={{ marginBottom: 16, border: "1px solid rgba(239,83,80,0.3)", background: "rgba(239,83,80,0.05)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-red)", marginBottom: 6 }}>⚠ PRODUCTOS POR AGOTARSE</div>
          {stockBajo.map(p => (
            <div key={p.id} style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              • {p.emoji} {p.nombre}: <b style={{ color: "var(--accent-red)" }}>{p.stock}</b> disponibles
            </div>
          ))}
        </div>
      )}

      {/* CONTENEDOR GENERAL */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    gap: "20px",
    alignItems: "start"
  }}
>

  {/* COLUMNA IZQUIERDA */}
  <div>

    {/* Products grid */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 14
      }}
    >
        {productos.map(p => (
          <div key={p.id} className="card" style={{ border: p.stock <= p.minStock ? "1px solid rgba(239,83,80,0.3)" : "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{p.emoji}</span>
              <div style={{ display: "flex", gap: 6 }}>

                

  <button
    className="btn-ghost"
    onClick={() => abrir(p)}
    style={{
      padding:"4px 8px",
      fontSize:12
    }}
  >
    ✏
  </button>

  <button
    className="btn-ghost"
    onClick={() => eliminarProducto(p.id)}
    style={{
      padding:"4px 8px",
      fontSize:12,
      color:"#ff5c5c"
    }}
  >
    🗑
  </button>

</div>

      
              
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{p.nombre}</div>
            <div style={{ color: "var(--accent-green)", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {fmt(p.precio)}
            </div>
            
            <div
  style={{
    fontSize:12,
    color:"#9ca3af",
    marginBottom:4
  }}
>
Costo: {fmt(p.costo || 0)}
</div>

<div
  style={{
    fontSize:12,
    color:"#22c55e",
    marginBottom:10,
    fontWeight:600
  }}
>
Ganancia: {fmt((p.precio || 0) - (p.costo || 0))}
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Stock: <span style={{ color: p.stock <= p.minStock ? "var(--accent-red)" : "var(--text-primary)", fontWeight: 600 }}>{p.stock}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Vendidas: {p.ventas}</div>
            </div>
            <button
              className="btn-success"
              onClick={() => { setVenta(p); setCantVenta(1); }}
              style={{ width: "100%", justifyContent: "center", padding: "9px", fontSize: 13 }}
              disabled={p.stock === 0}
            >
              + Registrar Venta
            </button>
          </div>
        ))}
</div>

</div>

        {/* COLUMNA DERECHA */}

<div className="card">

  <h2
    style={{
      fontFamily:"var(--font-display)",
      marginBottom:"16px"
    }}
  >
    
  </h2>

  <div
    style={{
      maxHeight:"500px",
      overflowY:"auto"
    }}
  ></div>

      

  <h2
    style={{
      fontFamily:"var(--font-display)",
      marginBottom:"16px"
    }}
  >
    🧾 Historial de Ventas
  </h2>

  <div
    style={{
      maxHeight:"350px",
      overflowY:"auto"
    }}
  >

    <table
      style={{
        width:"100%",
        borderCollapse:"collapse"
      }}
    >

      <thead>

        <tr>

          <th style={{textAlign:"left",padding:"10px"}}>
            Fecha
          </th>

          <th style={{textAlign:"left",padding:"10px"}}>
            Producto
          </th>

          <th style={{textAlign:"left",padding:"10px"}}>
            Cantidad
          </th>

          <th style={{textAlign:"left",padding:"10px"}}>
            Precio
          </th>

          <th style={{textAlign:"left",padding:"10px"}}>
            Total
          </th>

        </tr>

      </thead>

      <tbody>

        {historialVentas.map(v => (

          <tr key={v.id}>

            <td style={{padding:"10px"}}>
              {
                new Date(v.fecha)
                .toLocaleDateString()
              }
            </td>

            <td style={{padding:"10px"}}>
              {v.producto}
            </td>

            <td style={{padding:"10px"}}>
              {v.cantidad}
            </td>

            <td style={{padding:"10px"}}>
              {fmt(v.precio)}
            </td>

            <td
              style={{
                padding:"10px",
                color:"var(--accent-green)",
                fontWeight:600
              }}
            >
              {fmt(v.total)}
            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

        </div>
        
        </div>

      

      {/* Producto modal */}
      {modal !== null && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box fade-up" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              {modal === "new" ? "Nuevo Producto" : "Editar Producto"}
            </h2>
            {[
                ["Nombre", "nombre", "text", "Nombre del producto"],
                ["Emoji", "emoji", "text", "📦"],
                ["Precio de venta", "precio", "number", "0"],
                ["Costo de compra", "costo", "number", "0"],
                ["Cantidad disponible", "stock", "number", "0"],
                ["Avisar cuando queden", "minStock", "number", "5"],
              ].map(([label, key, type, ph]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
                <input type={type} placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
              
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
              <button className="btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn-primary" onClick={guardar}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Venta modal */}
      {venta && (
        <div className="modal-overlay" onClick={() => setVenta(null)}>
          <div className="modal-box fade-up" onClick={e => e.stopPropagation()} style={{ width: 360 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              Registrar Venta
            </h2>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
              {venta.emoji} {venta.nombre} — Disponibles: {venta.stock}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, letterSpacing: 0.5 }}>CANTIDAD</div>
              <input
                type="number"
                value={cantVenta}
                onChange={e => setCantVenta(e.target.value)}
                min={1}
                max={venta.stock}
                autoFocus
                onKeyDown={e => e.key === "Enter" && registrarVenta()}
                style={{ fontSize: 20, textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 700 }}
              />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--accent-green)", marginBottom: 20 }}>
              Total: {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(venta.precio * (cantVenta || 0))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost" onClick={() => setVenta(null)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</button>
              <button className="btn-success" onClick={registrarVenta} style={{ flex: 1, justifyContent: "center" }}>✔ Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
