.PHONY: help web web-install web-dev web-build backend backend-install backend-dev backend-build dev install migrate-up migrate-down

help:
	@echo "My Journal - Development Commands"
	@echo ""
	@echo "=== Docker (Local Dev) ==="
	@echo "  make docker-up        Start PostgreSQL + Redis"
	@echo "  make docker-down      Stop all containers"
	@echo "  make docker-logs      View container logs"
	@echo "  make docker-reset     Reset all data (WARNING: destructive)"
	@echo ""
	@echo "=== Full Stack ==="
	@echo "  make install        Install all dependencies"
	@echo "  make dev            Start both web and backend"
	@echo ""
	@echo "=== Web (Next.js) ==="
	@echo "  make web-install    Install web dependencies"
	@echo "  make web-dev        Start web dev server"
	@echo "  make web-build      Build web for production"
	@echo ""
	@echo "=== Backend (Go) ==="
	@echo "  make backend-install Install Go dependencies"
	@echo "  make backend-dev     Start backend dev server"
	@echo "  make backend-build   Build backend binary"
	@echo "  make migrate-up      Run database migrations"
	@echo "  make migrate-down    Rollback last migration"

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-reset:
	docker-compose down -v
	docker-compose up -d

# Full stack
install: web-install backend-install

_dev_backend:
	cd backend && go run cmd/server/main.go

_dev_web:
	cd web && npm run dev

dev:
	@echo "Starting both servers..."
	@make -j2 _dev_backend _dev_web

# Web (Next.js)
web-install:
	cd web && npm install

web-dev:
	cd web && npm run dev

web-build:
	cd web && npm run build

web-lint:
	cd web && npm run lint

web-typecheck:
	cd web && npm run typecheck

# Backend (Go)
backend-install:
	cd backend && go mod download

backend-dev:
	cd backend && go run cmd/server/main.go

backend-build:
	cd backend && go build -o bin/server cmd/server/main.go

backend-test:
	cd backend && go test ./...

# Database migrations (using goose)
migrate-up:
	cd backend && goose -dir migrations postgres $(DATABASE_URL) up

migrate-down:
	cd backend && goose -dir migrations postgres $(DATABASE_URL) down

migrate-create:
	@read -p "Migration name: " name; \
	cd backend && goose -dir migrations create $$name sql