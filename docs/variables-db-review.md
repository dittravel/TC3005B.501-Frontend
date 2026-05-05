# Revisión de Configuración de Variables de Entorno y Conexión a la Base de Datos
**Task:** Revisión de configuración de variables de entorno y conexión a la base de datos
**Autor:** Luis Emilio Velediaz Flores - A01029829
**Fecha:** 30/04/2026

---

## 1. Manejo de variables de entorno en el Frontend

Hay que revisar tres cosas para poder entender cómo el Frontend maneja su configuración: 
- Qué archivos de entorno existen
- Qué variables declaran
- Dónde las lee el código

### 1.1 Archivos presentes

Lo primero que hice fue listar los archivos de configuración de la raíz del Frontend, que son los siguientes:

| Archivo | Para qué sirve |
|---------|----------------|
| `.env` | Configuración local de cada desarrollador.|
| `.env.example` | Plantilla con la lista de variables que se necesitan. |
| `astro.config.mjs` | Configuración del framework Astro. Aquí también se declara un schema de variables. |
| `package.json` | Dependencias y scripts del proyecto. |
| `tsconfig.json` | Configuración de TypeScript. |

### 1.2 Variables que declara `.env.example`

El archivo `.env.example` declara estas variables:

| Variable | Tipo | Para qué se usa |
|----------|------|-----------------|
| `PUBLIC_API_BASE_URL` | string | URL del Backend al que el Frontend hace `fetch`. |
| `PUBLIC_IS_DEV` | boolean | Para indicar si la app está en modo desarrollo. |
| `CYPRESS_*_USER` y `CYPRESS_*_PASSWORD` | string | Credenciales para los tests. Hay un set por cada uno de los seis roles del sistema (solicitante, agente de viajes, cuentas por pagar, N1, N2, admin). |

Las variables que empiezan con `PUBLIC_` son las que Astro permite que lleguen al navegador. Las `CYPRESS_*` solo se usan durante los tests y nunca llegan al cliente.

Referencia: [Astro Docs: Environment Variables](https://docs.astro.build/en/guides/environment-variables/)

### 1.3 Schema en `astro.config.mjs`

Astro permite declarar las variables en un `env.schema`. Si una variable falta o tiene tipo equivocado, Astro avisa cuando se hace el build.

Al revisar `astro.config.mjs` encontré este bloque:

```js
env: {
  schema: {
    PUBLIC_API_BASE_URL: envField.string({
      context: 'server',
      access: 'public',
    }),
    PUBLIC_IS_DEV: envField.boolean({
      default: false,
      context: 'server',
      access: 'public',
    })
  }
}
```

- `context: 'server'` significa que la variable se evalúa en el servidor SSR.
- `access: 'public'` permite que llegue al navegador.

### 1.4 Dónde el código lee las variables

Para encontrar todos los lugares donde el código consume variables de entorno, ejecuté:

```bash
grep -rn "import.meta.env" src/ --include="*.ts" --include="*.tsx" --include="*.astro" --include="*.js"
```

Encontré **20 usos** distribuidos en 13 archivos:

| Archivo | Cantidad |
|---------|----------|
| `src/utils/apiClient.ts` | 3 |
| `src/components/Forms/ExpensesForm.tsx` | 4 |
| `src/components/Forms/UploadFiles.tsx` | 2 |
| `src/components/Forms/SubmitTravelExpense.tsx` | 2 |
| `src/components/Cards/RequestDetail.astro` | 2 |
| `src/components/Forms/UploadReceiptFiles.tsx` | 1 |
| `src/components/Forms/ConfirmationDocumentForm.tsx` | 1 |
| `src/components/Buttons/ImportDataButton.tsx` | 1 |
| `src/components/Lists/ReviewReceiptsList.tsx` | 1 |
| `src/components/Lists/ApplicantReceiptsList.tsx` | 1 |
| `src/components/Modals/DeleteAuthRuleModal.tsx` | 1 |
| `src/components/Modals/DeleteReceiptModal.tsx` | 1 |
| `src/components/Modals/CancelRoleModel.tsx` | 1 |

## 2. ¿Cómo se conecta el Frontend al Backend?

El Frontend nunca habla directamente con la base de datos. Todo pasa por el Backend por HTTP, usando la URL definida en `PUBLIC_API_BASE_URL`. Básicamente el flujo es:

```
.env  ->  import.meta.env  ->  apiClient.ts (BASE_URL)  ->  fetch()  ->  Backend
```

### 2.1 La constante `BASE_URL` en `apiClient.ts`

`src/utils/apiClient.ts` es el archivo encargado de mover las llamadas HTTP al Backend. Define la constante `BASE_URL` así (en la línea 48):

```ts
const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'https://localhost:3000/api';
```

Lo importante de esta línea es que si la variable no está definida, cae en `'https://localhost:3000/api'`.

### 2.2 SSL local

`astro.config.mjs` incluye el plugin `@vitejs/plugin-basic-ssl`, lo que hace que el Frontend funcione sobre **HTTPS en localhost** con un certificado auto-firmado. El Backend también espera HTTPS en `https://localhost:3000`, así que ambos lados están alineados.

Esto explica por qué la primera vez que se levanta el proyecto el navegador muestra una advertencia de certificado no confiable, y hay que aceptarla para ver el sistema funcional.

Referencia: [Vite Docs: basic-ssl plugin](https://github.com/vitejs/vite-plugin-basic-ssl)

### 2.3 ¿Hay localhosts hardcodeados?

Puede haber casos en los que en algún archivo esté la URL del Backend escrita a mano en lugar de leerla de la variable de entorno. Para verificarlo, ejecuté:

```bash
grep -rn "localhost:3000\|http://" src/ --include="*.ts" --include="*.tsx" --include="*.astro" --include="*.js" | grep -v "import.meta.env"
```

Este comando busca cualquier mención de `localhost:3000` o `http://` que **no** venga de `import.meta.env`.

Los únicos resultados que aparecieron fueron 4 identificadores de XML para unos íconos. **No hay URLs del Backend hardcodeadas en el código**.

## 3. ¿Cómo se conecta el Backend a la DB?

El Backend es el que habla directamente con la base de datos. El equipo migró el Backend a **Prisma**, manteniendo MariaDB como motor.

Para revisar la conexión hay que analizar cuatro cosas: el `.env.example`, el `schema.prisma`, el archivo que inicializa el cliente, y las migraciones.

### 3.1 Variables que declara el `.env.example` del Backend

A diferencia del `.env.example` del Frontend, el `.env.example` del Backend declara muchísimas más variables agrupadas por bloques:

| Grupo | Variables |
|-------|-----------|
| Servidor | `PORT`, `NODE_ENV`, `FRONTEND_URL`, `BACKEND_URL` |
| Base de datos (formato corto) | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |
| Base de datos (formato largo) | `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD` |
| Base de datos (Prisma) | `DATABASE_URL` |
| MongoDB | `MONGO_URI` |
| Seguridad | `AES_SECRET_KEY`, `AES_IV`, `JWT_SECRET` |
| Mail | `MAIL_USER`, `MAIL_PASSWORD` |
| APIs externas | `DUFFEL_TOKEN`, `SERPAPI_API_KEY` |
| Paginación | `FLIGHT_SEARCH_PAGE_SIZE`, `HOTEL_SEARCH_PAGE_SIZE` |

### 3.2 El schema de Prisma

El archivo `prisma/schema.prisma` es el modelo de datos.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
}
```

- `provider = "mysql"`  significa que la base de datos es MySQL/MariaDB
- El resto del archivo modela todo el negocio de Dittravel: `User`, `Request`, `Receipt`, `Route`, `AuthorizationRule`, `Society`, `SocietyGroup`, `Account`, etc.

Otras cosas que vi son que:
- Los modelos están comentados con `///`, lo que hace que la documentación sea entendible y clara.
- Casi todas las relaciones usan `onDelete: Restrict` y `onUpdate: Restrict` para evitar borrados accidentales.
- Se usan enums (`AuthorizationRule_travel_type`, `Receipt_validation`, `Currency_frequency`, etc.) en lugar de strings sueltos.

Referencia: [Prisma Docs: Schema](https://www.prisma.io/docs/orm/prisma-schema)

### 3.3 La conexión en `lib/prisma.js`

El archivo `lib/prisma.js` es el que crea la instancia del cliente de Prisma. Se ve así:

```js
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import prismaClientPkg from "@prisma/client";

const { PrismaClient } = prismaClientPkg;

const host = process.env.DB_HOST || process.env.DATABASE_HOST;
const user = process.env.DB_USER || process.env.DATABASE_USER;
const password = process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD;
const database = process.env.DB_NAME || process.env.DATABASE_NAME;

const adapter = new PrismaMariaDb({
  host,
  user,
  password,
  database,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

export { prisma };
```

- El pool de conexiones está limitado a **5 conexiones simultáneas** con `connectionLimit: 5`.
- Las variables se leen con un `||` que primero intenta `DB_*` y si no va a `DATABASE_*`. 

### 3.4 Las migraciones

Para ver el historial de migraciones, ejecuté:

```bash
ls prisma/migrations/
```

Encontré **18 carpetas** con timestamps, cada una representando una migración aplicada al schema desde Abril del 2026. Algunos ejemplos:

- `20260408161759_init`: la migración inicial.
- `20260410205127_accounting_tables`: tablas de contabilidad.
- `20260420153904_add_refund_table`: tabla de reembolsos.
- `20260423050147_add_reservation_file_fields`: campos de archivos de reservaciones.

Referencia: [Prisma Docs: Migrations](https://www.prisma.io/docs/orm/prisma-migrate)

## 4. Elementos encontrados

Mientras revisaba la configuración del Frontend me encontré con un par de elementos que no son urgentes ni graves, pero sí entrarían como futuras mejoras para el proyecto.

### 4.1 `PUBLIC_IS_DEV` está declarada pero no se usa

`PUBLIC_IS_DEV` aparece en `.env.example` y en el schema de `astro.config.mjs`, pero al hacer un grep en `src/` no la usa ningún archivo:

```bash
grep -rn "PUBLIC_IS_DEV" src/
```

El comando no devuelve resultados. En lugar de usar esa variable, `apiClient.ts` ocupa `import.meta.env.DEV` y `import.meta.env.MODE`, que son de Vite y de Astro y vienen sin tener que declarar nada.

Es una variable que, aunque no rompe nada, puede llegar a confundir a quien lea el `.env.example` por primera vez pensando que tiene que configurarla.

### 4.2 Línea de `apiClient.ts`

Al revisar el archivo encontré esta línea:

```ts
const isDevelopment = [import.meta.env.DEV](http://import.meta.env.DEV) || import.meta.env.MODE === 'development';
```

tiene una sintaxis `[ ... ](url)` de un **link de Markdown**, no de TypeScript. 

TypeScript no marca error o algo similar porque, técnicamente, `[algo aquí]` es válido y el resto se interpreta como una expresión válida. El problema es que `[import.meta.env.DEV]` siempre es un array de un elemento, así que `isDevelopment` da `true` sin importar el entorno.

No causa daño en local porque ese bloque desactiva validaciones que ya queríamos desactivadas en desarrollo, pero es algo que vale la pena arreglar en el futuro.

### 4.3 `PUBLIC_API_BASE_URL` se lee en 13 archivos diferentes

Como se menciona en la Sección 1.4, la variable `PUBLIC_API_BASE_URL` se lee directamente en 13 archivos distintos. El tema es que ya existe la constante `BASE_URL` en `apiClient.ts`:

```ts
const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'https://localhost:3000/api';
```

Pero el resto de archivos no la usa, sino que vuelven a leer `import.meta.env.PUBLIC_API_BASE_URL` directamente.

## 5. Recomendaciones

A partir de lo encontrado en la Sección 4, propongo tres cambios para mejorar la configuración del Frontend. Todas son relativamente de bajo esfuerzo, aparte pueden hacerse como sub-tasks!

**(CR significa Mejora de Configuración)**

| ID | Qué hacer |
|----|-----------|
| MC-1 | Eliminar `PUBLIC_IS_DEV` de `.env.example` y de `astro.config.mjs`, ya que ningún archivo del Frontend la usa. |
| MC-2 | Corregir la sintaxis de `apiClient.ts` (lo de la línea que usa .md en lgar de .ts) para que `isDevelopment` evalúe correctamente según el entorno. |
| MC-3 | Refactorizar los 13 archivos que leen `PUBLIC_API_BASE_URL` directamente para que importen `BASE_URL` desde `apiClient.ts`. |

## 6. Conclusión

A mi parecer nuestra configuración del Frontend está bien armada: las variables de entorno están separadas en sus archivos correspondientes, no hay cosas hardcodeadas, y todas las llamadas al Backend pasan por `PUBLIC_API_BASE_URL` sin tema.

Los elementos que encontré (los la Sección 4) no son urgentes y tampoco es que rompan el sistema, pero sí son detalles que valdrían la pena arreglar para que el proyecto sea más fácil de mantener a la larga (sobre todo son buenas prácticas). Las tres recomendaciones que propuse (MC-1, MC-2, MC-3) son cambios que pueden hacerse en commits separados sin afectar el funcionamiento actual.

---

### Referencias
- [Astro Docs: Environment Variables](https://docs.astro.build/en/guides/environment-variables/)
- [Vite Docs: basic-ssl plugin](https://github.com/vitejs/vite-plugin-basic-ssl)
- [Prisma Docs: Schema](https://www.prisma.io/docs/orm/prisma-schema)
- [Prisma Docs: Migrations](https://www.prisma.io/docs/orm/prisma-migrate)