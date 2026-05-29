# TC3005B.501-Frontend

Frontend app for Dittravel.

## Quick Start

### Prerequisites

- Node.js 22+
- `pnpm`
- Backend configured and running
- Docker Desktop for `devDocker`

### Environment Modes

| Mode | Use case | Backend target | Result |
| --- | --- | --- | --- |
| `devLocal` | Native frontend on your machine | `https://localhost:3000/api` | Patches `.env` only |
| `devDocker` | Frontend container on your machine | `https://backend:3000/api` inside the container | Rewrites `docker-compose.yml`, rebuilds, starts container |
| `serverDocker` | Frontend container on server | `https://<SERVER_DOCKER_BACKEND_IP>:3000/api` inside the container | Rewrites `docker-compose.yml`, rebuilds, starts container |

### Configure Once (recommended)

Set this once in frontend `.env`:

- `SERVER_DOCKER_BACKEND_IP`

Then use mode commands without passing IP via CLI.

## Installation

```sh
git clone https://github.com/dittravel/TC3005B.501-Frontend.git
cd TC3005B.501-Frontend
pnpm install
```

Create `.env` once:

```sh
# PowerShell
Copy-Item .env.example .env

# Bash
cp .env.example .env
```

## Daily Use

### devLocal

Use this when the frontend runs natively.

```sh
pnpm env:devLocal
pnpm dev
```

This expects the backend API to be available at `https://localhost:3000/api`.

### devDocker

Use this when frontend and backend are both containerized locally.

Backend first:

```sh
cd ../TC3005B.501-Backend
pnpm env:devDocker
```

Then frontend:

```sh
cd ../TC3005B.501-Frontend
pnpm env:devDocker
docker compose ps
```

### serverDocker

Use this on the frontend server instance.

```sh
pnpm env:serverDocker
docker compose ps
```

## Setup Flows

### Native local flow

```sh
pnpm env:devLocal
pnpm dev
```

### Local Docker flow

```sh
cd ../TC3005B.501-Backend
pnpm env:devDocker

cd ../TC3005B.501-Frontend
pnpm env:devDocker
```

Open:

- `https://localhost:4321`
- `https://localhost:4321/login`

### Stop containers

```sh
docker compose down
```

## Key Commands

```sh
pnpm env:devLocal
pnpm env:devDocker
pnpm env:serverDocker

pnpm dev
docker compose ps
docker compose logs -f frontend
docker compose down
```

## Notes

- `PUBLIC_API_BASE_URL` stays `https://localhost:3000/api` so the browser always uses the local HTTPS endpoint or SSH tunnel.
- `SERVER_API_BASE_URL` changes by mode because server-side requests run inside the process/container.
- `devDocker` and `serverDocker` rebuild with `--no-cache` because the API base URLs are baked into the frontend build.
- `serverDocker` reads backend target from `.env` key `SERVER_DOCKER_BACKEND_IP` (CLI `BACKEND_IP` is optional override only).

## Smoke Test

1. Open `https://localhost:4321/login`.
2. Log in with a valid seeded user.
3. Confirm redirect to `/dashboard`.
4. Confirm authenticated API requests work.

If the backend is intentionally unavailable during UI-only development, the mock session lives in `src/data/cookies.ts`.
| **INP**  | when you interact (click/type)                  |
