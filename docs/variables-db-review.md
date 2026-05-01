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
.env  →  import.meta.env  →  apiClient.ts (BASE_URL)  →  fetch()  →  Backend
```

### 2.1 La constante `BASE_URL` en `apiClient.ts`

`src/utils/apiClient.ts` es el archivo encargado de mover las llamadas HTTP al Backend. Define la constante `BASE_URL` así (línea 48):

```ts
const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'https://localhost:3000/api';
```

Lo importante de esta línea es que si la variable no está definida, cae en `'https://localhost:3000/api'`.

### 2.2 SSL local

`astro.config.mjs` incluye el plugin `@vitejs/plugin-basic-ssl`, lo que hace que el Frontend funcione sobre **HTTPS en localhost** con un certificado autofirmado. El Backend también espera HTTPS en `https://localhost:3000`, así que ambos lados están alineados.

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

## 4. Elementos encontrados

## 5. Recomendaciones

## 6. Conclusión