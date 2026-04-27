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

## 3 Archivos más pesados generados

## 4. ¿Qué componentes podrían ser más ligeros?

## 5. Recomendaciones