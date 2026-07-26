import db from "./base-datos.js";

/** Una fila. sqlite3 solo habla por callbacks; esto permite usar async/await. */
export function unaFila(sql, parametros = []) {
  return new Promise((resolver, rechazar) => {
    db.get(sql, parametros, (error, fila) => (error ? rechazar(error) : resolver(fila)));
  });
}

/** Todas las filas. */
export function todasLasFilas(sql, parametros = []) {
  return new Promise((resolver, rechazar) => {
    db.all(sql, parametros, (error, filas) => (error ? rechazar(error) : resolver(filas)));
  });
}
