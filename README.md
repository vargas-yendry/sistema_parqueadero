# Sistema Parqueadero Y&G — v2.0

## Requisitos
- Node.js 18+
- npm

## Inicio rápido

### Backend
```bash
cd backend
npm install
node server.js
```

### Frontend (dev)
```bash
cd frontend
npm install
npm run dev
```
App en http://localhost:5173

### Frontend (producción)
Los archivos compilados están en `frontend/dist/`

## Funcionalidades
- ✅ Dashboard con estado del parqueadero en tiempo real
- ✅ Ingreso rápido por placa (Enter para confirmar)
- ✅ Selección Moto / Carro
- ✅ Selección de cascos (0-4)
- ✅ Ticket de ingreso con código de barras
- ✅ Salida rápida por número de ficha (solo escribe 1, 8, 35...)
- ✅ Cálculo automático de tiempo y tarifa
- ✅ Ticket de salida con total
- ✅ Reutilización automática de fichas liberadas
- ✅ Mensualidades (CRUD completo)
- ✅ Accesorios / Inventario con ventas
- ✅ Reportes con filtros (Hoy/Semana/Mes/Año)
- ✅ Configuración como modal (nombre, NIT, tarifas, etc.)
