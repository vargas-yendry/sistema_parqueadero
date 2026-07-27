# Cómo generar el instalador de Windows

Windows soportado: **10 y 11, de 64 bits**. Windows 7 no — ver
[la decisión](decisiones/2026-07-26-sin-windows-7.md).

## La regla que no se puede saltar

**El instalador de Windows se construye EN Windows.** No desde Linux, aunque electron-builder
lo deje intentar.

El motivo es `sqlite3`: es un binario nativo, distinto en cada sistema operativo. Al empaquetar
se mete el que esté compilado en la máquina donde se corre el build. Desde Linux, el `.exe`
saldría con un binario de Linux dentro, y la app **reventaría al abrir la base de datos** en el
equipo del cliente.

Lo peligroso es que el build **termina sin errores**. El fallo aparece en el local, no aquí.

Desde Linux solo se construyen los paquetes de Linux (`make dist-linux`).

## Preparar la máquina Windows

Una sola vez:

1. **Node 24.18.0** — con [mise](https://mise.jdx.dev) (`mise install` lee `.mise.toml`) o con
   el instalador oficial de Node.
2. **pnpm** — sale solo del campo `packageManager` del `package.json`.
3. **Herramientas de compilación de C++**, para que `sqlite3` pueda compilarse si no encuentra
   binario listo: Visual Studio Build Tools con la carga «Desarrollo para escritorio con C++».

## Generar

```powershell
git clone <el repo>
cd sistema_parqueadero_v3

pnpm install --frozen-lockfile
pnpm run build          # interfaz + servidor empaquetado
pnpm exec electron-builder --win
```

Salen dos archivos en `instalador\`:

| Archivo                                 | Qué es                                                                           |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| `parqueadero-yg-<versión>-x64.exe`      | Instalador NSIS: crea accesos directos y aparece en «Agregar o quitar programas» |
| `parqueadero-yg-<versión>-portable.exe` | Un solo ejecutable, no se instala. Sirve para USB                                |

## Comprobar antes de entregar

No basta con que el build termine. En la máquina Windows, con la app instalada:

1. Abre la app: la ventana carga y el tablero muestra el estado del parqueadero.
   Si la ventana abre pero no hay datos, el servidor no arrancó.
2. Registra un ingreso y cóbrale la salida. Que el reporte de «Hoy» sume ese valor.
3. **Imprime un tiquete** con la impresora del local.
4. Cierra la app y vuelve a abrirla: los datos siguen ahí.
5. Abre la app dos veces: la segunda debe enfocar la primera, no abrir otra ventana.

## Dónde quedan los datos

`%APPDATA%\parqueadero-yg\datos\parqueadero.db`, más `respaldos\` al lado.

**No** quedan junto al programa: en Windows, Archivos de programa es de solo lectura para el
usuario. Para que los datos viajen con el ejecutable portable, crea una carpeta llamada `datos`
junto al `.exe` (ver el README).

## Firma

Los ejecutables salen **sin firmar**. Windows mostrará el aviso de SmartScreen la primera vez
(«Más información» → «Ejecutar de todas formas»). Para quitarlo hace falta un certificado de
firma de código, que se paga aparte.
