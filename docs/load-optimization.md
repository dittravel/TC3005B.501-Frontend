# Optimización de Carga de Componentes y Recursos Iniciales
**Task:** Optimización de carga de componentes y recursos iniciales
**Autor:** Luis Emilio Veledíaz Flores - A01029829
**Fecha:** 04/05/2026

---

## 1. Contexto

Esta task se basó directamente en el análisis de renderizado (`rendering-analysis.md`), el cual identificó cinco mejoras de rendimiento (MR-1 a MR-5) para el frontend.

Este documento describe cuáles se implementaron, cuáles no, y por qué.
 
El estado del frontend antes de esta task era:
 
- Modo de renderizado: `server` (SSR con `@astrojs/node`)
- ~40 componentes con directiva `client:only="react"`
- 0 páginas estáticas pregeneradas
- 1 warning de import no utilizado en el build: `Check` de `@mui/icons-material`


## 2. MRs implementadas
### MR-1 — Eliminar import Check no utilizado en TravelSearchCard.tsx

**Archivo modificado:** `src/components/Cards/TravelSearchCard.tsx`
 
En el análisis previo detectamos que `TravelSearchCard.tsx` importaba el ícono `Check` de `@mui/icons-material` sin usarlo en ningún lugar. Esto generaba el siguiente warning:
 
```
[WARN] [vite] "Check" is imported from external module "@mui/icons-material"
but never used in "src/components/Cards/TravelSearchCard.tsx"
```
 
Se eliminó la línea:
```ts
import { Check } from '@mui/icons-material';
```
 
El warning desapareció. El tamaño de `createSvgIcon.js` (74.44 kB) no se redujo porque otros 6 archivos del proyecto sí usan íconos de MUI activamente (`LoginForm`, `ResetPasswordForm`, `NotificationsButton`, `MenuButton`, `ThemeButton`, `Dashboard`).
 
### MR-2 — Prerender de páginas de autenticación

**Archivos modificados:**
- `src/pages/login.astro`
- `src/pages/forgot-password.astro`
- `src/pages/reset-password.astro`
- `src/components/Forms/ResetPasswordForm.tsx`

Las tres páginas son formularios que no dependen de datos del servidor para mostrarse. Al estar en modo `server`, se generaban en el servidor en cada visita. Convertirlas a páginas estáticas (`prerender = true`) significa que se generan una sola vez y el servidor las entrega como HTMLs directamente.
 
**Hubo un fix requerido en `ResetPasswordForm.tsx`** porque la página tenía `window.location.search` ejecutándose al nivel raíz (fuera de cualquier `useEffect`), lo que hubiera roto el frontend porque `window` no existe en el servidor. Por eso, se movió dentro de un `useEffect`:
 
```ts
// Antes
const token = new URLSearchParams(window.location.search).get("token") ?? "";
 
// Después
const [token, setToken] = useState("");
useEffect(() => {
  setToken(new URLSearchParams(window.location.search).get("token") ?? "");
}, []);
```
 
En las tres páginas se agregó `export const prerender = true`.
 
Al correr `npm run build` vemos:
 
```
prerendering static routes 
10:42:59 ▶ src/pages/forgot-password.astro
10:42:59   └─ /forgot-password/index.html
10:42:59 ▶ src/pages/login.astro
10:42:59   └─ /login/index.html
10:42:59 ▶ src/pages/reset-password.astro
10:42:59   └─ /reset-password/index.html
10:42:59 ✓ Completed in 19ms.
```
 
Nos dice que **las tres páginas ahora aparecen como rutas estáticas pregeneradas**, confirmando que el cambio fue exitoso.

### MR-4 — Reemplazar client:only por client:load en páginas con fetch de servidor

**Archivos modificados:**
- `src/pages/solicitudes.astro`
- `src/pages/autorizaciones.astro`
- `src/pages/comprobaciones.astro`
- `src/pages/cotizaciones.astro`
- `src/pages/atenciones.astro`
- `src/pages/bitacora.astro`

Estas páginas hacen un `apiRequest` en el frontmatter de Astro y luego pasan los datos obtenidos como props con `client:only="react"`. El problema con `client:only` es que el servidor manda un HTML vacío al navegador y el componente se construye completamente desde cero en el cliente.
 
`client:load` en cambio renderiza el componente en el servidor (generando HTMLs visibles) y luego lo inicializa en el cliente para hacerlo interactivo. El resultado es que el usuario ve contenido inmediatamente.
 
Antes de hacer el cambio se verificó que ninguno de los componentes afectados usara `window` o `document` fuera de `useEffect` o event handlers, lo cual hubiera causado errores al renderizarse. Todos los usos encontrados estaban dentro de funciones o efectos, confirmando que el cambio era seguro.
 
## 3. MRs descartadas
### MR-3 — Convertir componentes a .astro

El análisis original identificó cinco componentes como candidatos para convertir a `.astro` basándose en su tamaño: `CreateRoleForm`, `ExpensesForm`, `Card`, `Tag` y `Checkbox`.
 
Tras una inspección manual de cada uno, ninguno resultó convertible:
 
| Componente | Razón para no convertir |
|---|---|
| `CreateRoleForm.tsx` | Usa `useState` y `useEffect` porque es un formulario interactivo con llamadas al backend. |
| `ExpensesForm.tsx` | Usa `useState` y `useEffect` extensamente porque maneja archivos, tipo de cambio y validación CFDI. |
| `Checkbox.tsx` | Recibe `onChange` como prop. Se importa dentro de componentes React como `CreateRoleForm` y `ExpensesForm`. Los componentes `.astro` no pueden importarse dentro de archivos `.tsx`. |
| `Card.tsx` | Se importa en al menos 10 archivos `.tsx` diferentes. Convertirlo a `.astro` puede romper todos esos usos. |
| `Tag.tsx` | Se importa en múltiples archivos `.tsx`. Es la misma restricción que con `Card`. |
 
Esta MR estaba explícitamente marcada como **"requiere inspección manual"** en el análisis previamente hecho. La inspección confirmó que ninguno es apto para el cambio.

### MR-5 — Eliminar imports de useMemo no utilizados

En el análisis original reportamos 20 archivos que tenían `useMemo` importado pero no utilizado. Al verificar el estado más reciente del repositorio con:
 
```bash
grep -rn "useMemo" src/ --include="*.ts" --include="*.tsx"
```
 
Se encontró que `useMemo` **sí se usa activamente** en los archivos donde aparece (`Requests.tsx` y `BitacoraTable.tsx`). El equipo ya había limpiado esos imports. Por lo que esta MR ya no aplica.

## 4. Comparativa

Ambos builds (antes y después de los cambios) tienen los mismos tamaños de archivos `.js`. Esto es esperado porque los cambios realizados no modifican qué JavaScript se manda al navegador, sino cuándo y cómo se inicializa.
 
| Archivo | Tamaño (antes y después) |
|---|---|
| `client.js` (React runtime) | 186.62 kB |
| `createSvgIcon.js` (MUI icons) | 74.44 kB |
| `TravelRequestForm.js` | 18.32 kB |
| `TravelSearchCard.js` | 14.85 kB |
| `ExpensesForm.js` | 10.12 kB |
 
El impacto real de los cambios se va a ver e el runtime, no en el tamaño de los archivos.
 
- Las páginas de autenticación ahora se entregan como HTML estático sin procesamiento del servidor.
- Las 6 páginas con `client:load` ahora envían HTML con contenido visible desde el servidor, en lugar de una página en blanco mientras React carga.

Para medir el impacto en tiempos de carga reales podríamos usar Lighthouse o WebPageTest con el servidor corriendo.

### Referencias
- Astro. (s. f.). *On-demand rendering*. Docs. https://docs.astro.build/en/guides/on-demand-rendering/
- Astro. (s. f.). *Rendering modes*. Docs. https://v4.docs.astro.build/en/basics/rendering-modes/
- Astro. (s. f.). *Template directives reference*. Docs. https://docs.astro.build/en/reference/directives-reference/#client-directives