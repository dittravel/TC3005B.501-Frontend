<div align="center">

[![Contributors][contributors-shield]][contributors-url]
[![Issues][issues-shield]][issues-url]

</div>

# ARCHIVED-REPOSITORY: TC3005B.501-Frontend
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
git clone https://github.com/101-Coconsulting/TC3005B.501-Frontend
```

#### Using `gh` (GitHub CLI)

```sh
gh repo clone 101-Coconsulting/TC3005B.501-Frontend
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

And you're good to go! A new browser window should open and you should be able to see the Authorizer's dashboard.

### Configuring

The current version lacks any sort of connection to any sort of backend, as well as any sort of login interface. Therefore, the way to access different dashboards for different roles, is to manually edit the [/src/data/cookies.ts](/src/data/cookies.ts) file to choose the role whose dashboard you want to visualize.

Filename: /src/data/cookies.ts
```typescript
import type { UserRole } from "@type/roles";

const mockCookies = {
    username: "John Doe",
    // CHANGE THIS
    role: "Authorizer" as UserRole //'Applicant' | 'Authorizer' | 'Admin' | 'AccountsPayable' | 'TravelAgency';
};

export const getCookie = (key: keyof typeof mockCookies): string | UserRole => {
    return mockCookies[key];
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
[contributors-shield]: https://img.shields.io/github/contributors/101-Coconsulting/TC3005B.501-Frontend.svg?style=for-the-badge
[contributors-url]: https://github.com/101-Coconsulting/TC3005B.501-Frontend/graphs/contributors
[issues-shield]: https://img.shields.io/github/issues/101-Coconsulting/TC3005B.501-Frontend.svg?style=for-the-badge
[issues-url]: https://github.com/101-Coconsulting/TC3005B.501-Frontend/issues
