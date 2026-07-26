# Sistema Parqueadero Y&G

App de escritorio para el parqueadero: ingreso y salida de vehículos por ficha, mensualidades,
inventario de accesorios y reportes. Corre en el equipo del local, sin depender de internet.

**React 19 + Vite 8** (interfaz) · **Express 5 + SQLite** (API local) · **Electron 43** (ventana).
Todo vive en un solo paquete: un `package.json`, un `node_modules`, un lockfile.

## Requisitos

- Node **>= 22** (la versión de trabajo está en `.nvmrc`)
- **pnpm** — es el único gestor soportado, no uses npm ni yarn

## Arranque

```bash
make install     # instala las dependencias exactas del lockfile
make dev         # API en :3333 e interfaz en :5173
```

Para verlo como app de escritorio:

```bash
make app         # compila la interfaz y abre la ventana de Electron
```

## Comandos

| Comando         | Qué hace                                         |
| --------------- | ------------------------------------------------ |
| `make`          | Lista los comandos disponibles                   |
| `make install`  | Instala dependencias (`--frozen-lockfile`)       |
| `make dev`      | API + interfaz a la vez, con recarga en caliente |
| `make dev-api`  | Solo la API                                      |
| `make dev-ui`   | Solo la interfaz                                 |
| `make build`    | Compila la interfaz a `dist/`                    |
| `make app`      | Compila y abre la ventana de Electron            |
| `make dist`     | Genera el instalador de Windows en `instalador/` |
| `make lint`     | ESLint con autofix                               |
| `make format`   | Prettier reescribiendo                           |
| `make test`     | Vitest                                           |
| `make coverage` | Vitest con reporte de cobertura                  |
| `make check`    | Puerta de calidad: lint + formato + pruebas      |
| `make respaldo` | Copia manual de la base de datos                 |
| `make clean`    | Borra `dist/`, `instalador/` y `coverage/`       |
| `make reset`    | `clean` + borra `node_modules`                   |

Antes de commitear: `make check` en verde. El orden importa — lint primero y formato después,
porque `eslint --fix` deja indentaciones que Prettier luego corrige.

## Estructura

Todo se organiza **por feature**: lo que cambia junto vive junto. Cada carpeta de `src/features/`
tiene su ruta de Express (`rutas.js`) y su pantalla de React lado a lado.

```
├── index.html            interfaz (entrada de Vite)
├── Makefile              atajos de trabajo
├── electron-builder.yml  configuración del instalador
├── data/                 base de datos y respaldos (fuera de git)
├── desktop/main.js       shell de Electron: abre la ventana y lanza la API
└── src/
    ├── main.jsx          arranque de React (fuentes, React Query, avisos)
    ├── App.jsx           navegación entre pantallas
    ├── api.js            cliente HTTP contra la API local
    ├── formato.js        pesos colombianos, fechas y horas
    ├── estilos.css       tokens de color/tipografía (Tailwind 4)
    ├── interfaz/         componentes base (shadcn) + cn()
    ├── navegacion/       barra lateral
    ├── servidor/         arranque de Express, SQLite y respaldos
    └── features/
        ├── ingresos/     rutas.js + IngresoRapido.jsx
        ├── salidas/      rutas.js + cobro.js + SalidaRapida.jsx
        ├── vehiculos/    rutas.js
        ├── tablero/      Tablero.jsx + GrillaParqueo.jsx
        ├── mensualidades/
        ├── accesorios/
        ├── reportes/
        ├── gastos/
        ├── jornada/      cierre de día
        ├── tiquetes/     Tiquete.jsx (lo que se imprime)
        └── configuracion/
```

Reglas de la casa: archivos por debajo de 500 líneas, todo en español, y nada de carpetas
llamadas `utils`, `helpers` o `shared` — se nombra por el concepto del negocio.

## API

La API solo escucha en `localhost:3333` y solo la consume esta app.

| Ruta                 | Para qué                              |
| -------------------- | ------------------------------------- |
| `/api/ingresos`      | Registrar entrada y asignar ficha     |
| `/api/vehiculos`     | Vehículos actualmente adentro         |
| `/api/salidas`       | Consultar cobro y registrar la salida |
| `/api/mensualidades` | Clientes con mensualidad              |
| `/api/accesorios`    | Inventario y ventas                   |
| `/api/reportes`      | Cifras por Hoy / Semana / Mes / Año   |
| `/api/gastos`        | Gastos del negocio                    |
| `/api/nuevo-dia`     | Cierra la jornada y limpia el tablero |
| `/api/salud`         | Comprobar que el servidor responde    |

### Cómo se cobra

La fórmula vive en un solo lugar, `src/features/salidas/cobro.js`, y la usan tanto la consulta
como el cobro final:

- **Por hora**: mínimo una hora, y una hora más por cada **65 minutos** empezados
  (o sea, 5 minutos de gracia por hora).
- **Por día y por noche**: tarifa plana, sin importar cuánto tiempo estuvo.

Las tarifas salen de la configuración del negocio; si no llegan, se usan las de defecto.
El servidor **siempre recalcula** el valor: no confía en el que le mande la interfaz.

## Datos y respaldos

La base de datos es un archivo SQLite:

- En desarrollo: `data/parqueadero.db`
- Instalada: en la carpeta de datos del usuario (Electron se la pasa al servidor por la
  variable `PARQUEADERO_DATOS`), porque escribir dentro de Archivos de programa falla en Windows.

Cada vez que arranca el servidor se crea un respaldo en `data/respaldos/` y se conservan los
**30 más recientes**. Para uno manual: `make respaldo`.

`data/` está fuera de git: son los datos reales del negocio.

## Instalador

```bash
make dist        # genera instalador/ con el .exe (NSIS)
```

Se empaqueta la interfaz compilada más el servidor. El servidor corre como proceso hijo y usa
un módulo nativo (`sqlite3`), así que va fuera del `.asar` — eso está resuelto en
`electron-builder.yml`; si añades archivos de servidor nuevos, revisa que los cubran sus globs.

## Variables de entorno

| Variable             | Para qué                                      | Por defecto                 |
| -------------------- | --------------------------------------------- | --------------------------- |
| `PARQUEADERO_DATOS`  | Carpeta de la base de datos y los respaldos   | `data/`                     |
| `PARQUEADERO_PUERTO` | Puerto de la API                              | `3333`                      |
| `PARQUEADERO_UI_URL` | Carga la ventana desde Vite en vez de `dist/` | (vacío)                     |
| `VITE_API_URL`       | URL de la API para la interfaz                | `http://localhost:3333/api` |
