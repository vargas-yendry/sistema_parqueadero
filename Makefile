# Sistema Parqueadero Y&G — atajos de trabajo.
# Gestor de paquetes: pnpm (único soportado).

PNPM := pnpm
DATOS := data
FECHA := $(shell date +%Y-%m-%dT%H-%M-%S)

.DEFAULT_GOAL := ayuda
.PHONY: ayuda install dev dev-api dev-ui build app dist lint format test coverage check respaldo clean reset

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

dist: ## Genera el instalador de Windows en instalador/
	$(PNPM) run dist

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
