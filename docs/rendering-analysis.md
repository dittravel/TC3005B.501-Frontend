# Análisis del Proceso de Renderizado de Componentes en Astro
**Task:** Análisis del proceso de renderizado de componentes en Astro
**Autor:** Luis Emilio Velediaz Flores - A01029829
**Fecha:** 25/04/2026

---

## 1. ¿Cómo está configurado el proyecto?
Para entender la forma en la que el Frontend funciona, se debe analizar la configuración del framework principal del proyecto: Astro. Esta información se obtuvo ejecutando el comando `npm run build` en la raiz del Frontend, que compila todo el proyecto y muestra un reporte de cómo está configurado y qué es lo que genera.

### 1.1 Modo de Renderización: Servidor (SSR)

Astro tiene tres modos de renderización posibles:

- **static:** Genera todas las páginas como archivos HTML al momento
  de compilar. El servidor solo entrega archivos, no procesa nada.
- **hybrid:** Combinación de los dos modos. Algunas páginas son estáticas y
  otras se generan en el servidor.
- **server:** Todas las páginas se generan en el servidor cada vez que
  un usuario las solicita (también llamado Server Side Rendering).

Referencia: [Astro Docs: Rendering Modes](https://v4.docs.astro.build/en/basics/rendering-modes/)


El proyecto está configurado en modo `server`, lo que se confirmó con estas líneas del output de `npm run build`:

- `[build] output: "server"`
- `[build] mode: "server"`

Esto significa que cuando un usuario entra a cualquier página, el servidor de Node.js la genera en ese momento y la manda al navegador.


### 1.2 Adaptador: @astrojs/node

Astro **no** sabe en donde va a correr el servidor. Para eso existen los adaptadores, que son paquetes que le dicen a Astro cómo comportarse según el entorno. El proyecto usa `@astrojs/node`, lo que significa que el servidor que ejecuta el proyecto es Node.js.

Esto se confirmó con esta línea del output de `npm run build`:

- `[build] adapter: @astrojs/node`


### 1.3 Métricas del build

**DISCLAIMER: Estos valores vienen de utilizar `npm run build` en la raíz del Frontend, en una Macbook Air de 16GB y procesador M4**

| Parámetro | Valor | ¿Qué significa? |
|-----------|-------|-----------------|
| Tiempo de compilación | ~4.21s | Lo que tardó en compilar todo el proyecto. |
| Módulos procesados | 11,182 | Archivos que Vite (el compilador interno de Astro) procesó para generar todo. |
| Páginas estáticas pre-generadas | 0 | Ninguna página se pregeneró como HTML estático. |

Lo más importante aquí es que hay **0 páginas estáticas**. Esto se confirmó con esta línea del output de `npm run build`:

- `prerendering static routes Completed in 25ms.`

Se completó en 25ms porque no había nada que pregenerar. Páginas como `login`, `forgot-password` y `reset-password` no necesitan datos del servidor para mostrarse porque son formularios. Sin embargo, al estar en modo `server`, se generan en el servidor cada vez que alguien las visita.

## 2. ¿Cuántos componentes se cargan en el navegador y cuáles son?

En Astro los componentes se renderizan por defecto en el servidor y el navegador recibe HTMLs. Para que un componente sea interactivo en el navegador, se le debe agregar una directiva para inicialización que le dice a Astro cuándo y cómo enviar el componente al navegador.

Algunas directivas disponibles pueden ser:
- **`client:load`** — El componente se renderiza en el servidor y se
  envía al navegador para hacerse interactivo inmediatamente al cargar
  la página.
- **`client:only="react"`** — El componente se renderiza ÚNICAMENTE en
  el navegador. El servidor manda un HTML vacío y el navegador lo construye
  desde cero con JavaScript.
- **`client:idle`** — Se inicializa cuando el navegador termina sus tareas
  principales y está inactivo.
- **`client:visible`** — Se inicializa cuando el componente entra a
    la parte visible de la pantalla.

Referencia: [Astro Docs: Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)

Esta información se obtuvo ejecutando el siguiente comando en la raíz
del Frontend:

```bash
grep -r "client:" src/ --include="*.astro" --include="*.tsx"
```

Este comando busca de forma recursiva dentro de la carpeta `src/` todas las ocurrencias del texto `client:` en archivos `.astro` y `.tsx`, que son los dos tipos de archivo donde se usan estas directivas.

Y para contar el total de directivas:

```bash
grep -r "client:" src/ --include="*.astro" --include="*.tsx" | wc -l
```

### Resultados

Se encontraron **48 directivas** en total, distribuidas así:

| Directiva | Cantidad | Comportamiento |
|-----------|----------|----------------|
| `client:only="react"` | ~40 | Servidor manda HTMLs vacíos, el navegador construye todo |
| `client:load` | ~8 | Se renderiza en servidor y se inicializan inmediatamente |
| `client:idle` | 0 | No se usa en el proyecto |
| `client:visible` | 0 | No se usa en el proyecto |

La **mayoría de los componentes interactivos usan `client:only`**, lo que significa que las páginas llegan vacías al navegador y todo el trabajo de construcción recae en el cliente.

#### Lista de componentes por archivos

A continuación se enlistan la cantidad de directivas (y sus tipos) que hay en los archivos .astro:

##### Componentes (src/components/)

| Archivo | Directiva |
|-----------|---------|
| Forms/ExpensesForm.astro | `client:only="react"` |
| Layout/PageHeader.astro | `client:load` |
| Cards/RequestDraft.astro | `client:only="react"` |
| Cards/RequestSection.astro | `client:only="react"` |
| Cards/RequestDetail.astro | `client:load` (x2) |
| Table/TableFallback.astro | `client:only="react"` |
| Actions/RequestApproval.astro | `client:only="react"` (x2) |

##### Páginas (src/pages/)

| Archivo | Directiva |
|-----------|---------|
| `login.astro` | `client:only="react"` |
| `forgot-password.astro` | `client:only="react"` |
| `reset-password.astro` | `client:only="react"` |
| `dashboard.astro` | `client:only="react"` |
| `solicitudes.astro` | `client:only="react"` |
| `autorizaciones.astro` | `client:only="react"` |
| `crear-solicitud.astro` | `client:only="react"` |
| `crear-rol.astro` | `client:only="react"` |
| `roles.astro` | `client:only="react"` (x2) |
| `bitacora.astro` | `client:only="react"` |
| `comprobar-gastos.astro` | `client:only="react"` |
| `comprobaciones.astro` | `client:only="react"` |
| `cotizaciones.astro` | `client:only="react"` |
| `atenciones.astro` | `client:only="react"` |
| `politicas-reembolso.astro` | `client:only="react"` |
| `reembolsos.astro` | `client:load` |
| `usuarios.astro` | `client:only="react"` |
| `crear-usuario.astro` | `client:load` |
| `perfil-usuario.astro` | `client:load` |
| `reglas-autorizacion.astro` | `client:load` |
| `importar-datos.astro` | `client:load` |
| `sociedades.astro` | `client:load` (x2) |
| `exportar-datos-contables.astro` | `client:load` |
| `editar-usuario/[id].astro` | `client:load` |
| `editar-regla/[id].astro` | `client:only="react"` |
| `crear-regla.astro` | `client:only="react"` |
| `atender-solicitud/[id].astro` | `client:only="react"` |
| `cotizar-solicitud/[id].astro` | `client:only="react"` |
| `comprobar-gastos/[id].astro` | `client:only="react"` |
| `comprobar-solicitud/[id].astro` | `client:only="react"` |
| `completar-draft/[id].astro` | `client:only="react"` |
| `editar-comprobante/[receiptId]/[id].astro` | `client:only="react"` |
| `editar-solicitud/[id].astro` | `client:only="react"` |
| `editar-rol/[id].astro` | `client:only="react"` |
| `grupos-sociedades/[id].astro` | `client:load` |
| `resubir-comprobante/[id].astro` | `client:only="react"` |
| `sociedades/[id].astro` | `client:load` |

## 3. Archivos más pesados generados

Cuando se ejecuta `npm run build`, Astro y Vite procesan todos los componentes y generan archivos `.js` que se mandan al navegador. 
Entre más pesados sean estos archivos, más tiempo le toma al navegador descargarlos y ejecutarlos antes de mostrarlos en pantalla.

El listado de estos archivos se obtuvo con el siguiente comando:

```bash
ls -lh dist/client/_astro/*.js | sort -k5 -rh | head -20
```

Este comando lista todos los archivos `.js` generados dentro de la carpeta `dist/client/_astro/`, los ordena de mayor a menor por tamaño, y muestra los 20 más pesados.

### Resultados

| Archivo | Tamaño | ¿Qué es? |
|---------|--------|----------|
| `client.js` | **179.41 kB** | Runtime de React |
| `createSvgIcon.js` | **74.45 kB** | Íconos de MUI |
| `TravelRequestForm.js` | 18.32 kB | Formulario de solicitud de viaje |
| `TravelSearchCard.js` | 14.85 kB | Tarjeta de búsqueda de viajes |
| `ExpensesForm.js` | 10.12 kB | Formulario de gastos |
| `ReceiptsList.js` | 8.75 kB | Lista de comprobantes |
| `index.js` | 8.39 kB | Punto de entrada |
| `RoleConfigurationForm.js` | 8.38 kB | Configuración de roles |
| `AuthRulesList.js` | 7.26 kB | Lista de reglas de autorización |
| `RefundPolicyForm.js` | 6.84 kB | Políticas de reembolso |
| `AdminUserForm.js` | 6.20 kB | Formulario de usuarios |
| `ImportDataForm.js` | 5.77 kB |Importación de datos |
| `AuthRuleForm.js` | 5.67 kB | Formulario de regla de autorización |
| `Dashboard.js` | 5.46 kB | Dashboard principal |

El segundo archivo más pesado (74 kB) corresponde a los íconos de MUI (Material UI), una librería de componentes visuales. Durante el build, Astro arrojó esta advertencia:
- `[WARN] "Check" is imported from external module "@mui/icons-material" but never used in "src/components/Cards/TravelSearchCard.tsx"`

`TravelSearchCard.tsx` importa un ícono llamado `Check` que **nunca usa**. Esto fuerza al compilador a incluir todo el paquete de íconos de MUI al final, aunque solo se necesite uno. **Eliminar ese import podría reducir el peso de ese archivo.**

## 4. ¿Qué componentes podrían ser más ligeros?

Como se mencionó en la Sección 2, `client:only="react"` hace que un componente se construya completamente en el navegador. Esto funciona cuando el componente necesita interactividad, como formularios o cosas que se ejecutan en el navegador.

Pero, si un componente solo muestra información, no necesita ser un componente de React interactivo, porque podría ser un componente `.astro`, que se renderiza únicamente en el servidor y no manda nada de JavaScript al navegador.

Una forma para poder identificar si un componente de React necesita ejecutarse en el navegador es revisar si usa alguno de estos elementos:

- **`useState`**: maneja un estado interno que cambia
- **`useEffect`**: ejecuta algo cuando el componente se actualiza
- **`useRef`**: referencia directa a un elemento
- **`useContext`**: usa un contexto global

Si un componente `.tsx` no usa ninguno de estos, podría convertirse a `.astro` y eliminarse del lado del cliente.

Referencia: [Astro Docs: UI Frameworks](https://docs.astro.build/en/guides/framework-components/#hydrating-interactive-components)

### Posibles componentes a cambiar

Los siguientes componentes fueron identificados como **posibles** elementos para convertirse en `.astro`, basándose en su tamaño. 

**Cabe y es muy importante aclarar que, antes de hacer esto, los archivos requieren una inspección manual para confirmarse.**

| Componente | Tamaño|
|------------|-----------------|
| `CreateRoleForm.js` | 0.26 kB |
| `ExpensesForm.js` | 0.38 kB |
| `Card.js` | 0.58 kB |
| `Tag.js` | 0.86 kB |
| `Checkbox.js` | 1.20 kB |

### ¿Qué podría pasar si los convertimos?

Si alguno de estos componentes se convierte a `.astro`, ese archivo desaparece completamente del lado del cliente. Por ende, el navegador recibe menos archivos de JavaScript, lo que podría significa una página que carga y se muestra más rápido.

## 5. Recomendaciones

En base a todo el análisis realizado previamente, a continuación propongo 4 acciones que se pueden hacer para mejorar el rendimiento del frontend. Algunas resultan sencillas porque solo involucran eliminar algo, pero otras involucran revisar los componentes listados en la Sección 4.

| ID | Qué hacer |
|---|-----------|
| MR-1 | Eliminar el import de `Check` no utilizado en `TravelSearchCard.tsx`. |
| MR-2 | Hacer `login`, `forgot-password` y `reset-password` como páginas estáticas. |
| MR-3 | Revisar los componentes listados en la Sección 4 y convertir a `.astro` los que sean aptos para el cambio. |
| MR-4 | Cambiar `client:only` por `client:load` en páginas que sí dependen de datos del servidor. |

### Detección de imports no utilizados

Al correr el comando `npm run build` mencionado en la Sección 3, Astro
emitió advertencias de un `useMemo` importado pero no utilizado en los
siguientes 20 archivos:

```
[WARN] [vite] "useMemo" is imported from external module "react" but never used in:
    - "src/components/Buttons/Button.tsx"
    - "src/components/Forms/ExportAccountabilityForm.tsx"
    - "src/components/Table/Pagination.tsx"
    - "src/components/Utils/Toast.tsx"
    - "src/components/Forms/AdminUserForm.tsx"
    - "src/components/Forms/SocietyGroupForm.tsx"
    - "src/components/Forms/SocietyForm.tsx"
    - "src/components/Buttons/UserMenu.tsx"
    - "src/components/Buttons/ImportDataButton.tsx"
    - "src/components/Forms/UserProfile.tsx"
    - "src/components/Forms/ConfirmationDocumentForm.tsx"
    - "src/components/Modals/DeleteAuthRuleModal.tsx"
    - "src/hooks/useAuthRuleForm.ts"
    - "src/components/Modals/ModalWrapper.tsx"
    - "src/components/Modals/UltimateWrapper.tsx"
    - "src/components/Forms/HotelSearchForm.tsx"
    - "src/components/Forms/FlightSearchForm.tsx"
    - "src/components/Cards/TravelSearchCard.tsx"
    - "src/components/Forms/DefaultAuthRule.tsx"
    - "src/components/RequestsLists/AuthRulesList.tsx"

[WARN] [vite] "Check" is imported from external module "@mui/icons-material" but never used in:
    - "src/components/Cards/TravelSearchCard.tsx"
```

Ahora, en base a esto, otra mejora posible sería:

| ID | Qué hacer |
|----|-----------|
| MR-5 | Eliminar los imports de `useMemo` no utilizados en los archivos listados previamente. |