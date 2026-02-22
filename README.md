# TC3005B.501-Frontend
Web Application of the travel management system portal developed during course TC3005B by group 501.

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
   ├─ middleware.ts             # Astro middleware
   ├─ README.md                 # Source README
   ├─ assets/                   # Static assets
   ├─ components/               # Reusable UI components (Astro, TSX)
   │  ├─ RequestsLists/         # Components for request lists
   │  └─ Table/                 # Table-related components
   ├─ config/                   # Configuration files (e.g., modal config)
   ├─ data/                     # Data files or constants
   ├─ layouts/                  # Astro page layouts
   ├─ pages/                    # Astro pages/routes
   ├─ styles/                   # CSS and styling files
   ├─ types/                    # TypeScript type definitions
   ├─ utils/                    # Utility functions
   └─ views/                    # View components or pages
```

## Getting Started

In order to run this Frontend, the following steps are required:

### Installing

The only option currently is to clone the repository locally from GitHub.

#### Using `git`

```sh
git clone https://github.com/dittravel/TC3005B.501-Frontend.git
```

#### Using `gh` (GitHub CLI)

```sh
gh repo clone dittravel/TC3005B.501-Frontend
```

### Dependencies

The dependencies for this project are managed using [the pnpm package manager](https://pnpm.io/), so it is recommended to use this. However, [npm](https://www.npmjs.com/) can also be used. The dependencies are automatically managed by `pnpm` in the `package.json` file, so they are installed automatically when issuing the install command.

#### Using `pnpm`

```sh
pnpm install
```

#### Using `npm`

```sh
npm install
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

The application will start in development mode. Open your browser to the displayed local URL (typically `http://localhost:3000`). You'll see the login page, where you can authenticate with your credentials.

### Configuring

The application is fully integrated with the backend API. To start using the application:

1. **Backend Setup**: Ensure the backend server is running (see [TC3005B.501-Backend](../TC3005B.501-Backend) for setup instructions).

2. **Environment Variables**: Create a `.env` file in the project root based on `.env.example`:
   ```
   PUBLIC_API_BASE_URL=http://localhost:3000
   ```

3. **Login**: Use the login interface to authenticate with your credentials. The available roles are:
   - **Solicitante** (Applicant) - Create and manage travel requests
   - **Agencia de viajes** (Travel Agency) - Attend to travel requests
   - **Cuentas por pagar** (Accounts Payable) - Validate and check receipts
   - **N1** - Authorize level 1 requests
   - **N2** - Authorize level 2 requests
   - **Administrador** (Administrator) - Manage users and system settings



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
