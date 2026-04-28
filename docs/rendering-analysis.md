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

Astro sabe en donde va a correr el servidor. Para eso existen los adaptadores, que son paquetes que le dicen a Astro cómo comportarse según el entorno. El proyecto usa `@astrojs/node`, lo que significa que el servidor que ejecuta el proyecto es Node.js.

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

En Astro los componentes se renderizan por dejecto en el servidor y el navegador recibe HTMLs. Para que un componente sea interactivo en el navegador, se le debe agregar una directiva para inicialización que le dice a Astro cuándo y cómo enviar el componente al navegador.

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

## 3 Archivos más pesados generados

## 4. ¿Qué componentes podrían ser más ligeros?

## 5. Recomendaciones