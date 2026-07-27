# No se da soporte a Windows 7

**Fecha:** 26 de julio de 2026
**Estado:** decidido
**Alcance soportado:** Windows 10 y 11 (x64) · Linux (x64)

## Qué se decidió

La app **no** correrá en Windows 7, 8 ni 8.1. Si en el local hay un equipo con Windows 7, la
salida es cambiarle el sistema (Windows 10 corre en el mismo hardware de esa época) o ponerle
Linux, que ya estaba en el objetivo.

## Por qué: tres bloqueos independientes

No es un problema que se resuelva bajando un número de versión. Son tres, y cada uno bastaría
por sí solo.

### 1. Chromium dejó Windows 7

Electron 23 subió a Chromium 110 y con eso soltó Windows 7/8/8.1. La última versión compatible
es **Electron 22**, cuyo último parche (22.3.27, octubre de 2023) trae Chromium 108 y Node
16.17.1. Está sin soporte desde entonces: no recibe parches de seguridad.

> Fuente: <https://www.electronjs.org/blog/windows-7-to-8-1-deprecation-notice>

### 2. Tailwind 4 no funciona en Chromium 108

La interfaz está hecha con Tailwind 4, que **exige Chrome 111** porque se apoya en `color-mix()`
y en el sistema de color nativo. En Chromium 108 la interfaz se vería rota. Soportar Windows 7
obligaría a rehacer el tema, los tokens y la configuración en Tailwind 3.

> Fuente: <https://tailwindcss.com/docs/compatibility>

### 3. La base de datos no arranca sobre Node 16

`sqlite3` 6.0.1 declara `engines.node >= 20.17.0`, y Electron 22 lleva Node **16.17.1**. Ni
reescribiendo el proceso principal a CommonJS —que también haría falta, porque los módulos ES
en el proceso principal solo existen desde Electron 28— se resuelve esto.

## Qué costaría hacerlo de todos modos

Rehacer el proyecto: proceso principal y servidor a CommonJS, Tailwind 4 → 3, `sqlite3` 6 → 5,
Express 5 → 4, y fijar el objetivo de compilación en `chrome108`. Todo eso para entregar un
navegador sin parchar desde hace casi tres años, y manteniendo dos versiones del mismo programa
—exactamente la complejidad que las reglas de la casa prohíben.

## Consecuencias

- Windows 10/11 y Linux ya funcionan con la Electron actual: **no hay trabajo pendiente** para
  el alcance soportado.
- **Solo x64 en Windows.** `sqlite3` 6.0.1 publica únicamente el binario `win32-x64`; no existe
  `win32-ia32` (verificado en sus releases de GitHub). Un build de 32 bits tendría que compilar
  desde fuente con Visual Studio en la máquina destino.
- Antes de prometerle algo a un cliente, confirmar **qué sistema tiene el equipo del local**.

## Fecha que hay encima

Electron **43 es la última serie con binarios de 32 bits para Windows** (`win32-ia32`). La 44
sale alrededor del **25 de agosto de 2026** y los elimina. Si alguna vez hiciera falta un
Windows de 32 bits, hay que decidirlo antes de esa fecha — aunque con el punto anterior
(`sqlite3` sin binario ia32) esa puerta ya está prácticamente cerrada.

> Fuente: <https://www.electronjs.org/blog/electron-43-0>
