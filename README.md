# Sistema Parqueadero Y&G

App de escritorio para el parqueadero: ingreso y salida de vehículos por ficha, mensualidades,
inventario de accesorios y reportes. Corre en el equipo del local, sin depender de internet.

**React 19 + Vite 8** (interfaz) · **Express 5 + SQLite** (API local) · **Electron 43** (ventana).
Todo vive en un solo paquete: un `package.json`, un `node_modules`, un lockfile.

## Requisitos

- **Node 24.18.0** (LTS Krypton). La versión la fija `.mise.toml`: con
  [mise](https://mise.jdx.dev) instalado basta `mise install` en la carpeta del repo.
- **pnpm 11.17.0** — es el único gestor soportado, no uses npm ni yarn. La versión sale del
  campo `packageManager` del `package.json`, así que pnpm se pone solo en la correcta.

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

| Comando           | Qué hace                                         |
| ----------------- | ------------------------------------------------ |
| `make`            | Lista los comandos disponibles                   |
| `make install`    | Instala dependencias (`--frozen-lockfile`)       |
| `make dev`        | API + interfaz a la vez, con recarga en caliente |
| `make dev-api`    | Solo la API                                      |
| `make dev-ui`     | Solo la interfaz                                 |
| `make build`      | Compila la interfaz a `dist/`                    |
| `make app`        | Compila y abre la ventana de Electron            |
| `make dist-linux` | Genera el `.deb` y el AppImage                   |
| `make dist-win`   | Instalador de Windows (solo corre EN Windows)    |
| `make lint`       | ESLint con autofix                               |
| `make format`     | Prettier reescribiendo                           |
| `make test`       | Vitest                                           |
| `make coverage`   | Vitest con reporte de cobertura                  |
| `make check`      | Puerta de calidad: lint + formato + pruebas      |
| `make respaldo`   | Copia manual de la base de datos                 |
| `make clean`      | Borra `dist/`, `instalador/` y `coverage/`       |
| `make reset`      | `clean` + borra `node_modules`                   |

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

La base de datos es un archivo SQLite. **Dónde queda depende de cómo se esté ejecutando:**

| Situación               | Dónde queda `parqueadero.db`                     |
| ----------------------- | ------------------------------------------------ |
| Desarrollo (`make dev`) | `data/` del repo                                 |
| Instalada en Windows    | `%APPDATA%\parqueadero-yg\datos\`                |
| AppImage en Linux       | `~/.config/parqueadero-yg/datos/`                |
| **Modo portátil**       | La carpeta `datos/` que esté junto al ejecutable |

Nunca se escribe junto al programa instalado: en Windows, Archivos de programa es de solo
lectura para el usuario.

### Modo portátil (llevarse los datos en una USB)

Por defecto **los datos NO viajan con el ejecutable**: copiar el `.AppImage` o el `.exe`
portable a otra máquina no se lleva la base de datos.

Para que sí viajen, crea una carpeta llamada `datos` **al lado** del ejecutable:

```
mi-usb/
├── parqueadero-yg-3.0.0-x86_64.AppImage
└── datos/          ← con solo crearla, la app guarda aquí
```

Es opt-in a propósito: si guardara siempre al lado, la app puesta en Descargas o en una
carpeta de solo lectura no podría escribir.

Y por encima de todo manda la variable `PARQUEADERO_DATOS`, si se define.

Cada vez que arranca el servidor se crea un respaldo en `data/respaldos/` y se conservan los
**30 más recientes**. Para uno manual: `make respaldo`.

`data/` está fuera de git: son los datos reales del negocio.

## Instalador

Se empaqueta la interfaz compilada (`dist/`) y el servidor (`dist-servidor/servidor.cjs`).

**El servidor se empaqueta en un solo archivo CommonJS a propósito.** El servidor corre como
proceso hijo y carga un binario nativo, así que tiene que quedar fuera del `.asar`; pero desde
una ruta desempaquetada no se puede leer hacia dentro del `.asar`, y con `import` ni siquiera
funciona el truco que Electron hace para `require`. Un servidor en ESM y sin empaquetar
arranca la ventana con la API muerta. Al meterlo todo en un CommonJS no queda nada que
resolver en ejecución.

Por eso `node_modules` no entra al instalador: las dependencias ya están dentro del paquete.
La única excepción es `sqlite3` (es binario nativo) junto con lo que necesita en ejecución,
`bindings` y `file-uri-to-path`.

Si algún día el servidor necesita otro módulo nativo, hay que añadirlo a `files` y a
`asarUnpack` — y comprobarlo **extrayendo el instalador fuera del repo**, porque dentro del
repo Node encuentra el `node_modules` de al lado y el fallo no se ve.

### Linux

```bash
make dist-linux   # genera el .deb y el AppImage
```

| Paquete                                    | Tamaño | Cuándo usarlo                                                                                        |
| ------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------- |
| `parqueadero-yg-<versión>-amd64.deb`       | 89 MB  | **El principal.** Declara las dependencias del sistema, integra menú e icono, y trae perfil AppArmor |
| `parqueadero-yg-<versión>-x86_64.AppImage` | 112 MB | Portátil: un archivo, sin instalar ni permisos de administrador                                      |

El `.deb` conserva el sandbox de Chromium; el AppImage arranca con `--no-sandbox`, que
electron-builder cablea en su lanzador. Para un equipo fijo, mejor el `.deb`.

> En Arch, el `.deb` necesita `libxcrypt-compat` (la herramienta `fpm` que trae electron-builder
> es Ruby y busca `libcrypt.so.1`): `sudo pacman -S libxcrypt-compat`.

### Windows

**No se puede construir desde Linux.** `sqlite3` es un binario nativo y saldría el de Linux
dentro del `.exe`: el build termina bien y la app revienta en el equipo del cliente. El
procedimiento está en [`docs/instalador-windows.md`](docs/instalador-windows.md).

Windows 7 no está soportado, y la razón está escrita en
[`docs/decisiones/2026-07-26-sin-windows-7.md`](docs/decisiones/2026-07-26-sin-windows-7.md).

## Variables de entorno

| Variable             | Para qué                                      | Por defecto                 |
| -------------------- | --------------------------------------------- | --------------------------- |
| `PARQUEADERO_DATOS`  | Carpeta de la base de datos y los respaldos   | `data/`                     |
| `PARQUEADERO_PUERTO` | Puerto de la API                              | `3333`                      |
| `PARQUEADERO_UI_URL` | Carga la ventana desde Vite en vez de `dist/` | (vacío)                     |
| `VITE_API_URL`       | URL de la API para la interfaz                | `http://localhost:3333/api` |
