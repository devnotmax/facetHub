# FACET Recursos

Plataforma para estudiantes de la FACET (UNT, Tucumán) que reúne y organiza material de estudio por carrera, año, materia y tipo de recurso.

## Requisitos

- [Node.js](https://nodejs.org/) ≥ 22
- [pnpm](https://pnpm.io/) ≥ 9 (`npm install -g pnpm` o `corepack enable`)
- [Docker](https://docs.docker.com/engine/install/) o [Podman](https://podman.io/) con el plugin de Compose instalado en `~/.docker/cli-plugins/docker-compose`

## Instalación

```bash
git clone <repo>
cd facetHub
pnpm install
```

## Variables de entorno

Copiá `.env.example` a `.env` y completá los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Requerida |
|---|---|---|
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | **Sí** |
| `POSTGRES_USER` | Usuario de PostgreSQL (default: `facet_user`) | No |
| `POSTGRES_DB` | Nombre de la base de datos (default: `facet_db`) | No |
| `CORS_ORIGIN` | Origen(es) permitidos por la API (separados por coma) | Sí en prod |
| `WEB_PORT` | Puerto donde se expone la web (default: `8080`) | No |

> **Nunca commitees `.env`** — está en `.gitignore`.

## Desarrollo local

Levantá Postgres en `127.0.0.1:5432` usando el compose de desarrollo y arrancá el servidor de desarrollo:

```bash
# Terminal 1 — Postgres accesible en 127.0.0.1:5432
docker compose -f docker-compose.yml -f docker-compose.dev.yml up postgres -d

# Terminal 2 — API + Web en modo watch
pnpm dev
```

La web queda en `http://localhost:5173` y la API en `http://localhost:3001`.

### ¿Para qué sirve `docker-compose.dev.yml`?

`docker-compose.yml` define la red interna de contenedores y **no publica el puerto de Postgres** hacia el host (así no queda expuesto en producción). `docker-compose.dev.yml` sobrescribe esa configuración añadiendo `127.0.0.1:5432:5432`, de modo que `pnpm dev` pueda conectarse a Postgres sin estar dentro de la red Docker.

```bash
# Compose de desarrollo completo (web + api + postgres, postgres con puerto publicado)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## Producción (Docker Compose)

```bash
# Copiá y editá el .env si no lo hiciste
cp .env.example .env

# Construir imágenes y levantar
docker compose up --build -d

# Ver estado
docker compose ps

# Ver logs
docker compose logs -f

# Detener
docker compose down
```

La web queda en `http://127.0.0.1:${WEB_PORT:-8080}` (solo loopback; Caddy o Cloudflare Tunnel la exponen al exterior).

## Scripts disponibles

```bash
pnpm dev           # inicia todos los servicios en modo watch
pnpm build         # compila todos los paquetes
pnpm lint          # ESLint + Prettier
pnpm typecheck     # tsc --noEmit en todos los paquetes
pnpm test          # tests con Vitest
pnpm db:migrate    # aplica migraciones (Semana 2+)
pnpm db:seed       # carga datos de ejemplo (Semana 2+)
```

## Estructura

```
apps/
  api/      → Fastify (Node.js + TypeScript)
  web/      → React + Vite
packages/
  shared/   → tipos y esquemas Zod compartidos
docs/       → especificaciones por épica y semana
scripts/    → scripts de importación y backup
```

## Linting y tests antes de commitear

```bash
pnpm lint && pnpm typecheck && pnpm test
```
