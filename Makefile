# Sistema Parqueadero Y&G — atajos de trabajo.
# Gestor de paquetes: pnpm (único soportado).

PNPM := pnpm
DATOS := data
FECHA := $(shell date +%Y-%m-%dT%H-%M-%S)

.DEFAULT_GOAL := ayuda
.PHONY: ayuda install dev dev-api dev-ui build app dist-linux dist-win lint format test coverage check respaldo clean reset

ayuda: ## Muestra esta ayuda
	@echo "Parqueadero Y&G — comandos disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
	@echo ""

install: ## Instala dependencias exactas del lockfile
	$(PNPM) install --frozen-lockfile

dev: ## Levanta API (3333) e interfaz (5173) a la vez
	$(PNPM) run dev

dev-api: ## Solo la API Express con recarga en caliente
	$(PNPM) run dev:api

dev-ui: ## Solo la interfaz Vite
	$(PNPM) run dev:ui

build: ## Compila la interfaz a dist/
	$(PNPM) run build

app: build ## Compila y abre la app de escritorio (Electron)
	$(PNPM) run electron

dist-linux: build ## Genera el .deb y el AppImage de Linux
	$(PNPM) exec electron-builder --linux

# El instalador de Windows NO se puede construir desde Linux: sqlite3 es un
# binario nativo y saldría el de Linux dentro del .exe. El build terminaría bien
# y la app reventaría en el equipo del cliente.
dist-win: ## Instalador de Windows (hay que correrlo EN Windows)
	@if [ "$$OS" != "Windows_NT" ]; then \
		echo "Este build tiene que hacerse en Windows — ver docs/instalador-windows.md"; \
		exit 1; \
	fi
	$(PNPM) run build
	$(PNPM) exec electron-builder --win

lint: ## ESLint con autofix
	$(PNPM) run lint

format: ## Prettier reescribiendo los archivos
	$(PNPM) run format

test: ## Corre las pruebas (Vitest)
	$(PNPM) run test

coverage: ## Pruebas con reporte de cobertura
	$(PNPM) run test:coverage

# El orden importa: lint primero, formato después (eslint --fix rompe la indentación).
check: ## Puerta de calidad: lint + formato + pruebas
	$(PNPM) run lint:check
	$(PNPM) run format:check
	$(PNPM) run test

respaldo: ## Copia manual de la base de datos a data/respaldos/
	@mkdir -p $(DATOS)/respaldos
	@cp $(DATOS)/parqueadero.db $(DATOS)/respaldos/parqueadero_$(FECHA).db
	@echo "Respaldo creado: $(DATOS)/respaldos/parqueadero_$(FECHA).db"

clean: ## Borra build, instalador y cobertura
	rm -rf dist instalador coverage

reset: clean ## clean + borra node_modules
	rm -rf node_modules
