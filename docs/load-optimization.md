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
### MR-5 — Eliminar imports de useMemo no utilizados

## 4. Comparativa