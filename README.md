# TC3005B.501-Frontend
Web Application of the travel management system portal developed during course TC3005B by group 501.

This repository contains the frontend application, shared UI components, Cypress end-to-end tests, Astro configuration, and the deployment switchers used to run the app in local and Docker-based modes.

The frontend is configuration-driven. In practice, that means most environment-specific behavior is controlled by `.env`, especially the backend API base URL and the helper values used by Docker and test runs.

## Project Structure

```
TC3005B.501-Frontend/
├─ .env.example                # Example environment variables file
├─ .gitignore                  # Git ignore rules
├─ astro.config.mjs            # Astro configuration file
├─ ASTRO.md                    # Astro-specific documentation
├─ CHANGELOG.md                # Changelog of project updates
├─ CONTRIBUTING.md             # Guidelines for contributing to the project
├─ cypress.config.ts           # Cypress configuration for end-to-end testing
├─ package.json                # Node.js dependencies and scripts
├─ pnpm-lock.yaml              # Lock file for pnpm package manager
├─ pnpm-workspace.yaml         # Pnpm workspace configuration
├─ README.md                   # Project README
├─ tsconfig.json               # TypeScript configuration
├─ .github/                    # GitHub-specific files
│  ├─ pull_request_template.md # Pull request template
│  ├─ codeql/                  # CodeQL security analysis
│  │  └─ codeql-config.yml     # CodeQL configuration
│  ├─ ISSUE_TEMPLATE/          # Issue templates
│  │  ├─ 4-task.yml            # Task issue template
│  │  ├─ 5-sub_task.yml        # Sub-task issue template
│  │  └─ config.yml            # Issue template configuration
│  ├─ PULL_REQUEST_TEMPLATE/   # Pull request templates
│  │  ├─ chore_pr.md           # Chore PR template
│  │  ├─ feature_pr.md         # Feature PR template
│  │  └─ release_pr.md         # Release PR template
│  └─ workflows/               # GitHub Actions workflows
│     └─ codeql-analysis.yml   # CodeQL analysis workflow
├─ .vscode/                    # VS Code configuration
│  ├─ extensions.json          # Recommended extensions
│  └─ launch.json              # Debug launch configuration
├─ cypress/                    # End-to-end testing with Cypress
│  ├─ e2e/                     # Test files for various features (login, requests, etc.)
│  ├─ fixtures/                # Test data files
│  └─ support/                 # Cypress support files and commands
├─ public/                     # Static assets served directly
│  ├─ default.xml              # Default XML file
│  └─ fonts/                   # Font files
└─ src/                        # Source code
	 ├─ middleware.ts            # Astro middleware
	 ├─ README.md                # Source README
	 ├─ assets/                  # Static assets
	 ├─ components/              # Reusable UI components (Astro, TSX)
	 │  ├─ Lists/                # Components for request lists
	 │  └─ Table/                # Table-related components
	 ├─ config/                  # Configuration files (e.g., modal config)
	 ├─ data/                    # Data files or constants
	 ├─ layouts/                 # Astro page layouts
	 ├─ pages/                   # Astro pages/routes
	 ├─ styles/                  # CSS and styling files
	 ├─ types/                   # TypeScript type definitions
	 ├─ utils/                   # Utility functions
	 └─ views/                   # View components or pages
```

## Getting Started

In order to run this Frontend, follow the steps below in this order:

1. Clone the repository.
2. Install dependencies.
3. Create and configure `.env`.
4. Start the app in the mode you need.
5. Verify the API connection and, if needed, use the Docker or cloud variants.

## Quick Orientation

The frontend does not host its own business API. It consumes the backend API through `PUBLIC_API_BASE_URL` and renders the travel management workflows on top of that data.

Important integration points:

- Authentication and session flow come from the backend.
- Request, receipt, travel, and backup admin views all depend on the backend API being reachable.
- Cypress test users are loaded from `.env` so that local and CI test runs can use deterministic accounts.

If you are running the app against the local Docker stack, the usual backend target is `https://localhost:3000/api`.
If you are running against a remote backend container, update the base URL accordingly.

## Installation and First Run

### 1. Clone the repository

#### Using `git`

```sh
git clone https://github.com/dittravel/TC3005B.501-Frontend.git
cd TC3005B.501-Frontend
```

#### Using `gh` (GitHub CLI)

```sh
gh repo clone dittravel/TC3005B.501-Frontend
cd TC3005B.501-Frontend
```

### 2. Install dependencies

Use pnpm when possible.

```sh
pnpm install
```

If you prefer npm:

```sh
npm install
```

### 3. Configure `.env`

Create the file from the example and verify the API base URL:

```sh
cp .env.example .env
```

Required values to verify:

```env
PUBLIC_API_BASE_URL=https://localhost:3000/api
PUBLIC_IS_DEV=true
SERVER_DOCKER_BACKEND_IP=172.16.60.186
```

The `CYPRESS_*` accounts in `.env` are for automated tests and local QA runs.

### 4. Start the app

Choose the path that matches your environment:

- Native local frontend: `pnpm up:devLocal`
- Local Docker frontend: `pnpm up:devDocker`
- Server/frontend container: `pnpm up:serverDocker`

The `up:*` commands auto-create `.env` if missing, switch the environment, rebuild when needed, and start the container flow for that mode.

If you only want to switch files without starting services, use the older `env:*` commands.

## Quick Guides (reference)

### Environment Modes (current)

| Mode | Use case | Backend target | Result |
| --- | --- | --- | --- |
| `devLocal` | Native frontend on your machine | `https://localhost:3000/api` | Patches `.env` only |
| `devDocker` | Frontend container on your machine | `https://backend:3000/api` inside the container | Rewrites `docker-compose.yml`, rebuilds, starts container |
| `serverDocker` | Frontend container on server | `https://<SERVER_DOCKER_BACKEND_IP>:3000/api` inside the container | Rewrites `docker-compose.yml`, rebuilds, starts container |

### Configure Once (recommended)

Set these once in frontend `.env`:

- `PUBLIC_API_BASE_URL` - backend API base path used by the app
- `PUBLIC_IS_DEV` - enables development-friendly UI behavior
- `SERVER_DOCKER_BACKEND_IP`
- `CYPRESS_*` test accounts - used by automated end-to-end tests

Then use mode commands without passing IP via CLI.

### Daily mode commands

```sh
pnpm up:devLocal
pnpm up:devDocker
pnpm up:serverDocker
```

`pnpm up:*` is the streamlined path: it auto-creates `.env` from `.env.example` if needed, switches the environment, rebuilds when needed, and starts the container flow for that mode. The older `pnpm env:*` commands are still available when you only want to switch files.

Cloud VM usage (no Node/pnpm required on cloud instances):

```sh
bash switch-env.sh serverDocker
docker compose ps
```

For full 3-VM cloud workflow (DB + backend + frontend), see [../TC3005B.501-Backend/CLOUD_DEPLOYMENT.md](../TC3005B.501-Backend/CLOUD_DEPLOYMENT.md).

### Dockerized Setup (Recommended)

For full integration testing, run frontend and backend with Docker.

#### 1. Start backend stack first

From [../TC3005B.501-Backend](../TC3005B.501-Backend):

```sh
cd ../TC3005B.501-Backend
pnpm env:devDocker
```

This is required because frontend Docker compose expects the backend Docker network and service.

#### 2. Start frontend stack

From the frontend root:

```sh
pnpm env:devDocker
```

`pnpm env:devDocker` rewrites `docker-compose.yml`, rebuilds, and starts containers automatically.

#### 3. Verify containers

Backend project:

```sh
cd ../TC3005B.501-Backend
docker compose ps
```

Frontend project:

```sh
cd ../TC3005B.501-Frontend
docker compose ps
```

Expected frontend URL:

- `https://localhost:4321`
- `https://localhost:4321/login`

#### 4. Smoke-check the dockerized version

1. Open `https://localhost:4321/login`
2. Login with a valid user (for example `admin.tec` / `123` or `andres.gomez` / `123`)
3. Confirm redirect to `/dashboard`
4. Confirm protected routes do not bounce back to login unexpectedly
5. Check logs if needed:

```sh
docker compose logs -f frontend
```

#### 5. Stop services

Frontend:

```sh
docker compose down
```

Backend:

```sh
cd ../TC3005B.501-Backend
docker compose down
```

### Running

To run the Frontend, utilize whichever package manager you used for dependencies to run the project.

#### Using `pnpm`

```sh
pnpm run dev
```

#### Using `npm`

```sh
npm run dev
```

The application will start in development mode. Open your browser to `https://localhost:4321` (default Astro dev URL in this project). You should see the login page.

### Configuring

The application is fully integrated with the backend API. To start using the application:

1. **Backend Setup**: Ensure the backend server is running (see [../TC3005B.501-Backend](../TC3005B.501-Backend) for setup instructions).
2. **Environment Variables**: Create a `.env` file in the project root based on `.env.example`:

```env
PUBLIC_API_BASE_URL=https://localhost:3000/api
PUBLIC_IS_DEV=true
SERVER_DOCKER_BACKEND_IP=172.16.60.186
```

3. **Login**: Use the login interface to authenticate with your credentials. The available roles are:

- **Requester (Solicitante)** - Manages own travel requests and receipts
- **Travel Agency (Agencia de viajes)** - Handles requests and reviews flight/hotel options
- **Accounts Payable (Cuentas por pagar)** - Reviews and approves/rejects receipts
- **Authorizer (Autorizador)** - Requester capabilities + request approval/rejection
- **Administrator (Administrador)** - Full system management

### API Integration Notes

The frontend commonly calls these backend endpoints:

- `GET /api/system/health` and `GET /api/system/version` for operational checks.
- `GET /api/exchange-rate` for Banxico exchange-rate lookups.
- `POST /api/files/parse-xml-preview` to preview CFDI XML files.
- `POST /api/cfdi/validate` to validate CFDI payloads.
- `GET` and `PUT /api/admin/backup-automation-config` for backup automation administration.

The frontend does not hardcode a separate API server. It always builds requests from `PUBLIC_API_BASE_URL`.

### Field Limits and Validation

Several forms enforce numeric ranges in the UI before the backend ever sees the request:

- Expense amounts and local currency equivalents are numeric fields and cannot be negative in the input UI.
- Backup retention days are limited to the range `1` to `3650`.
- Backup schedule UI limits minutes to `0`-`59`, hours to `0`-`23`, weekly day to `0`-`6`, and monthly day to `1`-`28`.
- Auth-rule and policy forms also constrain minimum values, durations, and amounts with explicit lower bounds.

For Banxico exchange rates, the local currency equivalent becomes editable when the receipt date is newer than the latest published exchange rate date. If the Banxico lookup fails completely, the field is also editable so the user can enter a manual value.

That means the UI intentionally blocks some invalid or risky states early, but the backend still validates the final payload.

### Default role permissions (base and dummy)

The default permission matrix is defined in backend seed logic (`prisma/seedShared.js`) and is the same for:

- base seed (`pnpm prisma:seed`)
- dummy seed (`pnpm prisma:seed:dummy`)

In dummy mode, these defaults are duplicated across dummy society groups and users.

| Role | Module summary | Default permission keys |
| --- | --- | --- |
| Requester (Solicitante) | Travel, Receipts | `travel:view`, `travel:create`, `travel:edit`, `receipts:create`, `receipts:edit` |
| Travel Agency (Agencia de viajes) | Travel | `travel:view`, `travel:edit`, `travel:view_flights`, `travel:view_hotels`, `travel:approve` |
| Accounts Payable (Cuentas por pagar) | Receipts | `receipts:view`, `receipts:approve` |
| Authorizer (Autorizador) | Travel, Receipts | `travel:view`, `travel:create`, `travel:edit`, `travel:approve`, `travel:reject`, `receipts:create`, `receipts:edit` |
| Administrator (Administrador) | All modules | all `permission_key` values available in `Permission` |

4. **Development/Testing**: For development purposes when the backend is unavailable, the application uses a mock session located in [/src/data/cookies.ts](/src/data/cookies.ts):

```typescript
const mockSession: Session = {
	username: "John Doe",
	id: "1",
	department_id: "1",
	role: "Solicitante" as UserRole,
	token: "token",
};
```

### Development Stack

- [![Astro][astro-badge]][astro-url] — The web framework for content-driven websites.
- [![TypeScript][typescript-badge]][typescript-url] — Strongly typed JavaScript for scalable applications.
- [![Tailwind CSS][tailwind-badge]][tailwind-url] — A utility-first CSS framework for building custom designs efficiently.
- [![React][react-badge]][react-url] — A JavaScript library for building user interfaces.

[astro-url]: https://astro.build/
[typescript-url]: https://www.typescriptlang.org/
[tailwind-url]: https://tailwindcss.com/
[react-url]: https://reactjs.org/
[astro-badge]: https://img.shields.io/badge/Astro-fff?style=for-the-badge&logo=astro&logoColor=bd303a&color=352563
[typescript-badge]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white&color=blue
[tailwind-badge]: https://img.shields.io/badge/Tailwind-ffffff?style=for-the-badge&logo=tailwindcss&logoColor=38bdf8
[react-badge]: https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black&color=blue

### Frontend Optimization Tests

Open console in your browser (right click -> inspect -> console) to visualize frontend performance.
We use Google's web vitals library to conduct these tests. Find below a guide of what each acronym means:

| Metric | When it fires |
| --- | --- |
| **TTFB** | immediately on page load |
| **FCP** | when first content paints |
| **LCP** | when largest element finishes loading |
| **CLS** | when layout shifts happen |
| **INP** | when you interact (click/type) |
